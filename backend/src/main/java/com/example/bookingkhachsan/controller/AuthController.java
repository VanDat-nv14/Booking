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
        var attrs = token.getPrincipal().getAttributes();
        String email = getStringAttr(attrs, "email");
        String name = getStringAttr(attrs, "name");
        String provider = token.getAuthorizedClientRegistrationId(); // google, facebook

        // Google dùng "sub" làm unique ID; Facebook dùng "id"
        String providerId = getStringAttr(attrs, "sub");   // Google
        if (providerId == null || providerId.isBlank()) {
            providerId = getStringAttr(attrs, "id");       // Facebook
        }

        // Google dùng "picture" (string URL); Facebook dùng picture.data.url (object Map)
        // getStringAttr() gọi .toString() → với Facebook sẽ ra chuỗi "{data={url=...}}" không phải URL
        // → Phải kiểm tra rawPicture trực tiếp
        String picture = null;
        Object rawPicture = attrs.get("picture");
        if (rawPicture instanceof String s && s.startsWith("http")) {
            // Google: trả về string URL trực tiếp
            picture = s.trim();
        } else if (rawPicture instanceof java.util.Map<?, ?> picMap) {
            // Facebook: { data: { url: "https://..." } }
            Object data = picMap.get("data");
            if (data instanceof java.util.Map<?, ?> dataMap && dataMap.get("url") != null) {
                picture = dataMap.get("url").toString();
            }
        }
        // Fallback cho các provider khác
        if (picture == null || picture.isBlank()) {
            picture = getStringAttr(attrs, "picture_url");
        }
        if (picture == null || picture.isBlank()) {
            picture = getStringAttr(attrs, "image");
        }

        AuthDto.AuthResponse authResponse = service.processOAuthPostLogin(email, name, provider, picture, providerId);
        
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

    private static String getStringAttr(java.util.Map<String, Object> attrs, String key) {
        Object v = attrs.get(key);
        return v != null ? v.toString().trim() : null;
    }
}
