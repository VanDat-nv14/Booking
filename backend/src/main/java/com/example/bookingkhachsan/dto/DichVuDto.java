package com.example.bookingkhachsan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DichVuDto {
    @NotBlank(message = "Tên dịch vụ không được để trống")
    private String ten;

    @NotNull(message = "Giá tiền không được để trống")
    private BigDecimal giaTien;

    private String donViTinh;

    private Integer khachSanId;
}
