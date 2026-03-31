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
 * Chương trình khuyến mãi do Manager tạo nháp và Admin phê duyệt.
 *
 * Loại khuyến mãi:
 *  - COMBO: Đặt combo phòng + dịch vụ với giá đặc biệt
 *  - BUY_X_GET_Y: Đặt X đêm, tặng Y đêm miễn phí
 *  - SEASONAL: Giảm giá theo mùa
 *  - FLASH_SALE: Flash sale thời gian ngắn
 *  - LOYALTY: Ưu đãi cho khách hàng thân thiết
 *
 * Quy trình phê duyệt:
 *  - Manager tạo -> DRAFT
 *  - Manager gửi duyệt -> PENDING_APPROVAL
 *  - Nếu ngân sách > ngưỡng -> PENDING_APPROVAL (bắt buộc Admin duyệt)
 *  - Admin phê duyệt -> APPROVED
 *  - Admin từ chối -> REJECTED
 *  - Hết hạn -> EXPIRED
 */
@Entity
@Table(name = "promotion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @Column(name = "id", length = 30)
    private String id; // KM-YYYYMMDD-XXXX

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    /**
     * Loại khuyến mãi: COMBO, BUY_X_GET_Y, SEASONAL, FLASH_SALE, LOYALTY
     */
    @Column(name = "loai", nullable = false, length = 30)
    private String loai;

    /** Số lượng X (cho BUY_X_GET_Y: đặt X đêm) */
    @Column(name = "so_luong_x")
    private Integer soLuongX;

    /** Số lượng Y (cho BUY_X_GET_Y: tặng Y đêm) */
    @Column(name = "so_luong_y")
    private Integer soLuongY;

    /** Tỷ lệ giảm giá (%) */
    @Column(name = "ti_le_giam", precision = 5, scale = 2)
    private BigDecimal tiLeGiam;

    /** Ngân sách dự kiến cho chương trình KM */
    @Column(name = "ngan_sach", precision = 15, scale = 2)
    private BigDecimal nganSach;

    /** Ngưỡng ngân sách tự động cần phê duyệt (default: 10,000,000 VND) */
    @Column(name = "nguong_ngan_sach", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal nguongNganSach = new BigDecimal("10000000");

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
     * Trạng thái:
     * DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ACTIVE, EXPIRED, CANCELLED
     */
    @Column(name = "trang_thai", length = 30)
    @Builder.Default
    private String trangThai = "DRAFT";

    /** Manager tạo nháp (email) */
    @Column(name = "nguoi_tao", length = 200)
    private String nguoiTao;

    /** Admin phê duyệt/từ chối (email) */
    @Column(name = "nguoi_phe_duyet", length = 200)
    private String nguoiPheDuyet;

    /** Lý do từ chối (nếu REJECTED) */
    @Column(name = "ly_do_tu_choi", columnDefinition = "NVARCHAR(MAX)")
    private String lyDoTuChoi;

    /** Ghi chú từ Manager */
    @Column(name = "ghi_chu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;

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
