package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.AuthDto;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow dev
public class AuthController {

    private final AuthService service;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @jakarta.validation.Valid @RequestBody AuthDto.RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @jakarta.validation.Valid @RequestBody AuthDto.LoginRequest request
    ) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@jakarta.validation.Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        service.forgotPassword(request);
        return ResponseEntity.ok("Password reset link sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@jakarta.validation.Valid @RequestBody AuthDto.ResetPasswordRequest request) {
        service.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

    /**
     * Lay thong tin user hien tai dang dang nhap tu JWT token.
     * Frontend goi GET /api/auth/me voi Authorization header de kiem tra session.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthDto.AuthResponse> getCurrentUser(@AuthenticationPrincipal NguoiDung currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        AuthDto.AuthResponse response = AuthDto.AuthResponse.builder()
                .role(currentUser.getChucVu())
                .hoTen(currentUser.getHoTen())
                .userId(currentUser.getId())
                .email(currentUser.getEmail())
                .build();
        return ResponseEntity.ok(response);
    }


    @GetMapping("/oauth2/success")
    public ResponseEntity<Void> oauth2Success(org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken token, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        String email = token.getPrincipal().getAttribute("email");
        String name = token.getPrincipal().getAttribute("name");
        // Google dùng "picture"; một số provider dùng picture_url, image
        String picture = token.getPrincipal().getAttribute("picture");
        if (picture == null || picture.isBlank()) {
            picture = token.getPrincipal().getAttribute("picture_url");
            if (picture == null || picture.isBlank()) {
                picture = token.getPrincipal().getAttribute("image");
            }
        }
        // Distinguish provider? 
        // token.getAuthorizedClientRegistrationId() usually works if in valid context, 
        // but here we just get provider from token.
        // Actually OAuth2AuthenticationToken has 'getAuthorizedClientRegistrationId()'
        String provider = token.getAuthorizedClientRegistrationId(); // google, facebook

        AuthDto.AuthResponse authResponse = service.processOAuthPostLogin(email, name, provider, picture);
        
        // Encode parameters to ensure URL safety
        String redirectUrl = String.format("%s/auth/callback?token=%s&role=%s&hoTen=%s&userId=%d&email=%s&avatarUrl=%s",
                frontendBaseUrl,
                authResponse.getToken(),
                java.net.URLEncoder.encode(authResponse.getRole(), java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(authResponse.getHoTen(), java.nio.charset.StandardCharsets.UTF_8),
                authResponse.getUserId(),
                java.net.URLEncoder.encode(authResponse.getEmail(), java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(authResponse.getAvatarUrl() != null ? authResponse.getAvatarUrl() : "", java.nio.charset.StandardCharsets.UTF_8));
        
        // Redirect to Frontend
        response.sendRedirect(redirectUrl);
        return ResponseEntity.ok().build();
    }
}
