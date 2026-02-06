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
    private String trangThai; // Chờ duyệt

    @Column(name = "ngay_danh_gia", insertable = false, updatable = false)
    private LocalDateTime ngayDanhGia;
}
