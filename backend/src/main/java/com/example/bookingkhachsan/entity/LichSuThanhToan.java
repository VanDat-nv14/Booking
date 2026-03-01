package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_thanh_toan")
@Data
public class LichSuThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_dat_phong_id", nullable = false)
    private PhieuDatPhong phieuDatPhong;

    @Column(name = "so_tien", nullable = false)
    private BigDecimal soTien;

    /**
     * Loai giao dich:
     * - ThanhToan: Giao dich thanh toan
     * - HoanTien: Hoan tien khi huy
     * - ThuPhiHuy: Thu phi huy phong
     * - ThuPhiNoShow: Thu phi no-show
     */
    @Column(name = "loai_giao_dich", nullable = false)
    private String loaiGiaoDich;

    /**
     * Phuong thuc thanh toan: TienMat, ChuyenKhoan, VNPAY, MoMo, HeThong
     */
    @Column(name = "phuong_thuc", nullable = false)
    private String phuongThuc;

    /**
     * Trang thai giao dich: ThanhCong, ThatBai, DangXuLy, DaHoan
     */
    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    @Column(name = "ma_giao_dich", length = 100)
    private String maGiaoDich;   // Transaction ID tu payment gateway

    @Column(name = "ghi_chu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;

    @Column(name = "nguoi_thuc_hien", length = 100)
    private String nguoiThucHien;

    @Column(name = "ngay_giao_dich", insertable = false, updatable = false)
    private LocalDateTime ngayGiaoDich;
}
