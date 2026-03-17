package com.example.bookingkhachsan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {
    

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegisterRequest {
        @jakarta.validation.constraints.NotBlank(message = "Họ tên không được để trống")
        private String hoTen;

        @jakarta.validation.constraints.NotBlank(message = "Email không được để trống")
        @jakarta.validation.constraints.Email(message = "Email không hợp lệ")
        private String email;

        @jakarta.validation.constraints.NotBlank(message = "Mật khẩu không được để trống")
        @jakarta.validation.constraints.Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")

        private String matKhau;

        @jakarta.validation.constraints.NotBlank(message = "Số điện thoại không được để trống")
        @jakarta.validation.constraints.Pattern(regexp = "^\\d{9}$", message = "Số điện thoại phải có đúng 9 số")
        private String sdt;

        private String chucVu; // Optional, default to User
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;
        
        @NotBlank(message = "Mật khẩu không được để trống")
        private String matKhau;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String message;
        private String role;
        private String hoTen;
        private Integer userId;
        private String email;
        private String avatarUrl;
    }
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank(message = "Token không được để trống")
        private String token;
        
        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        private String newPassword;
    }
}
