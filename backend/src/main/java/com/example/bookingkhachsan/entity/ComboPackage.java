package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Gói Combo do Hotel Manager tạo: kết hợp loại phòng + dịch vụ nội khu thành một gói giá ưu đãi.
 * Hiển thị trên trang chi tiết khách sạn để khách chọn.
 */
@Entity
@Table(name = "combo_package")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboPackage {

    @Id
    @Column(name = "id", length = 30)
    private String id; // CB-YYYYMMDD-XXXX

    @Column(name = "ten", nullable = false, length = 200)
    private String ten;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_san_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KhachSan khachSan;

    /**
     * Loại phòng áp dụng (null = áp dụng cho tất cả loại phòng trong khách sạn).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loai_phong_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private LoaiPhong loaiPhong;

    /**
     * Danh sách dịch vụ kèm theo trong combo.
     * Join table: combo_package_dich_vu (combo_package_id, dich_vu_id)
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "combo_package_dich_vu",
        joinColumns = @JoinColumn(name = "combo_package_id"),
        inverseJoinColumns = @JoinColumn(name = "dich_vu_id")
    )
    @Builder.Default
    private List<DichVu> dichVuKemTheo = new ArrayList<>();

    /** Giá combo (đã giảm so với tổng giá gốc) */
    @Column(name = "gia_combo", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaCombo;

    /** % giảm so với tổng giá gốc (auto-calculated từ giaGocTinhToan vs giaCombo) */
    @Column(name = "ti_le_giam", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tiLeGiam = BigDecimal.ZERO;

    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;

    /** Số lượng sử dụng tối đa (null = không giới hạn) */
    @Column(name = "so_luong_toi_da")
    private Integer soLuongToiDa;

    @Column(name = "so_luong_da_dung")
    @Builder.Default
    private Integer soLuongDaDung = 0;

    /** ACTIVE, INACTIVE */
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
