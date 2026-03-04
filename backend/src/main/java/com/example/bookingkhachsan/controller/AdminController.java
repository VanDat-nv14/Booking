package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final PhieuDatPhongRepository bookingRepository;

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
    // Nếu user đã có booking/phiếu đặt phòng → soft-delete (vô hiệu hóa)
    // Nếu chưa có dữ liệu liên kết → hard-delete
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        return repository.findById(id).map(user -> {
            long bookingCount = bookingRepository.findByNguoiDungId(id).size();
            if (bookingCount > 0) {
                // Có dữ liệu liên kết → chỉ vô hiệu hóa tài khoản
                user.setTrangThai(false);
                repository.save(user);
                return ResponseEntity.ok(Map.of(
                    "message", "Tài khoản đã bị vô hiệu hóa (có " + bookingCount + " đặt phòng liên kết, không thể xóa hẳn)",
                    "softDeleted", true
                ));
            } else {
                // Không có ràng buộc → xóa hoàn toàn
                repository.deleteById(id);
                return ResponseEntity.ok(Map.of(
                    "message", "Xóa người dùng thành công!",
                    "softDeleted", false
                ));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
