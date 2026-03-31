package com.example.bookingkhachsan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "nguoi_dung")
@Data
public class NguoiDung implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "mat_khau", nullable = false)
    private String matKhau;

    @Column(name = "sdt")
    private String sdt;

    @Column(name = "ten_hien_thi")
    private String tenHienThi;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "quoc_tich")
    private String quocTich;

    @Column(name = "gioi_tinh")
    private String gioiTinh;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "so_ho_chieu")
    private String soHoChieu;

    @Column(name = "ho_chieu_ten")
    private String hoChieuTen; // First name on passport

    @Column(name = "ho_chieu_ho")
    private String hoChieuHo; // Last name on passport

    @Column(name = "ho_chieu_quoc_gia")
    private String hoChieuQuocGia; // Issuing country

    @Column(name = "ho_chieu_ngay_het_han")
    private LocalDate hoChieuNgayHetHan; // Expiry date

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "chuc_vu")
    private String chucVu; // Admin, HotelManager, User

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // UserDetails methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Giữ nguyên giá trị chucVu (Admin, HotelManager, User) không toUpperCase
        // để SecurityConfiguration.hasAuthority("ROLE_HotelManager") khớp đúng
        return List.of(new SimpleGrantedAuthority("ROLE_" + (chucVu != null ? chucVu : "User")));
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return matKhau;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Tài khoản bị khóa khi trangThai = false
        return Boolean.TRUE.equals(trangThai);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(trangThai);
    }

    public enum Provider {
        LOCAL, GOOGLE, FACEBOOK
    }
}
