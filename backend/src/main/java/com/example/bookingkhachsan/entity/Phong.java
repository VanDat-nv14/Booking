package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "phong")
@Data
public class Phong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String ten;

    @Column(name = "ma_phong", nullable = false)
    private String maPhong;

    @Column(name = "gia_tien", nullable = false)
    private BigDecimal giaTien;

    @ManyToOne
    @JoinColumn(name = "khach_san_id", nullable = false)
    @JsonIgnore
    private KhachSan khachSan;

    @ManyToOne
    @JoinColumn(name = "loai_phong_id", nullable = false)
    private LoaiPhong loaiPhong;

    @ManyToOne
    @JoinColumn(name = "khuyen_mai_id")
    private KhuyenMai khuyenMai;

    @Column(name = "trang_thai")
    private String trangThai = "Trong";

    // === Mo rong: vi tri cu the ===
    @Column(name = "tang")
    private Integer tang;         // So tang (1, 2, 3...)

    @Column(name = "so_phong", length = 20)
    private String soPhong;       // Ma phong: "101", "202A"

    @Column(name = "so_khach")
    private Integer soKhach;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;
}
