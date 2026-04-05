package com.example.bookingkhachsan.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDto {

    // ==================== REQUEST DTOs ====================

    /** Tao moi dat phong */
    @Data
    public static class CreateBookingRequest {
        @NotNull(message = "Phong khong duoc de trong")
        private Integer phongId;

        @NotNull(message = "Nguoi dung khong duoc de trong")
        private Integer nguoiDungId;

        @NotNull(message = "Ngay den khong duoc de trong")
        @FutureOrPresent(message = "Ngay den phai la hom nay hoac tuong lai")
        private LocalDate ngayDen;

        @NotNull(message = "Ngay di khong duoc de trong")
        @Future(message = "Ngay di phai la trong tuong lai")
        private LocalDate ngayDi;

        private String loaiDatPhong = "InstantBooking"; // InstantBooking | RequestToBook
        private String phuongThucThanhToan;
        private Integer soNguoiLon = 1;
        private Integer soTreEm  = 0;
        private String ghiChuKhach;

        /** Một mã: discount nền tảng (Admin) hoặc promotion code (Manager KS) — không stack */
        private String couponCode;
    }

    /** Kiem tra phong trong theo khoang ngay */
    @Data
    public static class AvailabilityRequest {
        @NotNull private Integer khachSanId;
        @NotNull private LocalDate checkIn;
        @NotNull private LocalDate checkOut;
        private Integer loaiPhongId; // Optional: loc theo loai phong
    }

    /** Huy dat phong */
    @Data
    public static class CancelBookingRequest {
        @NotBlank(message = "Li do huy khong duoc de trong")
        private String ghiChuHuy;
    }

    /** Ghi nhan thanh toan */
    @Data
    public static class RecordPaymentRequest {
        @NotNull private Integer phieuDatPhongId;

        @NotNull @DecimalMin("0.01")
        private BigDecimal soTien;

        @NotBlank
        private String phuongThuc;     // TienMat, ChuyenKhoan, VNPAY

        private String loaiGiaoDich = "ThanhToan";  // ThanhToan | HoanTien
        private String maGiaoDich;
        private String ghiChu;
    }

    /** Xac nhan checkout */
    @Data
    public static class CheckoutRequest {
        @NotNull private Integer phieuDatPhongId;
        private String phuongThuc = "TienMat";
    }

    /** Them dich vu */
    @Data
    public static class AddServiceRequest {
        @NotNull private Integer phieuDatPhongId;
        @NotNull private Integer dichVuId;
        @NotNull @Min(1) private Integer soLuong;
    }

    /** Phu thu */
    @Data
    public static class AddSurchargeRequest {
        @NotNull private Integer phieuDatPhongId;
        @NotBlank private String loaiPhuThu;
        @NotNull @DecimalMin("0.0") private BigDecimal soTien;
    }

    // ==================== RESPONSE DTOs ====================

    /** Response tạo link thanh toán VNPAY */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VnPayCreatePaymentResponse {
        private Integer bookingId;
        private BigDecimal amount;
        private String paymentUrl;
        private LocalDateTime expiredAt;
    }

    /** Response dat phong day du */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingResponse {
        private Integer id;
        private String maDatPhong;
        private String trangThai;
        private String trangThaiThanhToan;

        // Thong tin phong
        private Integer phongId;
        private String tenPhong;
        private String maPhong;
        private Integer tang;
        private String soPhong;
        private String loaiPhong;
        private Integer khachSanId;
        private String tenKhachSan;
        private String hinhAnhBia;  // Ảnh bìa khách sạn cho card
        private Boolean isReviewed;
        /** Số sao đã chấm (1–5), có khi isReviewed = true */
        private Integer soSaoDanhGia;

        // Thong tin nguoi dat
        private Integer nguoiDungId;
        private String hoTenKhach;
        private String emailKhach;
        private String sdtKhach;

        // Lich dat
        private LocalDate ngayDen;
        private LocalDate ngayDi;
        private Integer soNgay;

        // Tai chinh
        private BigDecimal giaPhongGoc;
        private BigDecimal thanhTien;
        private String phuongThucThanhToan;

        // Tien coc
        private BigDecimal tienCoc;
        private String trangThaiCoc;

        // Thong tin booking
        private String loaiDatPhong;
        private LocalDateTime pendingExpiresAt;
        private LocalDateTime ngayDat;
        private String ghiChuKhach;

        /** DISCOUNT | PROMO_CODE — snapshot mã áp dụng */
        private String couponNguon;
        private String couponRefId;
        private String maCoupon;
        private BigDecimal tienGiamCoupon;
    }

    /** Lich su thanh toan */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaymentHistoryResponse {
        private Integer id;
        private BigDecimal soTien;
        private String loaiGiaoDich;
        private String phuongThuc;
        private String trangThai;
        private String maGiaoDich;
        private String ghiChu;
        private String nguoiThucHien;
        private LocalDateTime ngayGiaoDich;
    }

    /** Phong con trong */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AvailableRoomResponse {
        private Integer phongId;
        private String tenPhong;
        private String maPhong;
        private Integer tang;
        private String soPhong;
        private BigDecimal giaTien;        // Gia mac dinh
        private BigDecimal giaTheoNgay;   // Gia hien tai (co the dynamic)

        // Loai phong
        private Integer loaiPhongId;
        private String tenLoaiPhong;
        private Integer soKhach;
        private BigDecimal dienTich;
        private Integer soGiuong;
        private String loaiGiuong;
        private String tienIch;            // CSV
        private String hinhAnh;

        // Chinh sach
        private Boolean choPhepHuy;
        private Integer mienPhiHuyTruocGio;
        private BigDecimal phiHuyPct;

        // So ngay
        private Integer soNgay;
        private BigDecimal tongTienDuTinh;

        // Tien coc du tinh (tiLeCoc% * tongTienDuTinh)
        private BigDecimal tiLeCocKhachSan;  // To le % (VD: 30.00)
        private BigDecimal tienCocDuTinh;    // So tien coc cu the
    }

    /** Chi tiet mot dong dich vu trong hoa don */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvoiceServiceItem {
        private String tenDichVu;
        private Integer soLuong;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
    }

    /** Chi tiet mot dong phu thu trong hoa don */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvoiceSurchargeItem {
        private String loaiPhuThu;
        private BigDecimal soTien;
    }

    /** Hoa don chi tiet sau khi check-in / checkout */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvoiceResponse {
        private Integer bookingId;
        private String maDatPhong;
        private String trangThai;
        private String trangThaiThanhToan;

        // Thong tin khach
        private String hoTenKhach;
        private String emailKhach;
        private String sdtKhach;

        // Thong tin phong
        private String tenPhong;
        private String loaiPhong;
        private LocalDate ngayDen;
        private LocalDate ngayDi;
        private Integer soNgay;

        // Tai chinh
        private BigDecimal giaPhongMot;
        private BigDecimal tienPhong;       // giaPhong * soNgay
        private List<InvoiceServiceItem> dichVus;
        private List<InvoiceSurchargeItem> phuThus;
        private BigDecimal tienDichVu;
        private BigDecimal tienPhuThu;
        private BigDecimal tongCong;
        private BigDecimal tienCoc;
        private String trangThaiCoc;

        // Phuong thuc thanh toan
        private String phuongThucThanhToan;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HotelRevenueReport {
        private BigDecimal totalRevenue;
        private List<MonthlyRevenue> monthlyStats;
        private List<SurchargeDetail> surcharges;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyRevenue {
        private String month; // format "YYYY-MM" hoặc "M" 
        private BigDecimal roomRevenue;
        private BigDecimal serviceRevenue;
        private BigDecimal surchargeRevenue;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SurchargeDetail {
        private String maDatPhong;
        private String loaiPhuThu;
        private BigDecimal soTien;
        private java.time.LocalDateTime ngayThu;
    }
}
