package com.example.bookingkhachsan.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO trả về đầy đủ thông tin khách sạn cho trang chi tiết khách hàng.
 * Bao gồm: thông tin cơ bản, ảnh, vị trí, dịch vụ và đánh giá.
 */
@Data
public class HotelDetailDto {

    private Integer id;
    private String ten;
    private String diaChi;
    private Integer soSao;
    private String moTa;
    private LocalTime gioNhanPhong;
    private LocalTime gioTraPhong;
    private BigDecimal diemDanhGiaTrungBinh;
    private Integer soLuotDanhGia;
    private String trangThai;

    // Toạ độ bản đồ
    private Double viDo;
    private Double kinhDo;

    // Ảnh
    private String hinhAnhBia;
    private List<String> hinhAnhs;

    // Vị trí
    private String tenViTri;
    private String tenTinhThanh;
    private String tenQuocGia;
    private String hinhAnhViTri;

    // Dịch vụ
    private List<DichVuInfo> dichVus;

    // Đánh giá gần đây
    private List<ReviewInfo> danhGias;

    // ──────────────────────── Inner DTOs ────────────────────────

    @Data
    public static class DichVuInfo {
        private Integer id;
        private String ten;
        private BigDecimal giaTien;
        private String donViTinh;
    }

    @Data
    public static class ReviewInfo {
        private Integer id;
        private String tenKhach;
        private Integer soSaoTong;
        private String binhLuan;
        private String trangThai;
        private String phanHoi;
        private LocalDateTime ngayPhanHoi;
        private LocalDateTime ngayDanhGia;
    }
}
