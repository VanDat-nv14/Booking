package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;

    /** DTO cập nhật thông tin cá nhân */
    @Data
    public static class UpdateProfileRequest {
        private String hoTen;
        private String sdt;
        private String matKhauCu;       // cần xác nhận khi đổi mật khẩu
        private String matKhauMoi;
        private String xacNhanMatKhau;
    }

    /** Lấy thông tin cá nhân (theo userId truyền vào — đã xác thực bởi JWT) */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Integer id) {
        return repository.findById(id)
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(),
                        "hoTen", u.getHoTen() != null ? u.getHoTen() : "",
                        "email", u.getEmail() != null ? u.getEmail() : "",
                        "sdt", u.getSdt() != null ? u.getSdt() : "",
                        "chucVu", u.getChucVu() != null ? u.getChucVu() : "",
                        "trangThai", Boolean.TRUE.equals(u.getTrangThai())
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Cập nhật thông tin cá nhân */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer id,
            @RequestBody UpdateProfileRequest req) {

        return repository.findById(id).map(user -> {
            // Cập nhật họ tên và SĐT
            if (req.getHoTen() != null && !req.getHoTen().isBlank()) {
                user.setHoTen(req.getHoTen().trim());
            }
            if (req.getSdt() != null) {
                user.setSdt(req.getSdt().trim());
            }

            // Đổi mật khẩu (nếu có nhập mật khẩu mới)
            if (req.getMatKhauMoi() != null && !req.getMatKhauMoi().isBlank()) {
                // Xác nhận mật khẩu cũ
                if (req.getMatKhauCu() == null || !passwordEncoder.matches(req.getMatKhauCu(), user.getMatKhau())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Mật khẩu hiện tại không đúng!"));
                }
                if (!req.getMatKhauMoi().equals(req.getXacNhanMatKhau())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Mật khẩu xác nhận không khớp!"));
                }
                if (req.getMatKhauMoi().length() < 8) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Mật khẩu phải ít nhất 8 ký tự!"));
                }
                user.setMatKhau(passwordEncoder.encode(req.getMatKhauMoi()));
            }

            NguoiDung saved = repository.save(user);
            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "hoTen", saved.getHoTen() != null ? saved.getHoTen() : "",
                    "email", saved.getEmail() != null ? saved.getEmail() : "",
                    "sdt", saved.getSdt() != null ? saved.getSdt() : "",
                    "chucVu", saved.getChucVu() != null ? saved.getChucVu() : "",
                    "message", "Cập nhật thông tin thành công!"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
