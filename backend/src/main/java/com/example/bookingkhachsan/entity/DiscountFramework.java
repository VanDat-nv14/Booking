package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Khung chính sách giảm giá toàn chuỗi do Admin thiết lập.
 * Bảng chỉ chứa 1 dòng duy nhất (id = 1).
 * Manager tạo PromotionCode phải tuân theo giới hạn này.
 */
@Entity
@Table(name = "discount_framework")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountFramework {

    @Id
    @Column(name = "id")
    private Long id; // Luôn = 1 (singleton row)

    /** % giảm tối đa Manager được phép áp dụng (VD: 30.0) */
    @Column(name = "phan_tram_toi_da", precision = 5, scale = 2)
    private BigDecimal phanTramToiDa;

    /** % giảm tối thiểu (VD: 5.0) */
    @Column(name = "phan_tram_toi_thieu", precision = 5, scale = 2)
    private BigDecimal phanTramToiThieu;

    /** Số tiền FIXED tối đa Manager được phép (VD: 2,000,000) */
    @Column(name = "so_tien_toi_da", precision = 15, scale = 2)
    private BigDecimal soTienToiDa;

    /** Giá trị đơn hàng tối thiểu bắt buộc cho mọi PromotionCode */
    @Column(name = "don_hang_toi_thieu_bat_buoc", precision = 15, scale = 2)
    private BigDecimal donHangToiThieuBatBuoc;

    @Column(name = "nguoi_cap_nhat", length = 200)
    private String nguoiCapNhat;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    @PrePersist
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
