package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.SystemNotification;
import com.example.bookingkhachsan.entity.SystemNotificationRead;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.SystemNotificationReadRepository;
import com.example.bookingkhachsan.repository.SystemNotificationRepository;
import com.example.bookingkhachsan.util.IdGenerator;
import com.example.bookingkhachsan.util.NotificationTitleFix;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemNotificationService {

    private final SystemNotificationRepository notificationRepository;
    private final SystemNotificationReadRepository notificationReadRepository;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;

    private static final List<String> VALID_TYPES = Arrays.asList("SYSTEM", "POLICY", "ALERT", "INFO");
    /** Khớp {@link com.example.bookingkhachsan.entity.NguoiDung#getChucVu()} (Admin, HotelManager, User). */
    private static final List<String> VALID_TARGETS = Arrays.asList("ALL", "Admin", "HotelManager", "User");

    // DTO inner classes
    public record CreateNotificationRequest(
            String tieuDe,
            String noiDung,
            String loai,
            String doiTuong,
            String kenhGui,
            LocalDateTime lichGui
    ) {}

    public record ConfirmAlertRequest(
            String confirmationCode // có thể mở rộng sau để yêu cầu OTP/token
    ) {}

    /**
     * Admin tạo thông báo mới.
     * - Loại ALERT: tự động chuyển sang PENDING_CONFIRM (yêu cầu xác nhận lần 2)
     * - Loại khác: nếu có lichGui -> SCHEDULED, không có -> gửi ngay (SENT)
     */
    @Transactional
    public SystemNotification createNotification(CreateNotificationRequest req, String adminEmail) {
        // Validate
        if (req.tieuDe() == null || req.tieuDe().isBlank()) {
            throw new IllegalArgumentException("Tiêu đề thông báo không được để trống.");
        }
        if (req.noiDung() == null || req.noiDung().isBlank()) {
            throw new IllegalArgumentException("Nội dung thông báo không được để trống.");
        }
        if (!VALID_TYPES.contains(req.loai())) {
            throw new IllegalArgumentException("Loại thông báo không hợp lệ: " + req.loai()
                    + ". Phải là một trong: " + VALID_TYPES);
        }
        String doiTuong = normalizeDoiTuong(req.doiTuong() != null ? req.doiTuong() : "ALL");
        if (!VALID_TARGETS.contains(doiTuong)) {
            throw new IllegalArgumentException("Đối tượng không hợp lệ: " + doiTuong);
        }

        String trangThai;
        if ("ALERT".equals(req.loai())) {
            // ALERT bắt buộc phải xác nhận lần 2
            trangThai = "PENDING_CONFIRM";
        } else if (req.lichGui() != null && req.lichGui().isAfter(LocalDateTime.now())) {
            trangThai = "SCHEDULED";
        } else {
            trangThai = "SENT";
        }

        SystemNotification notification = SystemNotification.builder()
                .id(idGenerator.generateNotificationId())
                .tieuDe(req.tieuDe())
                .noiDung(req.noiDung())
                .loai(req.loai())
                .doiTuong(doiTuong)
                .kenhGui(req.kenhGui() != null ? req.kenhGui() : "APP")
                .trangThai(trangThai)
                .lichGui(req.lichGui())
                .ngayGui("SENT".equals(trangThai) ? LocalDateTime.now() : null)
                .nguoiTao(adminEmail)
                .build();

        SystemNotification saved = notificationRepository.save(notification);

        auditLogRepository.save(AuditLog.builder()
                .module("SYSTEM_NOTIFICATION")
                .entityId(saved.getId())
                .action("CREATE")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Tạo thông báo loại " + req.loai() + " | Trạng thái: " + trangThai)
                .build());

        if ("ALERT".equals(req.loai())) {
            log.warn("[SYSTEM_NOTIFICATION] ALERT tạo mới: {} - Cần xác nhận lần 2 bởi Admin.",
                    saved.getId());
        }

        return saved;
    }

    /**
     * Admin xác nhận lần 2 cho thông báo loại ALERT.
     * Sau khi xác nhận -> trạng thái SENT.
     */
    @Transactional
    public SystemNotification confirmAlert(String notificationId, String confirmingAdminEmail) {
        SystemNotification notification = getById(notificationId);

        if (!"ALERT".equals(notification.getLoai())) {
            throw new IllegalArgumentException("Chỉ có thông báo loại ALERT mới cần xác nhận lần 2.");
        }
        if (!"PENDING_CONFIRM".equals(notification.getTrangThai())) {
            throw new IllegalStateException(
                    "Thông báo không ở trạng thái chờ xác nhận. Trạng thái hiện tại: "
                            + notification.getTrangThai());
        }
        // Không cho phép người tạo tự xác nhận chính mình
        if (confirmingAdminEmail.equals(notification.getNguoiTao())) {
            throw new IllegalArgumentException(
                    "Người xác nhận không được là người tạo thông báo. Cần một Admin khác xác nhận.");
        }

        notification.setTrangThai("SENT");
        notification.setNgayGui(LocalDateTime.now());
        notification.setNguoiXacNhan(confirmingAdminEmail);

        SystemNotification updated = notificationRepository.save(notification);

        auditLogRepository.save(AuditLog.builder()
                .module("SYSTEM_NOTIFICATION")
                .entityId(notificationId)
                .action("CONFIRM_ALERT")
                .performedBy(confirmingAdminEmail)
                .role("Admin")
                .description("Xác nhận lần 2 thông báo ALERT - Đã gửi.")
                .build());

        return updated;
    }

    /**
     * Thông báo chuông trong app (theo email tài khoản trong DB). Không dùng SMTP/Gmail.
     * <p>REQUIRES_NEW: lỗi lưu thông báo không được phép làm hủy giao dịch nghiệp vụ chính (đặt phòng),
     * tránh 500 sau khi đã gửi mail nhưng insert notification thất bại / trùng khóa.</p>
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SystemNotification createDirectNotification(String receiverEmail, String title, String content, String type) {
        String emailNorm = normalizeEmail(receiverEmail);
        if (emailNorm == null || emailNorm.isBlank()) {
            log.warn("[SYSTEM_NOTIFICATION] Bỏ qua thông báo cá nhân — email người nhận rỗng.");
            return null;
        }
        SystemNotification notification = SystemNotification.builder()
                .id(idGenerator.generateNotificationId())
                .tieuDe(title)
                .noiDung(content)
                .loai(type != null ? type : "INFO")
                .doiTuong("PRIVATE") // Đánh dấu là cá nhân
                .nguoiNhan(emailNorm)
                .trangThai("SENT")
                .ngayGui(LocalDateTime.now())
                .kenhGui("APP")
                .build();

        return notificationRepository.save(notification);
    }

    /** Chuẩn hóa giá trị form/API cũ (ADMIN, …) sang chucVu trong DB. */
    private static String normalizeDoiTuong(String s) {
        if (s == null || s.isBlank()) {
            return "ALL";
        }
        return switch (s) {
            case "ADMIN" -> "Admin";
            case "HOTEL_MANAGER" -> "HotelManager";
            case "USER" -> "User";
            default -> s;
        };
    }

    /**
     * Lấy danh sách thông báo theo role và email cá nhân; gắn cờ {@code read} theo bảng đã đọc.
     */
    @Transactional
    public List<SystemNotification> getFilteredNotifications(String role, String email) {
        String emailKey = normalizeEmail(email);
        if (emailKey == null || emailKey.isBlank()) {
            return List.of();
        }
        List<SystemNotification> list = notificationRepository.findFilteredNotifications(role, emailKey);
        list.forEach(this::applyTitleRepair);
        Set<String> readIds = new HashSet<>(notificationReadRepository.findNotificationIdsByUserEmail(emailKey));
        list.forEach(n -> n.setRead(readIds.contains(n.getId())));
        return list;
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    /** Sửa tiêu đề lỗi mã hóa cũ và ghi lại DB (một lần cho mỗi bản ghi). */
    private void applyTitleRepair(SystemNotification n) {
        if (n == null || n.getTieuDe() == null) {
            return;
        }
        String fixed = NotificationTitleFix.repairIfNeeded(n.getTieuDe());
        if (!fixed.equals(n.getTieuDe())) {
            n.setTieuDe(fixed);
            notificationRepository.save(n);
            log.info("[SYSTEM_NOTIFICATION] Đã sửa tiêu đề lỗi mã hóa: {}", n.getId());
        }
    }

    /**
     * Đánh dấu tất cả thông báo của user là đã đọc.
     */
    @Transactional
    public void markAllAsRead(String userEmail, String role) {
        String emailKey = normalizeEmail(userEmail);
        if (emailKey == null || emailKey.isBlank()) return;
        List<SystemNotification> list = notificationRepository.findFilteredNotifications(role, emailKey);
        Set<String> alreadyRead = new HashSet<>(notificationReadRepository.findNotificationIdsByUserEmail(emailKey));
        for (SystemNotification n : list) {
            if (!alreadyRead.contains(n.getId())) {
                try {
                    notificationReadRepository.save(SystemNotificationRead.builder()
                            .userEmail(emailKey)
                            .notificationId(n.getId())
                            .readAt(LocalDateTime.now())
                            .build());
                } catch (Exception ignored) { }
            }
        }
    }

    /**
     * Đánh dấu đã đọc (chỉ khi thông báo thuộc danh sách được phép xem của user).
     */
    @Transactional
    public void markAsRead(String notificationId, String userEmail, String role) {
        getById(notificationId);
        boolean isAdmin = "Admin".equals(role) || "ADMIN".equals(role);
        if (!isAdmin) {
            List<SystemNotification> allowed = notificationRepository.findFilteredNotifications(role, normalizeEmail(userEmail));
            if (allowed.stream().noneMatch(n -> notificationId.equals(n.getId()))) {
                throw new IllegalArgumentException("Không tìm thấy thông báo hoặc không có quyền.");
            }
        }
        String emailKey = normalizeEmail(userEmail);
        if (notificationReadRepository.existsByUserEmailAndNotificationId(emailKey, notificationId)) {
            return;
        }
        notificationReadRepository.save(SystemNotificationRead.builder()
                .userEmail(emailKey)
                .notificationId(notificationId)
                .readAt(LocalDateTime.now())
                .build());
    }

    /**
     * Hủy thông báo (chỉ khi còn DRAFT, PENDING_CONFIRM, SCHEDULED).
     */
    @Transactional
    public SystemNotification cancelNotification(String notificationId, String adminEmail) {
        SystemNotification notification = getById(notificationId);

        if (List.of("SENT", "CANCELLED").contains(notification.getTrangThai())) {
            throw new IllegalStateException(
                    "Không thể hủy thông báo đã gửi hoặc đã hủy.");
        }

        notification.setTrangThai("CANCELLED");
        SystemNotification updated = notificationRepository.save(notification);

        auditLogRepository.save(AuditLog.builder()
                .module("SYSTEM_NOTIFICATION")
                .entityId(notificationId)
                .action("CANCEL")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Hủy thông báo: " + notification.getTieuDe())
                .build());

        return updated;
    }

    @Transactional
    public SystemNotification getById(String id) {
        SystemNotification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo: " + id));
        applyTitleRepair(n);
        return n;
    }

    @Transactional
    public List<SystemNotification> getAll() {
        List<SystemNotification> all = notificationRepository.findAll();
        all.forEach(this::applyTitleRepair);
        // Chỉ hiện thông báo do Admin tạo thủ công (nguoiTao != null) trong danh sách quản lý
        return all.stream()
                .filter(n -> n.getNguoiTao() != null)
                .toList();
    }

    @Transactional
    public List<SystemNotification> getPendingAlerts() {
        List<SystemNotification> list = notificationRepository.findPendingAlerts();
        list.forEach(this::applyTitleRepair);
        return list;
    }

    @Transactional
    public List<SystemNotification> getByStatus(String trangThai) {
        List<SystemNotification> list = notificationRepository.findByTrangThaiOrderByCreatedAtDesc(trangThai);
        list.forEach(this::applyTitleRepair);
        // Chỉ hiện thông báo do Admin tạo thủ công (nguoiTao != null) trong danh sách quản lý
        return list.stream()
                .filter(n -> n.getNguoiTao() != null)
                .toList();
    }

    /**
     * Admin cập nhật thông báo (chỉ với thông báo thủ công).
     */
    @Transactional
    public SystemNotification updateNotification(String id, CreateNotificationRequest req, String adminEmail) {
        SystemNotification n = getById(id);
        if (n.getNguoiTao() == null) {
            throw new IllegalArgumentException("Không thể chỉnh sửa thông báo hệ thống tự động.");
        }

        if (req.tieuDe() != null && !req.tieuDe().isBlank()) n.setTieuDe(req.tieuDe());
        if (req.noiDung() != null && !req.noiDung().isBlank()) n.setNoiDung(req.noiDung());
        if (req.loai() != null && VALID_TYPES.contains(req.loai())) n.setLoai(req.loai());
        if (req.doiTuong() != null) n.setDoiTuong(normalizeDoiTuong(req.doiTuong()));
        if (req.lichGui() != null) n.setLichGui(req.lichGui());

        SystemNotification updated = notificationRepository.save(n);

        auditLogRepository.save(AuditLog.builder()
                .module("SYSTEM_NOTIFICATION")
                .entityId(id)
                .action("UPDATE")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Cập nhật thông báo: " + n.getTieuDe())
                .build());

        return updated;
    }

    /**
     * Admin xóa thông báo hoàn toàn.
     */
    @Transactional
    public void deleteNotification(String id, String adminEmail) {
        SystemNotification n = getById(id);
        notificationRepository.delete(n);

        auditLogRepository.save(AuditLog.builder()
                .module("SYSTEM_NOTIFICATION")
                .entityId(id)
                .action("DELETE")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Xóa thông báo: " + (n.getTieuDe() != null ? n.getTieuDe() : id))
                .build());
    }

    /**
     * Scheduled job: Kiểm tra thông báo đã đến lịch gửi mỗi phút.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void processDueNotifications() {
        List<SystemNotification> dues = notificationRepository.findDueScheduledNotifications(LocalDateTime.now());
        for (SystemNotification n : dues) {
            n.setTrangThai("SENT");
            n.setNgayGui(LocalDateTime.now());
            notificationRepository.save(n);
            log.info("[SYSTEM_NOTIFICATION] Đã gửi thông báo lên lịch: {}", n.getId());
        }
    }
}
