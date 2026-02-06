package com.example.bookingkhachsan.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BookingDto {

    @Data
    public static class CreateBookingRequest {
        private Integer phongId;
        private Integer nguoiDungId;
        private LocalDate ngayDen;
        private LocalDate ngayDi;
    }

    @Data
    public static class AddServiceRequest {
        private Integer phieuDatPhongId;
        private Integer dichVuId;
        private Integer soLuong;
    }

    @Data
    public static class AddSurchargeRequest {
        private Integer phieuDatPhongId;
        private String loaiPhuThu;
        private BigDecimal soTien;
    }
}
