package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.SystemNotification;
import com.example.bookingkhachsan.service.SystemNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system-notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemNotificationController {

    private final SystemNotificationService notificationService;

    /**
     * POST /api/system-notifications
     * Admin tạo thông báo mới.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SystemNotification> createNotification(
            @RequestBody SystemNotificationService.CreateNotificationRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                notificationService.createNotification(request, currentUser.getEmail()));
    }

    /**
     * GET /api/system-notifications
     * Admin lấy tất cả; Manager/User chỉ lấy những cái đã gửi (SENT).
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager', 'ROLE_User')")
    public ResponseEntity<List<SystemNotification>> getAllNotifications(
        @RequestParam(required = false) String trangThai,
        @AuthenticationPrincipal NguoiDung currentUser
    ) {
        String cv = currentUser.getChucVu();
        boolean isAdmin = "Admin".equals(cv) || "ADMIN".equals(cv);
        if (isAdmin) {
            if (trangThai != null) {
                return ResponseEntity.ok(notificationService.getByStatus(trangThai));
            }
            return ResponseEntity.ok(notificationService.getAll());
        }
        return ResponseEntity.ok(notificationService.getFilteredNotifications(
                currentUser.getChucVu(),
                currentUser.getEmail()
        ));
    }

    /**
     * PUT /api/system-notifications/read-all
     * Đánh dấu tất cả thông báo là đã đọc.
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager', 'ROLE_User')")
    public ResponseEntity<Void> markAllNotificationsRead(@AuthenticationPrincipal NguoiDung currentUser) {
        notificationService.markAllAsRead(currentUser.getEmail(), currentUser.getChucVu());
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/system-notifications/{id}/read
     * Đánh dấu đã đọc (Manager/User/Admin).
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager', 'ROLE_User')")
    public ResponseEntity<Void> markNotificationRead(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        notificationService.markAsRead(id, currentUser.getEmail(), currentUser.getChucVu());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/system-notifications/{id}
     * Admin xem chi tiết thông báo.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SystemNotification> getNotification(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    /**
     * GET /api/system-notifications/pending-alerts
     * Admin lấy danh sách ALERT đang chờ xác nhận lần 2.
     */
    @GetMapping("/pending-alerts")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<List<SystemNotification>> getPendingAlerts() {
        return ResponseEntity.ok(notificationService.getPendingAlerts());
    }

    /**
     * PUT /api/system-notifications/{id}/confirm-alert
     * Admin xác nhận lần 2 cho thông báo ALERT.
     * (Người xác nhận phải khác người tạo)
     */
    @PutMapping("/{id}/confirm-alert")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SystemNotification> confirmAlert(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                notificationService.confirmAlert(id, currentUser.getEmail()));
    }

    /**
     * PUT /api/system-notifications/{id}/cancel
     * Admin hủy thông báo.
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SystemNotification> cancelNotification(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                notificationService.cancelNotification(id, currentUser.getEmail()));
    }

    /**
     * PUT /api/system-notifications/{id}
     * Admin cập nhật thông báo.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SystemNotification> updateNotification(
            @PathVariable String id,
            @RequestBody SystemNotificationService.CreateNotificationRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                notificationService.updateNotification(id, request, currentUser.getEmail()));
    }

    /**
     * DELETE /api/system-notifications/{id}
     * Admin xóa hoàn toàn thông báo.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        notificationService.deleteNotification(id, currentUser.getEmail());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/system-notifications/stats
     * Admin xem thống kê thông báo.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<SystemNotification> all = notificationService.getAll();
        long draft = all.stream().filter(n -> "DRAFT".equals(n.getTrangThai())).count();
        long pendingConfirm = all.stream().filter(n -> "PENDING_CONFIRM".equals(n.getTrangThai())).count();
        long sent = all.stream().filter(n -> "SENT".equals(n.getTrangThai())).count();
        long scheduled = all.stream().filter(n -> "SCHEDULED".equals(n.getTrangThai())).count();

        return ResponseEntity.ok(Map.of(
                "total", all.size(),
                "draft", draft,
                "pendingConfirm", pendingConfirm,
                "sent", sent,
                "scheduled", scheduled
        ));
    }
}
