package com.example.bookingkhachsan.dto;

import lombok.Data;

@Data
public class ReviewDto {
    private Integer phieuDatPhongId;
    private Integer khachSanId;
    private Integer nguoiDungId;
    private Integer soSaoTong;
    private String binhLuan;
}
