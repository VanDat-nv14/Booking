package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "phu_thu")
@Data
public class PhuThu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_dat_phong_id", nullable = false)
    @JsonIgnore
    private PhieuDatPhong phieuDatPhong;

    @Column(name = "loai_phu_thu", nullable = false)
    private String loaiPhuThu;

    @Column(name = "so_tien", nullable = false)
    private BigDecimal soTien;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
