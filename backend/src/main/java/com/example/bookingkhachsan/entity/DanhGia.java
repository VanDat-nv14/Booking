package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "danh_gia")
@Data
public class DanhGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_dat_phong_id", nullable = false)
    @JsonIgnore
    private PhieuDatPhong phieuDatPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_san_id", nullable = false)
    @JsonIgnore
    private KhachSan khachSan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "so_sao_tong")
    private Integer soSaoTong;

    @Column(name = "binh_luan", columnDefinition = "NVARCHAR(MAX)")
    private String binhLuan;

    @Column(name = "trang_thai")
    private String trangThai; // Chờ duyệt -> Đã duyệt

    @Column(name = "phan_hoi", columnDefinition = "NVARCHAR(MAX)")
    private String phanHoi;

    @Column(name = "ngay_phan_hoi")
    private LocalDateTime ngayPhanHoi;

    @Column(name = "ngay_danh_gia")
    private LocalDateTime ngayDanhGia;
    @com.fasterxml.jackson.annotation.JsonProperty("hoTenKhach")
    public String getHoTenKhach() {
        return nguoiDung != null ? nguoiDung.getHoTen() : "Khách ẩn danh";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("maDatPhong")
    public String getMaDatPhong() {
        return phieuDatPhong != null ? phieuDatPhong.getMaDatPhong() : null;
    }
}
