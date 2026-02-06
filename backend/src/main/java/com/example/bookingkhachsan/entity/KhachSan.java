package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "khach_san")
@Data
public class KhachSan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String ten;

    @Column(name = "dia_chi", nullable = false)
    private String diaChi;

    @Column(name = "so_sao")
    private Integer soSao;

    @ManyToOne
    @JoinColumn(name = "vi_tri_id", nullable = false)
    private ViTri viTri;

    @ManyToOne
    @JoinColumn(name = "nguoi_quan_ly_id")
    @JsonIgnore
    private NguoiDung nguoiQuanLy;

    @Column(name = "gio_nhan_phong")
    private LocalTime gioNhanPhong;

    @Column(name = "gio_tra_phong")
    private LocalTime gioTraPhong;

    @Column(name = "diem_danh_gia_trung_binh")
    private BigDecimal diemDanhGiaTrungBinh;

    @Column(name = "so_luot_danh_gia")
    private Integer soLuotDanhGia;

    @Column(name = "trang_thai")
    private String trangThai; // Hoạt động

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "khachSan", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnore
    private List<Phong> phongs;
    
    @OneToMany(mappedBy = "khachSan", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnore
    private List<DichVu> dichVus;
}
