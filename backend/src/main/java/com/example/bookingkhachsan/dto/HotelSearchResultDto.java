package com.example.bookingkhachsan.dto;

import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.ViTri;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Khách sạn trên danh sách tìm kiếm / trang chủ — kèm số phòng còn trống theo khoảng ngày.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelSearchResultDto {

    private Integer id;
    private String ten;
    private String diaChi;
    private Integer soSao;
    private String moTa;
    private BigDecimal diemDanhGiaTrungBinh;
    private Integer soLuotDanhGia;
    private String hinhAnhBia;
    private String trangThai;

    private ViTriBrief viTri;

    /** Số phòng còn đặt được (theo phong_kha_dung) trong khoảng check-in → check-out */
    private Integer soPhongTrong;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViTriBrief {
        private Integer id;
        private String ten;
        private String hinhAnh;
    }

    public static HotelSearchResultDto from(KhachSan k, int soPhongTrong) {
        var b = HotelSearchResultDto.builder()
                .id(k.getId())
                .ten(k.getTen())
                .diaChi(k.getDiaChi())
                .soSao(k.getSoSao())
                .moTa(k.getMoTa())
                .diemDanhGiaTrungBinh(k.getDiemDanhGiaTrungBinh())
                .soLuotDanhGia(k.getSoLuotDanhGia())
                .hinhAnhBia(k.getHinhAnhBia())
                .trangThai(k.getTrangThai())
                .soPhongTrong(soPhongTrong);
        ViTri vt = k.getViTri();
        if (vt != null) {
            b.viTri(new ViTriBrief(vt.getId(), vt.getTen(), vt.getHinhAnh()));
        }
        return b.build();
    }
}
