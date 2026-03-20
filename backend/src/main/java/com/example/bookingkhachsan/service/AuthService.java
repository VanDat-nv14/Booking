package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.AuthDto;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        var user = new NguoiDung();
        user.setHoTen(request.getHoTen());
        user.setEmail(request.getEmail());
        user.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        user.setSdt(request.getSdt());
        user.setChucVu(request.getChucVu() != null ? request.getChucVu() : "User");
        user.setTrangThai(true);
        // CreatedAt/UpdatedAt handled by DB default or JPA Auditing. 
        // Since we used insertable=false for those columns in Entity, DB will handle it if default constraint exists.
        // If not, we might need to set it manually or enable JPA Auditing. 
        // The DB script has DEFAULT GETDATE(), so we are good.

        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .message("Đăng ký thành công")
                .role(user.getChucVu())
                .hoTen(user.getHoTen())
                .userId(user.getId())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMatKhau()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .message("Đăng nhập thành công")
                .role(user.getChucVu())
                .hoTen(user.getHoTen())
                .userId(user.getId())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
    private final EmailService emailService;

    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        repository.save(user);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendEmail(
                user.getEmail(),
                "Password Reset Request",
                "Click the link to reset your password: " + resetLink
        );
    }

    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        var user = repository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        user.setMatKhau(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        repository.save(user);
    }
    
    // Helper to process OAuth2 login
    public AuthDto.AuthResponse processOAuthPostLogin(String email, String name, String providerInfo, String avatarUrl, String providerId) {
        NguoiDung.Provider providerEnum = NguoiDung.Provider.valueOf(providerInfo.toUpperCase());
        // Fallback email khi Facebook không trả (user ẩn email)
        if ((email == null || email.isBlank()) && providerEnum == NguoiDung.Provider.FACEBOOK && providerId != null) {
            email = providerId + "@facebook.placeholder";
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("OAuth2 không trả về email. Vui lòng cấp quyền email hoặc đăng nhập bằng cách khác.");
        }

        // Bước 1: Tìm chính xác theo provider + providerId (ưu tiên nhất)
        var userOptional = providerId != null && !providerId.isBlank()
                ? repository.findByProviderAndProviderId(providerEnum, providerId)
                : Optional.<NguoiDung>empty();

        // Bước 2: Nếu không tìm thấy theo providerId, tìm theo email
        // NHƯNG chỉ dùng nếu provider khớp hoặc user là LOCAL (chưa có OAuth)
        if (userOptional.isEmpty()) {
            var byEmail = repository.findByEmail(email);
            if (byEmail.isPresent()) {
                NguoiDung found = byEmail.get();
                // Chỉ tái sử dụng account nếu:
                //   - cùng provider, hoặc
                //   - account chưa có provider (LOCAL / null) → liên kết lần đầu
                if (found.getProvider() == null
                        || found.getProvider() == NguoiDung.Provider.LOCAL
                        || found.getProvider() == providerEnum) {
                    userOptional = byEmail;
                }
                // Nếu account thuộc provider KHÁC (vd đang login Facebook nhưng tìm thấy tài khoản Google)
                // → KHÔNG dùng, để tạo tài khoản mới riêng biệt bên dưới
            }
        }

        NguoiDung user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Cập nhật provider nếu account chưa liên kết
            if (user.getProvider() == null || user.getProvider() == NguoiDung.Provider.LOCAL) {
                user.setProvider(providerEnum);
            }
            if (providerId != null && !providerId.isBlank()) {
                user.setProviderId(providerId);
            }
            if (avatarUrl != null && !avatarUrl.isBlank()) {
                user.setAvatarUrl(avatarUrl);
            }
            repository.save(user);
        } else {
            // Tạo tài khoản mới cho provider này
            user = new NguoiDung();
            // Nếu email bị trùng với account provider khác, dùng email placeholder của provider
            String finalEmail = email;
            if (repository.findByEmail(email).isPresent()) {
                // Email đã bị dùng bởi provider khác → tạo email giả riêng
                finalEmail = (providerId != null ? providerId : java.util.UUID.randomUUID().toString())
                        + "@" + providerInfo.toLowerCase() + ".placeholder";
            }
            user.setEmail(finalEmail);
            user.setHoTen(name != null && !name.isBlank() ? name : "User");
            user.setMatKhau(passwordEncoder.encode("OAUTH2_Generated_" + java.util.UUID.randomUUID()));
            user.setSdt("");
            user.setChucVu("User");
            user.setTrangThai(true);
            user.setProvider(providerEnum);
            user.setProviderId(providerId);
            if (avatarUrl != null && !avatarUrl.isBlank()) {
                user.setAvatarUrl(avatarUrl);
            }
            repository.save(user);
        }
        
        var jwtToken = jwtService.generateToken(user);
        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .message("Login successful via " + providerInfo)
                .role(user.getChucVu())
                .hoTen(user.getHoTen())
                .userId(user.getId())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
