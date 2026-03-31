package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Ghi lại các hành động quan trọng trong hệ thống.
 * Đặc biệt dành cho Notifications, Discounts, Promotions.
 */
@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Module nguồn: GUEST_REPORT, SYSTEM_NOTIFICATION, DISCOUNT, PROMOTION */
    @Column(name = "module", nullable = false, length = 50)
    private String module;

    /** ID của bản ghi liên quan trong module đó */
    @Column(name = "entity_id", length = 100)
    private String entityId;

    /** Hành động: CREATE, UPDATE, DELETE, APPROVE, REJECT, SEND */
    @Column(name = "action", nullable = false, length = 50)
    private String action;

    /** Email/username của người thực hiện */
    @Column(name = "performed_by", length = 200)
    private String performedBy;

    /** Vai trò của người thực hiện */
    @Column(name = "role", length = 50)
    private String role;

    /** Mô tả chi tiết hành động */
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    /** Giá trị cũ (JSON nếu cần) */
    @Column(name = "old_value", columnDefinition = "NVARCHAR(MAX)")
    private String oldValue;

    /** Giá trị mới (JSON nếu cần) */
    @Column(name = "new_value", columnDefinition = "NVARCHAR(MAX)")
    private String newValue;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
