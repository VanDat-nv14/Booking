package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;

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
}
