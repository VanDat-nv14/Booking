package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;


@Entity
@Table(name = "phong_kha_dung",
       uniqueConstraints = @UniqueConstraint(columnNames = {"phong_id", "ngay"}))
@Data
public class PhongKhaDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_id", nullable = false)
    private Phong phong;

    @Column(nullable = false)
    private LocalDate ngay;

    /**
     * Trang thai phong trong ngay:
     * - Trong: San sang cho dat
     * - TamGiu: Dang duoc giu boi booking Pending (30 phut)
     * - DaDat: Da xac nhan (Confirmed/CheckedIn)
     * - BaoTri: Dong phong bao tri
     */
    @Column(name = "trang_thai", nullable = false)
    private String trangThai = "Trong";

    @Column(name = "gia_theo_ngay")
    private BigDecimal giaTheongay;   // Override gia mac dinh theo ngay cu the

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_dat_phong_id")
    private PhieuDatPhong phieuDatPhong;
}
