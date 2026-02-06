package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "chi_tiet_su_dung_dv")
@Data
public class ChiTietSuDungDV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_dat_phong_id", nullable = false)
    @JsonIgnore
    private PhieuDatPhong phieuDatPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dich_vu_id", nullable = false)
    private DichVu dichVu;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "don_gia_luc_dat", nullable = false)
    private BigDecimal donGiaLucDat;

    @Column(name = "thoi_gian_su_dung", insertable = false, updatable = false)
    private LocalDateTime thoiGianSuDung;
}
