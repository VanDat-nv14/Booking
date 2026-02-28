package com.example.bookingkhachsan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PhongDto {
    @NotBlank(message = "Tên phòng không được để trống")
    private String ten;

    @NotBlank(message = "Mã phòng không được để trống")
    private String maPhong;

    @NotNull(message = "Giá tiền không được để trống")
    private BigDecimal giaTien;

    // Optional for creation, inferred from manager's hotel
    private Integer khachSanId;

    @NotNull(message = "Loại phòng không được để trống")
    private Integer loaiPhongId;

    private String khuyenMaiId;

    private String trangThai;

    private Integer tang;
    private String soPhong;
    private String moTa;
}
