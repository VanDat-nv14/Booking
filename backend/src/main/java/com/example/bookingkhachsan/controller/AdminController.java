package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.DanhGiaRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import com.example.bookingkhachsan.repository.PhieuDatPhongRepository;
import com.example.bookingkhachsan.repository.ChiTietSuDungDVRepository;
import com.example.bookingkhachsan.repository.PhuThuRepository;
import com.example.bookingkhachsan.dto.BookingDto;
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
    private final ChiTietSuDungDVRepository ctsdRepository;
    private final PhuThuRepository phuThuRepository;
    private final com.example.bookingkhachsan.service.BookingService bookingService;

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
        private List<BookingDto.MonthlyRevenue> monthlyStats;
        private List<BookingDto.SurchargeDetail> surcharges;
    }

    // ── GET all users ────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<NguoiDung>> getAllUsers() {
        return ResponseEntity.ok(repository.findAll());
    }

    // ── GET all bookings ─────────────────────────
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto.BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ── GET Báo Cáo Doanh Thu ────────────────────
    @GetMapping("/reports/revenue")
    public ResponseEntity<RevenueReportResponse> getRevenueReport(@RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : java.time.LocalDate.now().getYear();

        List<com.example.bookingkhachsan.entity.PhieuDatPhong> allBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getNgayDen() != null && b.getNgayDen().getYear() == targetYear)
                .filter(b -> "Completed".equals(b.getTrangThai()) || "CheckedOut".equals(b.getTrangThai()))
                .collect(Collectors.toList());

        List<Integer> bookingIds = allBookings.stream().map(com.example.bookingkhachsan.entity.PhieuDatPhong::getId).collect(Collectors.toList());

        List<com.example.bookingkhachsan.entity.ChiTietSuDungDV> ctsdList = ctsdRepository.findAll().stream()
                .filter(ct -> ct.getPhieuDatPhong() != null && bookingIds.contains(ct.getPhieuDatPhong().getId()))
                .collect(Collectors.toList());

        List<com.example.bookingkhachsan.entity.PhuThu> ptList = phuThuRepository.findAll().stream()
                .filter(pt -> pt.getPhieuDatPhong() != null && bookingIds.contains(pt.getPhieuDatPhong().getId()))
                .collect(Collectors.toList());

        Map<Integer, BookingDto.MonthlyRevenue> monthlyMap = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthlyMap.put(i, BookingDto.MonthlyRevenue.builder()
                    .month(targetYear + "-" + String.format("%02d", i))
                    .roomRevenue(BigDecimal.ZERO)
                    .serviceRevenue(BigDecimal.ZERO)
                    .surchargeRevenue(BigDecimal.ZERO)
                    .totalRevenue(BigDecimal.ZERO)
                    .build());
        }

        BigDecimal globalTotal = BigDecimal.ZERO;
        Map<String, RevenueReportItem> hotelRevenueMap = new HashMap<>();

        for (com.example.bookingkhachsan.entity.PhieuDatPhong b : allBookings) {
            int month = b.getNgayDen().getMonthValue();
            BookingDto.MonthlyRevenue mr = monthlyMap.get(month);

            long soNgay = (b.getNgayDen() != null && b.getNgayDi() != null)
                    ? java.time.temporal.ChronoUnit.DAYS.between(b.getNgayDen(), b.getNgayDi()) : 1;
            if (soNgay < 1) soNgay = 1;

            BigDecimal giaPhongMot = b.getGiaPhongGoc() != null ? b.getGiaPhongGoc() : (b.getThanhTien() != null ? b.getThanhTien() : BigDecimal.ZERO);
            BigDecimal tienPhong = giaPhongMot.multiply(BigDecimal.valueOf(soNgay));

            mr.setRoomRevenue(mr.getRoomRevenue().add(tienPhong));
            mr.setTotalRevenue(mr.getTotalRevenue().add(tienPhong));
            globalTotal = globalTotal.add(tienPhong);

            String hotelName = "Unknown";
            Integer hotelId = null;
            if (b.getPhong() != null && b.getPhong().getKhachSan() != null) {
                hotelId = b.getPhong().getKhachSan().getId();
                hotelName = b.getPhong().getKhachSan().getTen();
            }

            String key = hotelId != null ? hotelId.toString() : hotelName;
            RevenueReportItem item = hotelRevenueMap.getOrDefault(key, new RevenueReportItem());
            if (item.getTenKhachSan() == null) {
                item.setKhachSanId(hotelId);
                item.setTenKhachSan(hotelName);
                item.setTongSoDon(0);
                item.setTongDoanhThu(BigDecimal.ZERO);
            }
            item.setTongSoDon(item.getTongSoDon() + 1);
            item.setTongDoanhThu(item.getTongDoanhThu().add(tienPhong));
            hotelRevenueMap.put(key, item);
        }

        for (com.example.bookingkhachsan.entity.ChiTietSuDungDV ct : ctsdList) {
            int month = ct.getPhieuDatPhong().getNgayDen().getMonthValue();
            BookingDto.MonthlyRevenue mr = monthlyMap.get(month);
            BigDecimal donGia = ct.getDonGiaLucDat() != null ? ct.getDonGiaLucDat() : BigDecimal.ZERO;
            int sl = ct.getSoLuong() != null ? ct.getSoLuong() : 0;
            BigDecimal amt = donGia.multiply(BigDecimal.valueOf(sl));

            mr.setServiceRevenue(mr.getServiceRevenue().add(amt));
            mr.setTotalRevenue(mr.getTotalRevenue().add(amt));
            globalTotal = globalTotal.add(amt);

            String hotelName = "Unknown";
            Integer hotelId = null;
            if (ct.getPhieuDatPhong().getPhong() != null && ct.getPhieuDatPhong().getPhong().getKhachSan() != null) {
                hotelId = ct.getPhieuDatPhong().getPhong().getKhachSan().getId();
                hotelName = ct.getPhieuDatPhong().getPhong().getKhachSan().getTen();
            }
            String key = hotelId != null ? hotelId.toString() : hotelName;
            if (hotelRevenueMap.containsKey(key)) {
                RevenueReportItem item = hotelRevenueMap.get(key);
                item.setTongDoanhThu(item.getTongDoanhThu().add(amt));
            }
        }

        List<BookingDto.SurchargeDetail> surchargeDetails = new java.util.ArrayList<>();
        for (com.example.bookingkhachsan.entity.PhuThu pt : ptList) {
            int month = pt.getPhieuDatPhong().getNgayDen().getMonthValue();
            BookingDto.MonthlyRevenue mr = monthlyMap.get(month);
            BigDecimal amt = pt.getSoTien() != null ? pt.getSoTien() : BigDecimal.ZERO;

            mr.setSurchargeRevenue(mr.getSurchargeRevenue().add(amt));
            mr.setTotalRevenue(mr.getTotalRevenue().add(amt));
            globalTotal = globalTotal.add(amt);

            surchargeDetails.add(BookingDto.SurchargeDetail.builder()
                    .maDatPhong(pt.getPhieuDatPhong().getMaDatPhong() != null ? pt.getPhieuDatPhong().getMaDatPhong() : String.valueOf(pt.getPhieuDatPhong().getId()))
                    .loaiPhuThu(pt.getLoaiPhuThu())
                    .soTien(amt)
                    .ngayThu(pt.getCreatedAt() != null ? pt.getCreatedAt() : java.time.LocalDateTime.now())
                    .build());

            String hotelName = "Unknown";
            Integer hotelId = null;
            if (pt.getPhieuDatPhong().getPhong() != null && pt.getPhieuDatPhong().getPhong().getKhachSan() != null) {
                hotelId = pt.getPhieuDatPhong().getPhong().getKhachSan().getId();
                hotelName = pt.getPhieuDatPhong().getPhong().getKhachSan().getTen();
            }
            String key = hotelId != null ? hotelId.toString() : hotelName;
            if (hotelRevenueMap.containsKey(key)) {
                RevenueReportItem item = hotelRevenueMap.get(key);
                item.setTongDoanhThu(item.getTongDoanhThu().add(amt));
            }
        }
        
        // Sort surcharges latest first
        surchargeDetails.sort((s1, s2) -> s2.getNgayThu().compareTo(s1.getNgayThu()));

        RevenueReportResponse response = new RevenueReportResponse();
        response.setTongDoanhThuToanHeThong(globalTotal);
        response.setDoanhThuTheoKhachSan(hotelRevenueMap.values().stream().collect(Collectors.toList()));
        response.setMonthlyStats(monthlyMap.values().stream().collect(Collectors.toList()));
        response.setSurcharges(surchargeDetails);

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
