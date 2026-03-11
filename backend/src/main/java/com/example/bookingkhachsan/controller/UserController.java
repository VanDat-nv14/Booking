package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.web.multipart.MultipartFile;

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
        private String tenHienThi;
        private String sdt;
        private String ngaySinh;
        private String quocTich;
        private String gioiTinh;
        private String diaChi;
        private String soHoChieu;
        private String hoChieuTen;
        private String hoChieuHo;
        private String hoChieuQuocGia;
        private String hoChieuNgayHetHan;
        private String avatarUrl;
        private String matKhauCu;
        private String matKhauMoi;
        private String xacNhanMatKhau;
    }

    private Map<String, Object> toMap(NguoiDung u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("hoTen", u.getHoTen() != null ? u.getHoTen() : "");
        m.put("tenHienThi", u.getTenHienThi() != null ? u.getTenHienThi() : "");
        m.put("email", u.getEmail() != null ? u.getEmail() : "");
        m.put("sdt", u.getSdt() != null ? u.getSdt() : "");
        m.put("chucVu", u.getChucVu() != null ? u.getChucVu() : "");
        m.put("trangThai", Boolean.TRUE.equals(u.getTrangThai()));
        m.put("ngaySinh", u.getNgaySinh() != null ? u.getNgaySinh().toString() : "");
        m.put("quocTich", u.getQuocTich() != null ? u.getQuocTich() : "");
        m.put("gioiTinh", u.getGioiTinh() != null ? u.getGioiTinh() : "");
        m.put("diaChi", u.getDiaChi() != null ? u.getDiaChi() : "");
        m.put("soHoChieu", u.getSoHoChieu() != null ? u.getSoHoChieu() : "");
        m.put("hoChieuTen", u.getHoChieuTen() != null ? u.getHoChieuTen() : "");
        m.put("hoChieuHo", u.getHoChieuHo() != null ? u.getHoChieuHo() : "");
        m.put("hoChieuQuocGia", u.getHoChieuQuocGia() != null ? u.getHoChieuQuocGia() : "");
        m.put("hoChieuNgayHetHan", u.getHoChieuNgayHetHan() != null ? u.getHoChieuNgayHetHan().toString() : "");
        m.put("avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
        m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
        return m;
    }

    /** Lấy thông tin cá nhân */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Integer id) {
        return repository.findById(id)
                .map(u -> ResponseEntity.ok(toMap(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Cập nhật thông tin cá nhân */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer id,
            @RequestBody UpdateProfileRequest req) {

        return repository.findById(id).map(user -> {
            if (req.getHoTen() != null && !req.getHoTen().isBlank()) {
                user.setHoTen(req.getHoTen().trim());
            }
            if (req.getTenHienThi() != null) {
                user.setTenHienThi(req.getTenHienThi().trim());
            }
            if (req.getSdt() != null) {
                user.setSdt(req.getSdt().trim());
            }
            if (req.getNgaySinh() != null && !req.getNgaySinh().isBlank()) {
                try { user.setNgaySinh(LocalDate.parse(req.getNgaySinh())); } catch (Exception ignored) {}
            }
            if (req.getQuocTich() != null) {
                user.setQuocTich(req.getQuocTich().trim());
            }
            if (req.getGioiTinh() != null) {
                user.setGioiTinh(req.getGioiTinh().trim());
            }
            if (req.getDiaChi() != null) {
                user.setDiaChi(req.getDiaChi().trim());
            }
            if (req.getSoHoChieu() != null) {
                user.setSoHoChieu(req.getSoHoChieu().trim());
            }
            if (req.getHoChieuTen() != null) {
                user.setHoChieuTen(req.getHoChieuTen().trim());
            }
            if (req.getHoChieuHo() != null) {
                user.setHoChieuHo(req.getHoChieuHo().trim());
            }
            if (req.getHoChieuQuocGia() != null) {
                user.setHoChieuQuocGia(req.getHoChieuQuocGia().trim());
            }
            if (req.getHoChieuNgayHetHan() != null && !req.getHoChieuNgayHetHan().isBlank()) {
                try { user.setHoChieuNgayHetHan(LocalDate.parse(req.getHoChieuNgayHetHan())); } catch (Exception ignored) {}
            }
            if (req.getAvatarUrl() != null) {
                user.setAvatarUrl(req.getAvatarUrl().trim());
            }

            // Đổi mật khẩu
            if (req.getMatKhauMoi() != null && !req.getMatKhauMoi().isBlank()) {
                if (req.getMatKhauCu() == null || !passwordEncoder.matches(req.getMatKhauCu(), user.getMatKhau())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu hiện tại không đúng!"));
                }
                if (!req.getMatKhauMoi().equals(req.getXacNhanMatKhau())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu xác nhận không khớp!"));
                }
                if (req.getMatKhauMoi().length() < 8) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu phải ít nhất 8 ký tự!"));
                }
                user.setMatKhau(passwordEncoder.encode(req.getMatKhauMoi()));
            }

            NguoiDung saved = repository.save(user);
            Map<String, Object> result = toMap(saved);
            result.put("message", "Cập nhật thành công!");
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }
    /** Upload avatar từ file máy tính */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống!"));
        }

        // Chỉ nhận file ảnh
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)!"));
        }

        return repository.findById(id).map(user -> {
            try {
                // Xác định đường dẫn lưu file
                String uploadDir = System.getProperty("user.dir") + "/uploads/avatars";
                Path uploadPath = Paths.get(uploadDir);
                Files.createDirectories(uploadPath);

                // Tạo tên file unique
                String ext = "";
                String originalName = file.getOriginalFilename();
                if (originalName != null && originalName.contains(".")) {
                    ext = originalName.substring(originalName.lastIndexOf('.'));
                }
                String fileName = "avatar_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
                Path filePath = uploadPath.resolve(fileName);

                // Lưu file
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Cập nhật avatarUrl trong DB (URL truy cập qua backend)
                String avatarUrl = "/uploads/avatars/" + fileName;
                user.setAvatarUrl(avatarUrl);
                NguoiDung saved = repository.save(user);

                Map<String, Object> result = toMap(saved);
                result.put("message", "Cập nhật ảnh đại diện thành công!");
                return ResponseEntity.ok(result);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi lưu file: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
