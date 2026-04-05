package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Gói thành viên mà user đã mua.
 * Một user có thể mua nhiều gói khác nhau, nhưng tại một thời điểm chỉ 1 gói ACTIVE.
 */
@Entity
@Table(name = "user_membership")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "goi_thanh_vien_id", nullable = false)
    private LoyaltyMembership goiThanhVien;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    /** ACTIVE, EXPIRED */
    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private String trangThai = "ACTIVE";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
