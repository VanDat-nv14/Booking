package com.example.bookingkhachsan.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Đánh giá của user — đủ dữ liệu hiển thị trang "Đánh giá của tôi" (không lộ entity nội bộ).
 */
@Data
@Builder
public class UserReviewResponse {
    private Integer id;
    private Integer soSaoTong;
    private String binhLuan;
    private String phanHoi;
    private LocalDateTime ngayPhanHoi;
    private LocalDateTime ngayDanhGia;
    private String maDatPhong;
    private KhachSanMini khachSan;

    @Data
    @Builder
    public static class KhachSanMini {
        private Integer id;
        private String ten;
        private String diaChi;
        private String hinhAnhBia;
    }
}
