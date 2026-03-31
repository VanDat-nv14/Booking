package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Báo cáo sự cố / phản ánh của khách hàng.
 *
 * Quy tắc:
 *  - mô tả phải >= 20 từ
 *  - email hoặc sdt phải hợp lệ
 *  - phải có bookingCode hợp lệ HOẶC khachSanId (báo cáo từ trang khách sạn)
 *  - Priority: LOW, MEDIUM, HIGH (dựa trên loại vấn đề)
 */
@Entity
@Table(name = "guest_report")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestReport {

    @Id
    @Column(name = "id", length = 30)
    private String id; // RPT-YYYYMMDD-XXXX

    /** Có thể null nếu báo cáo trực tiếp theo khách sạn (không gắn mã đặt phòng). */
    @Column(name = "booking_code", length = 30)
    private String bookingCode;

    /** Khi báo cáo từ trang chi tiết KS (không có booking). */
    @Column(name = "khach_san_id")
    private Integer khachSanId;

    /** Tên KS tại thời điểm gửi (hiển thị admin). */
    @Column(name = "khach_san_ten", length = 300)
    private String khachSanTen;

    @Column(name = "ho_ten", nullable = false, length = 200)
    private String hoTen;

    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "sdt", length = 20)
    private String sdt;

    /**
     * Loại vấn đề:
     * FACILITIES (cơ sở vật chất), SERVICE (dịch vụ),
     * NOISE (tiếng ồn), CLEANLINESS (vệ sinh),
     * SAFETY (an toàn), BILLING (thanh toán), OTHER (khác)
     */
    @Column(name = "loai_van_de", length = 50)
    private String loaiVanDe;

    @Column(name = "mo_ta", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String moTa; // >= 20 words

    /**
     * Mức độ ưu tiên: LOW, MEDIUM, HIGH
     * HIGH -> gắn cờ thông báo Admin ngay
     */
    @Column(name = "priority", length = 10)
    @Builder.Default
    private String priority = "MEDIUM";

    /**
     * Trạng thái: PENDING, IN_PROGRESS, RESOLVED, CLOSED
     */
    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private String trangThai = "PENDING";

    /** Phản hồi từ Admin/Manager */
    @Column(name = "phan_hoi", columnDefinition = "NVARCHAR(MAX)")
    private String phanHoi;

    /** Người xử lý (email của Admin/Manager) */
    @Column(name = "nguoi_xu_ly", length = 200)
    private String nguoiXuLy;

    /** Đã thông báo Admin chưa (đối với HIGH priority) */
    @Column(name = "da_thong_bao_admin")
    @Builder.Default
    private Boolean daThongBaoAdmin = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
