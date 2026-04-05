package com.example.bookingkhachsan.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Thông báo hệ thống gửi đến người dùng theo vai trò.
 * <p>String fields dùng mapping mặc định của Hibernate + SQL Server để khớp cột VARCHAR/NVARCHAR
 * thực tế trong DB; ép {@code NVARCHAR} qua {@code SqlTypes.NVARCHAR} từng gây lỗi driver
 * "The conversion from varchar to NCHAR is unsupported" khi cột là VARCHAR.</p>
 *
 * Loại thông báo:
 *  - SYSTEM: Thông báo hệ thống (bảo trì, cập nhật)
 *  - POLICY: Thay đổi chính sách
 *  - ALERT: Cảnh báo khẩn cấp (yêu cầu xác nhận lần 2)
 *  - INFO: Thông tin thông thường
 */
@Entity
@Table(name = "system_notification")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemNotification {

    @Id
    @Column(name = "id", length = 30)
    private String id; // NTB-YYYYMMDD-XXXX

    @Column(name = "tieu_de", nullable = false, length = 300, columnDefinition = "NVARCHAR(300)")
    private String tieuDe;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    /**
     * Loại thông báo: SYSTEM, POLICY, ALERT, INFO
     */
    @Column(name = "loai", nullable = false, length = 20)
    private String loai;

    /**
     * Đối tượng nhận:
     * ALL, Admin, HotelManager, User (khớp chucVu); PRIVATE cho thông báo cá nhân.
     */
    @Column(name = "doi_tuong", length = 50)
    @Builder.Default
    private String doiTuong = "ALL";

    /**
     * Kênh gửi: APP, EMAIL, SMS (comma-separated)
     * Hiện tại EMAIL/SMS là các trường dữ liệu chờ, APP là kênh chính hoạt động.
     */
    @Column(name = "kenh_gui", length = 100)
    @Builder.Default
    private String kenhGui = "APP";

    /**
     * Trạng thái:
     * DRAFT (nháp), PENDING_CONFIRM (chờ xác nhận lần 2 - chỉ ALERT),
     * SCHEDULED (đã lên lịch), SENT (đã gửi), CANCELLED (đã hủy)
     */
    @Column(name = "trang_thai", length = 30)
    @Builder.Default
    private String trangThai = "DRAFT";

    /** Thời điểm lên lịch gửi (null = gửi ngay) */
    @Column(name = "lich_gui")
    private LocalDateTime lichGui;

    /** Thời điểm thực sự đã gửi */
    @Column(name = "ngay_gui")
    private LocalDateTime ngayGui;

    /** Người tạo (email) */
    @Column(name = "nguoi_tao", length = 200)
    private String nguoiTao;

    @Column(name = "nguoi_xac_nhan", length = 200)
    private String nguoiXacNhan;

    /** Email người nhận cụ thể (nullable: nếu có giá trị thì chỉ người này thấy) */
    @Column(name = "nguoi_nhan", length = 200)
    private String nguoiNhan;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Chỉ dùng khi trả JSON cho client; không lưu DB. */
    @Transient
    @JsonProperty("read")
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private Boolean read;

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
