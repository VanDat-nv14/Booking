package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.AuthDto;
import com.example.bookingkhachsan.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow dev
public class AuthController {

    private final AuthService service;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @jakarta.validation.Valid @RequestBody AuthDto.RegisterRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @RequestBody AuthDto.LoginRequest request
    ) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody AuthDto.ForgotPasswordRequest request) {
        service.forgotPassword(request);
        return ResponseEntity.ok("Password reset link sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody AuthDto.ResetPasswordRequest request) {
        service.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<Void> oauth2Success(org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken token, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        String email = token.getPrincipal().getAttribute("email");
        String name = token.getPrincipal().getAttribute("name");
        // Distinguish provider? 
        // token.getAuthorizedClientRegistrationId() usually works if in valid context, 
        // but here we just get provider from token.
        // Actually OAuth2AuthenticationToken has 'getAuthorizedClientRegistrationId()'
        String provider = token.getAuthorizedClientRegistrationId(); // google, facebook

        AuthDto.AuthResponse authResponse = service.processOAuthPostLogin(email, name, provider);
        
        // Encode parameters to ensure URL safety
        String redirectUrl = String.format("http://localhost:5173/auth/callback?token=%s&role=%s&hoTen=%s&userId=%d&email=%s",
                authResponse.getToken(),
                java.net.URLEncoder.encode(authResponse.getRole(), java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(authResponse.getHoTen(), java.nio.charset.StandardCharsets.UTF_8),
                authResponse.getUserId(),
                java.net.URLEncoder.encode(authResponse.getEmail(), java.nio.charset.StandardCharsets.UTF_8));
        
        // Redirect to Frontend
        response.sendRedirect(redirectUrl);
        return ResponseEntity.ok().build();
    }
}
