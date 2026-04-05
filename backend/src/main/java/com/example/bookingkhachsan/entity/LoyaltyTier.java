package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

/**
 * Hạng thành viên trong chương trình tích điểm (Admin quản lý).
 * Ví dụ: Thành Viên (0đ), Bạc (500đ), Vàng (2000đ), Kim Cương (5000đ).
 */
@Entity
@Table(name = "loyalty_tier")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Tên hạng: "Thành Viên", "Bạc", "Vàng", "Kim Cương" */
    @Column(name = "ten_hang", nullable = false, length = 100)
    private String tenHang;

    /** Tổng điểm tối thiểu để đạt hạng này */
    @Column(name = "diem_toi_thieu", nullable = false)
    private Integer diemToiThieu;

    /** % giảm giá tự động áp dụng khi đặt phòng */
    @Column(name = "phan_tram_uu_dai", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal phanTramUuDai = BigDecimal.ZERO;

    /** Màu hiển thị hex (VD: #FFD700 cho vàng) */
    @Column(name = "mau_sac", length = 20)
    private String mauSac;

    /** Thứ tự hiển thị (tăng dần = cao hơn) */
    @Column(name = "thu_tu")
    @Builder.Default
    private Integer thuTu = 0;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;
}
