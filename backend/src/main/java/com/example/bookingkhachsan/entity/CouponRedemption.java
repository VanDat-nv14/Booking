package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Ghi nhận một lần áp dụng mã (discount nền tảng hoặc promotion code KS) trên một booking.
 */
@Entity
@Table(name = "coupon_redemption")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_dat_phong_id", nullable = false)
    private PhieuDatPhong phieuDatPhong;

    /** DISCOUNT | PROMO_CODE */
    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType;

    @Column(name = "discount_id", length = 30)
    private String discountId;

    @Column(name = "promotion_code_id", length = 40)
    private String promotionCodeId;

    @Column(name = "ma_snapshot", length = 50)
    private String maSnapshot;

    @Column(name = "so_tien_giam", precision = 15, scale = 2)
    private BigDecimal soTienGiam;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
