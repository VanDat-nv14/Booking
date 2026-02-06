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

    @Column(name = "ma_dat_phong", insertable = false, updatable = false) // Trigger generated
    private String maDatPhong;

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
    // @JsonIgnore // Don't ignore room details, useful for frontend
    private Phong phong;

    @Column(name = "gia_phong_goc", nullable = false)
    private BigDecimal giaPhongGoc;

    @Column(name = "thanh_tien", nullable = false)
    private BigDecimal thanhTien;

    @Column(name = "trang_thai")
    private String trangThai; // Chờ xác nhận

    @Column(name = "trang_thai_thanh_toan")
    private String trangThaiThanhToan; // Chưa thanh toán

    @Column(name = "ngay_dat", insertable = false, updatable = false)
    private LocalDateTime ngayDat;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "phieuDatPhong", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<ChiTietSuDungDV> chiTietDichVus;

    @OneToMany(mappedBy = "phieuDatPhong", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<PhuThu> phuThus;
}
