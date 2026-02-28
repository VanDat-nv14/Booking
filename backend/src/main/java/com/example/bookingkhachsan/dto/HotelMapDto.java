package com.example.bookingkhachsan.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HotelMapDto {
    private Integer id;
    private String ten;
    private String hinhAnhBia;
    private Integer soSao;
    private BigDecimal diemDanhGiaTrungBinh;
    private Integer soLuotDanhGia;
    private Double viDo;
    private Double kinhDo;
    private BigDecimal giaThapNhat; // Lấy giá phòng thấp nhất để hiển thị Marker
}
