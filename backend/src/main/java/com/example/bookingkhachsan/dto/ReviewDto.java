package com.example.bookingkhachsan.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewDto {
    private Integer phieuDatPhongId;
    
    @NotNull(message = "Khách sạn không được để trống")
    private Integer khachSanId;
    
    @NotNull(message = "Người dùng không được để trống")
    private Integer nguoiDungId;
    
    @NotNull(message = "Số sao không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer soSaoTong;
    
    @Size(max = 1000, message = "Bình luận không được vượt quá 1000 ký tự")
    private String binhLuan;
}
