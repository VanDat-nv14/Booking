package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
// import java.util.List;

@Entity
@Table(name = "loai_phong")
@Data
public class LoaiPhong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String ten;

    @Column(name = "so_khach", nullable = false)
    private Integer soKhach;

    // === Mo rong: Thong tin chi tiet ===
    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "dien_tich")
    private BigDecimal dienTich;   // m2

    @Column(name = "so_giuong")
    private Integer soGiuong;

    @Column(name = "loai_giuong")
    private String loaiGiuong;    // "Don", "Doi", "King", "Twin"

    // CSV: "WiFi,TV,Dieu_hoa,Tu_lanh"  — parse tren frontend
    @Column(name = "tien_ich", length = 1000)
    private String tienIch;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;

    // === Gia dong ===
    @Column(name = "gia_cuoi_tuan_pct")
    private BigDecimal giaCuoiTuanPct = BigDecimal.ZERO;   // % tang gia cuoi tuan

    @Column(name = "gia_le_pct")
    private BigDecimal giaLePct = BigDecimal.ZERO;          // % tang gia ngay le

    // === Chinh sach huy ===
    @Column(name = "cho_phep_huy")
    private Boolean choPhepHuy = true;

    @Column(name = "mien_phi_huy_truoc_gio")
    private Integer mienPhiHuyTruocGio = 48;   // So gio truoc check-in

    @Column(name = "phi_huy_pct")
    private BigDecimal phiHuyPct = BigDecimal.ZERO; // % phi huy neu huy muon
}
