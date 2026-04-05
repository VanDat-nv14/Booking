package com.example.bookingkhachsan.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Mã khuyến mãi nhập khi đặt phòng — do Hotel Manager tạo, gắn bắt buộc với một khách sạn.
 * Khác với {@link Promotion} (chương trình KM / phê duyệt admin).
 */
@Entity
@Table(name = "promotion_code", uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PromotionCode {

    @Id
    @Column(name = "id", length = 40)
    private String id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    /** PERCENT | FIXED */
    @Column(name = "loai", nullable = false, length = 20)
    private String loai;

    @Column(name = "gia_tri", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaTri;

    @Column(name = "giam_toi_da", precision = 15, scale = 2)
    private BigDecimal giamToiDa;

    @Column(name = "don_hang_toi_thieu", precision = 15, scale = 2)
    private BigDecimal donHangToiThieu;

    /** Số đêm tối thiểu (null = không yêu cầu) */
    @Column(name = "so_dem_toi_thieu")
    private Integer soDemToiThieu;

    /** Chỉ áp dụng cho loại phòng này (null = mọi loại) */
    @Column(name = "loai_phong_id")
    private Integer loaiPhongId;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "so_lan_su_dung_toi_da")
    private Integer soLanSuDungToiDa;

    @Column(name = "so_lan_da_dung")
    @Builder.Default
    private Integer soLanDaDung = 0;

    /** Số lần tối đa mỗi user (null = không giới hạn) */
    @Column(name = "so_lan_toi_da_moi_user")
    private Integer soLanToiDaMoiUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_san_id", nullable = false)
    private KhachSan khachSan;

    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private String trangThai = "ACTIVE";

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
