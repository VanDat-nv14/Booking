package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "phieu_dat_phong")
@Data
public class PhieuDatPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_dat_phong", insertable = false, updatable = false)
    private String maDatPhong;   // Trigger-generated: BKyyyyMMddXXXX

    @Column(name = "ngay_den", nullable = false)
    private LocalDate ngayDen;

    @Column(name = "ngay_di", nullable = false)
    private LocalDate ngayDi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    @JsonIgnore
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_id", nullable = false)
    private Phong phong;

    @Column(name = "gia_phong_goc", nullable = false)
    private BigDecimal giaPhongGoc;   // Snapshot gia luc dat, khong thay doi

    @Column(name = "thanh_tien", nullable = false)
    private BigDecimal thanhTien;     // Tong cuoi sau services + phu thu

    /**
     * STATE MACHINE:
     * Pending → Confirmed / Expired / Rejected
     * Confirmed → CheckedIn / Cancelled
     * CheckedIn → CheckedOut
     * CheckedOut → Completed
     * + NoShow (tu Confirmed neu qua gio)
     */
    @Column(name = "trang_thai")
    private String trangThai = "Pending";

    /**
     * Trang thai thanh toan:
     * ChuaThanhToan, DaThanhToan, DaHoanTien, Huy
     */
    @Column(name = "trang_thai_thanh_toan")
    private String trangThaiThanhToan = "ChuaThanhToan";

    // === Cac truong mo rong ===

    // Loai dat phong: InstantBooking (tu dong confirm) | RequestToBook (can duyet)
    @Column(name = "loai_dat_phong", length = 30)
    private String loaiDatPhong = "InstantBooking";

    @Column(name = "phuong_thuc_thanh_toan", length = 50)
    private String phuongThucThanhToan;

    // Thoi han giu phong Pending (30 phut)
    @Column(name = "pending_expires_at")
    private LocalDateTime pendingExpiresAt;

    @Column(name = "so_nguoi_lon")
    private Integer soNguoiLon = 1;

    @Column(name = "so_tre_em")
    private Integer soTreEm = 0;

    @Column(name = "ghi_chu_khach", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChuKhach;

    @Column(name = "ghi_chu_huy", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChuHuy;

    @Column(name = "ti_le_hoa_hong")
    private BigDecimal tiLeHoaHong = BigDecimal.ZERO;

    @Column(name = "tien_hoa_hong")
    private BigDecimal tienHoaHong = BigDecimal.ZERO;

    // ===  Timestamps ===
    @Column(name = "ngay_dat", insertable = false, updatable = false)
    private LocalDateTime ngayDat;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // === Relations ===
    @OneToMany(mappedBy = "phieuDatPhong", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<ChiTietSuDungDV> chiTietDichVus;

    @OneToMany(mappedBy = "phieuDatPhong", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<PhuThu> phuThus;

    @OneToMany(mappedBy = "phieuDatPhong", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnore
    private List<LichSuThanhToan> lichSuThanhToans;
}
