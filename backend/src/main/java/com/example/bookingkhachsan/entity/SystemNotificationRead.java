package com.example.bookingkhachsan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Đánh dấu thông báo hệ thống đã đọc theo từng user (email).
 */
@Entity
@Table(
        name = "system_notification_read",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_email", "notification_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemNotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false, length = 200)
    private String userEmail;

    @Column(name = "notification_id", nullable = false, length = 30)
    private String notificationId;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
    }
}
