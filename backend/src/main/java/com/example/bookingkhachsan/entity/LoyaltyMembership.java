package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Gói thành viên trả phí do Admin tạo.
 * User mua gói → hưởng % giảm giá trong suốt thời hạn gói.
 */
@Entity
@Table(name = "loyalty_membership")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyMembership {

    @Id
    @Column(name = "id", length = 30)
    private String id; // LM-YYYYMMDD-XXXX

    /** Tên gói: "VIP 3 Tháng", "Premium 1 Năm" */
    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    /** Giá mua gói (VND) */
    @Column(name = "gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal gia;

    /** Hiệu lực bao nhiêu ngày */
    @Column(name = "thoi_han_ngay", nullable = false)
    private Integer thoiHanNgay;

    /** % giảm giá được hưởng trong thời hạn gói */
    @Column(name = "phan_tram_giam", nullable = false, precision = 5, scale = 2)
    private BigDecimal phanTramGiam;

    /** Điểm tích lũy thưởng khi kích hoạt gói */
    @Column(name = "diem_thuong")
    @Builder.Default
    private Integer diemThuong = 0;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "nguoi_tao", length = 200)
    private String nguoiTao;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
