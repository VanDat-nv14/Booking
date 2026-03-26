package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.DanhGiaRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import com.example.bookingkhachsan.repository.PhieuDatPhongRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final PhieuDatPhongRepository bookingRepository;
    private final DanhGiaRepository danhGiaRepository;
    private final KhachSanRepository khachSanRepository;

    // ── Request DTO ──────────────────────────────
    @Data
    public static class UserRequest {
        @NotBlank(message = "Họ tên không được để trống")
        private String hoTen;

        @NotBlank @Email(message = "Email không hợp lệ")
        private String email;

        private String matKhau;      // optional khi update

        private String sdt;

        @Pattern(regexp = "^(Admin|HotelManager|User)$",
                 message = "Chức vụ phải là Admin, HotelManager hoặc User")
        private String chucVu = "User";

        private Boolean trangThai = true;
    }

    // ── Response DTO cho Báo Cáo Doanh Thu ────────────────
    @Data
    public static class RevenueReportItem {
        private Integer khachSanId;
        private String tenKhachSan;
        private Integer tongSoDon;
        private BigDecimal tongDoanhThu;
    }

    @Data
    public static class RevenueReportResponse {
        private BigDecimal tongDoanhThuToanHeThong;
        private List<RevenueReportItem> doanhThuTheoKhachSan;
    }

    // ── GET all users ────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<NguoiDung>> getAllUsers() {
        return ResponseEntity.ok(repository.findAll());
    }

    // ── GET all bookings ─────────────────────────
    @GetMapping("/bookings")
    public ResponseEntity<List<com.example.bookingkhachsan.entity.PhieuDatPhong>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAllByOrderByNgayDatDesc());
    }

    // ── GET Báo Cáo Doanh Thu ────────────────────
    @GetMapping("/reports/revenue")
    public ResponseEntity<RevenueReportResponse> getRevenueReport() {
        List<com.example.bookingkhachsan.entity.PhieuDatPhong> allBookings = bookingRepository.findAll();
        
        BigDecimal globalTotal = BigDecimal.ZERO;
        Map<String, RevenueReportItem> hotelRevenueMap = new HashMap<>();

        for (com.example.bookingkhachsan.entity.PhieuDatPhong booking : allBookings) {
            // Chi tinh doanh thu cho cac don da CheckedOut hoac Completed
            if ("CheckedOut".equals(booking.getTrangThai()) || "Completed".equals(booking.getTrangThai())) {
                BigDecimal thanhTien = booking.getThanhTien() != null ? booking.getThanhTien() : BigDecimal.ZERO;
                globalTotal = globalTotal.add(thanhTien);

                String hotelName = "Unknown";
                Integer hotelId = null;
                if (booking.getPhong() != null && booking.getPhong().getKhachSan() != null) {
                    hotelId = booking.getPhong().getKhachSan().getId();
                    hotelName = booking.getPhong().getKhachSan().getTen();
                }

                // Use hotelId as the key if available, otherwise hotelName
                String key = hotelId != null ? hotelId.toString() : hotelName;
                RevenueReportItem item = hotelRevenueMap.getOrDefault(key, new RevenueReportItem());
                if (item.getTenKhachSan() == null) {
                    item.setKhachSanId(hotelId);
                    item.setTenKhachSan(hotelName);
                    item.setTongSoDon(0);
                    item.setTongDoanhThu(BigDecimal.ZERO);
                }
                item.setTongSoDon(item.getTongSoDon() + 1);
                item.setTongDoanhThu(item.getTongDoanhThu().add(thanhTien));
                hotelRevenueMap.put(key, item);
            }
        }

        RevenueReportResponse response = new RevenueReportResponse();
        response.setTongDoanhThuToanHeThong(globalTotal);
        response.setDoanhThuTheoKhachSan(hotelRevenueMap.values().stream().collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    // ── GET user by id ───────────────────────────
    @GetMapping("/users/{id}")
    public ResponseEntity<NguoiDung> getUserById(@PathVariable Integer id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── POST create user ─────────────────────────
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequest req) {
        if (repository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email đã tồn tại!"));
        }
        NguoiDung user = new NguoiDung();
        user.setHoTen(req.getHoTen());
        user.setEmail(req.getEmail());
        user.setMatKhau(passwordEncoder.encode(
                req.getMatKhau() != null && !req.getMatKhau().isBlank() ? req.getMatKhau() : "123456"));
        user.setSdt(req.getSdt());
        user.setChucVu(req.getChucVu() != null ? req.getChucVu() : "User");
        user.setTrangThai(req.getTrangThai() != null ? req.getTrangThai() : true);
        user.setProvider(NguoiDung.Provider.LOCAL); // fix: enum, not String
        return ResponseEntity.ok(repository.save(user));
    }

    // ── PUT update user info ──────────────────────
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
            @Valid @RequestBody UserRequest req) {
        return repository.findById(id).map(user -> {
            user.setHoTen(req.getHoTen());
            user.setSdt(req.getSdt());
            user.setChucVu(req.getChucVu() != null ? req.getChucVu() : user.getChucVu());
            user.setTrangThai(req.getTrangThai() != null ? req.getTrangThai() : user.getTrangThai());
            // Doi mat khau chi khi duoc cung cap
            if (req.getMatKhau() != null && !req.getMatKhau().isBlank()) {
                user.setMatKhau(passwordEncoder.encode(req.getMatKhau()));
            }
            return ResponseEntity.ok(repository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── PUT role ──────────────────────────────────
    @PutMapping("/users/{id}/role")
    public ResponseEntity<NguoiDung> updateUserRole(
            @PathVariable Integer id,
            @RequestParam @Pattern(regexp = "^(Admin|HotelManager|User)$") String role) {
        return repository.findById(id).map(user -> {
            user.setChucVu(role);
            return ResponseEntity.ok(repository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── PUT toggle status ─────────────────────────
    @PutMapping("/users/{id}/status")
    public ResponseEntity<NguoiDung> toggleUserStatus(@PathVariable Integer id) {
        return repository.findById(id).map(user -> {
            user.setTrangThai(!Boolean.TRUE.equals(user.getTrangThai()));
            return ResponseEntity.ok(repository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE user ────────────────────────────────
    // Có booking/review/manager → soft-delete + anonymize (giữ lịch sử giao dịch)
    // Không có dữ liệu liên kết → hard-delete (trước đó bỏ liên kết manager nếu có)
    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        return repository.findById(id).map(user -> {
            long bookingCount = bookingRepository.findByNguoiDungId(id).size();
            long reviewCount = danhGiaRepository.countByNguoiDungId(id);
            boolean isManager = khachSanRepository.findByNguoiQuanLy_Id(id).isPresent();

            boolean hasLinkedData = bookingCount > 0 || reviewCount > 0 || isManager;

            if (isManager) {
                khachSanRepository.setNguoiQuanLyNullByManagerId(id);
            }

            if (hasLinkedData) {
                user.setTrangThai(false);
                user.setEmail("deleted_" + id + "@anon.local");
                user.setHoTen("Người dùng đã xóa");
                user.setSdt(null);
                user.setMatKhau(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                repository.save(user);
                String reason = java.util.stream.Stream.of(
                    bookingCount > 0 ? bookingCount + " đặt phòng" : null,
                    reviewCount > 0 ? reviewCount + " đánh giá" : null,
                    isManager ? "quản lý khách sạn" : null
                ).filter(java.util.Objects::nonNull).collect(Collectors.joining(", "));
                return ResponseEntity.ok(Map.of(
                    "message", "Tài khoản đã bị vô hiệu hóa và ẩn thông tin (có " + reason + "). Lịch sử giao dịch được giữ nguyên.",
                    "softDeleted", true
                ));
            } else {
                repository.deleteById(id);
                return ResponseEntity.ok(Map.of(
                    "message", "Xóa người dùng thành công!",
                    "softDeleted", false
                ));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
