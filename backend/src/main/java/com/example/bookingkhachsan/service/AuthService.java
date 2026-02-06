package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.AuthDto;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
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
    public AuthDto.AuthResponse processOAuthPostLogin(String email, String name, String providerInfo) {
        var userOptional = repository.findByEmail(email);
        NguoiDung user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update provider if needed or just log them in
            if (user.getProvider() == null || user.getProvider() == NguoiDung.Provider.LOCAL) {
                // If previously local, maybe link? For now, we trust the email.
                user.setProvider(NguoiDung.Provider.valueOf(providerInfo.toUpperCase()));
                repository.save(user);
            }
        } else {
            user = new NguoiDung();
            user.setEmail(email);
            user.setHoTen(name);
            user.setMatKhau(passwordEncoder.encode("OAUTH2_Generated_" + java.util.UUID.randomUUID())); // Dummy pwd
            user.setSdt(""); // Optional or placeholder
            user.setChucVu("User");
            user.setTrangThai(true);
            user.setProvider(NguoiDung.Provider.valueOf(providerInfo.toUpperCase()));
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
                .build();
    }
}
