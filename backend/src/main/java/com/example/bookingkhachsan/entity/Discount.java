package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Mã giảm giá do Admin tạo và quản lý.
 *
 * Quy tắc:
 *  - PERCENT: tỷ lệ giảm, tối đa 80%
 *  - FIXED: số tiền giảm cố định
 *  - Mã (code) phải là duy nhất trong hệ thống
 *  - Có thể gắn với khách sạn cụ thể hoặc toàn hệ thống
 */
@Entity
@Table(name = "discount")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @Column(name = "id", length = 30)
    private String id; // GG-YYYYMMDD-XXXX

    /** Mã coupon duy nhất (khách dùng để áp dụng) */
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    /**
     * Loại giảm giá: PERCENT, FIXED
     */
    @Column(name = "loai", nullable = false, length = 20)
    private String loai;

    /** Giá trị giảm (% nếu PERCENT, số tiền nếu FIXED) */
    @Column(name = "gia_tri", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaTri;

    /** Số tiền giảm tối đa (áp dụng với loại PERCENT) */
    @Column(name = "giam_toi_da", precision = 15, scale = 2)
    private BigDecimal giamToiDa;

    /** Giá trị đơn hàng tối thiểu để áp dụng mã */
    @Column(name = "don_hang_toi_thieu", precision = 15, scale = 2)
    private BigDecimal donHangToiThieu;

    /** Số lần sử dụng tối đa (null = không giới hạn) */
    @Column(name = "so_lan_su_dung_toi_da")
    private Integer soLanSuDungToiDa;

    /** Số lần đã sử dụng */
    @Column(name = "so_lan_da_dung")
    @Builder.Default
    private Integer soLanDaDung = 0;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    /**
     * Khách sạn áp dụng (null = toàn hệ thống)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_san_id")
    private KhachSan khachSan;

    /**
     * Trạng thái: ACTIVE, INACTIVE, EXPIRED
     */
    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private String trangThai = "ACTIVE";

    /** Admin tạo mã */
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
