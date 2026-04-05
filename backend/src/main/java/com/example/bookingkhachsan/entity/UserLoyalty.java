package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Theo dõi điểm tích lũy và hạng thành viên của từng user.
 * Mỗi user chỉ có 1 bản ghi (OneToOne với NguoiDung).
 */
@Entity
@Table(name = "user_loyalty")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoyalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false, unique = true)
    private NguoiDung nguoiDung;

    /** Tổng điểm tích lũy cả đời (không giảm khi đổi quà) */
    @Column(name = "tong_diem", nullable = false)
    @Builder.Default
    private Integer tongDiem = 0;

    /** Hạng thành viên hiện tại */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hang_hien_tai_id")
    private LoyaltyTier hangHienTai;

    @Column(name = "ngay_cap_nhat_hang")
    private LocalDate ngayCapNhatHang;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
