package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "khuyen_mai")
@Data
public class KhuyenMai {
    @Id
    private String id; // Code is the ID

    @Column(nullable = false)
    private String ten;

    @Column(name = "phan_tram", nullable = false)
    private BigDecimal phanTram;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @ManyToOne
    @JoinColumn(name = "khach_san_id", nullable = false)
    @JsonIgnore
    private KhachSan khachSan;
}
