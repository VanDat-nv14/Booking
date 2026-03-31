package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.GuestReport;
import com.example.bookingkhachsan.entity.PhieuDatPhong;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.repository.GuestReportRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.repository.PhieuDatPhongRepository;
import com.example.bookingkhachsan.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestReportService {

    private final GuestReportRepository guestReportRepository;
    private final PhieuDatPhongRepository phieuDatPhongRepository;
    private final KhachSanRepository khachSanRepository;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(\\+84|0)[3-9][0-9]{8}$");

    // Loại vấn đề HIGH priority
    private static final List<String> HIGH_PRIORITY_TYPES =
            Arrays.asList("SAFETY", "BILLING");
    private static final List<String> MEDIUM_PRIORITY_TYPES =
            Arrays.asList("NOISE", "CLEANLINESS", "SERVICE");
    // LOW: FACILITIES, OTHER

    // DTO inner classes
    public record CreateReportRequest(
            String bookingCode,
            Integer khachSanId,
            String hoTen,
            String email,
            String sdt,
            String loaiVanDe,
            String moTa
    ) {}

    public record UpdateReportRequest(
            String trangThai,
            String phanHoi,
            String nguoiXuLy
    ) {}

    /**
     * Khách gửi báo cáo sự cố.
     * Xác thực:
     *  1. email hợp lệ HOẶC sdt hợp lệ
     *  2. bookingCode tồn tại trong DB
     *  3. moTa >= 20 từ
     *  4. Gán priority dựa trên loaiVanDe
     *  5. HIGH priority -> gắn cờ daThongBaoAdmin = true
     */
    @Transactional
    public GuestReport createReport(CreateReportRequest req) {
        if (req.hoTen() == null || req.hoTen().isBlank()) {
            throw new IllegalArgumentException("Họ tên không được để trống.");
        }
        String hoTen = req.hoTen().trim();
        // 1. Xác thực email hoặc sdt
        boolean emailValid = req.email() != null && EMAIL_PATTERN.matcher(req.email()).matches();
        boolean phoneValid = req.sdt() != null && PHONE_PATTERN.matcher(req.sdt()).matches();
        if (!emailValid && !phoneValid) {
            throw new IllegalArgumentException("Phải cung cấp email hợp lệ hoặc số điện thoại hợp lệ.");
        }

        boolean hasBooking = req.bookingCode() != null && !req.bookingCode().isBlank();
        boolean hasHotel = req.khachSanId() != null;
        if (hasBooking == hasHotel) {
            throw new IllegalArgumentException(
                    "Cần gửi kèm mã đặt phòng hợp lệ HOẶC mã khách sạn (báo cáo từ trang khách sạn), không gửi cả hai.");
        }

        PhieuDatPhong booking = null;
        Integer khachSanId = null;
        String khachSanTen = null;
        String bookingCode = null;

        if (hasBooking) {
            booking = phieuDatPhongRepository.findByMaDatPhong(req.bookingCode().trim())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Mã đặt phòng '" + req.bookingCode() + "' không tồn tại trong hệ thống."));
            bookingCode = booking.getMaDatPhong();
        } else {
            KhachSan ks = khachSanRepository.findById(req.khachSanId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách sạn."));
            khachSanId = ks.getId();
            khachSanTen = ks.getTen();
        }

        // 3. Xác thực moTa >= 20 từ
        String moTa = req.moTa() != null ? req.moTa().trim() : "";
        int wordCount = moTa.isEmpty() ? 0 : moTa.split("\\s+").length;
        if (wordCount < 20) {
            throw new IllegalArgumentException(
                    "Mô tả phải có ít nhất 20 từ. Hiện tại: " + wordCount + " từ.");
        }

        // 4. Gán priority
        String priority = determinePriority(req.loaiVanDe());

        // 5. Tạo báo cáo
        GuestReport report = GuestReport.builder()
                .id(idGenerator.generateReportId())
                .bookingCode(bookingCode)
                .khachSanId(khachSanId)
                .khachSanTen(khachSanTen)
                .hoTen(hoTen)
                .email(emailValid ? req.email() : null)
                .sdt(phoneValid ? req.sdt() : null)
                .loaiVanDe(req.loaiVanDe())
                .moTa(moTa)
                .priority(priority)
                .trangThai("PENDING")
                .daThongBaoAdmin("HIGH".equals(priority))
                .build();

        GuestReport saved = guestReportRepository.save(report);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .module("GUEST_REPORT")
                .entityId(saved.getId())
                .action("CREATE")
                .performedBy(req.email() != null ? req.email() : req.sdt())
                .role("GUEST")
                .description("Khách gửi báo cáo: " + req.loaiVanDe() + " | Priority: " + priority
                        + (khachSanTen != null ? " | KS: " + khachSanTen : ""))
                .build());

        if ("HIGH".equals(priority)) {
            log.warn("[GUEST_REPORT] HIGH PRIORITY báo cáo mới: {} - Booking: {} - KS: {} - Loại: {}",
                    saved.getId(), bookingCode, khachSanTen, req.loaiVanDe());
        }

        return saved;
    }

    /** Lấy tất cả báo cáo (Admin) */
    public List<GuestReport> getAllReports() {
        return guestReportRepository.findAll();
    }

    /** Lấy báo cáo theo trạng thái */
    public List<GuestReport> getReportsByStatus(String trangThai) {
        return guestReportRepository.findByTrangThaiOrderByCreatedAtDesc(trangThai);
    }

    /** Lấy báo cáo HIGH priority chưa thông báo Admin */
    public List<GuestReport> getHighPriorityUnnotified() {
        return guestReportRepository.findHighPriorityUnnotified();
    }

    /** Lấy báo cáo theo booking code */
    public List<GuestReport> getReportsByBooking(String bookingCode) {
        return guestReportRepository.findByBookingCodeOrderByCreatedAtDesc(bookingCode);
    }

    /** Lấy chi tiết báo cáo */
    public GuestReport getReportById(String id) {
        return guestReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo: " + id));
    }

    /**
     * Admin/Manager cập nhật trạng thái và phản hồi báo cáo.
     */
    @Transactional
    public GuestReport updateReport(String id, UpdateReportRequest req, String performedBy, String role) {
        GuestReport report = getReportById(id);
        String oldStatus = report.getTrangThai();

        if (req.trangThai() != null) {
            validateStatusTransition(oldStatus, req.trangThai());
            report.setTrangThai(req.trangThai());
        }
        if (req.phanHoi() != null) {
            report.setPhanHoi(req.phanHoi());
        }
        if (req.nguoiXuLy() != null) {
            report.setNguoiXuLy(req.nguoiXuLy());
        }

        GuestReport updated = guestReportRepository.save(report);

        auditLogRepository.save(AuditLog.builder()
                .module("GUEST_REPORT")
                .entityId(id)
                .action("UPDATE")
                .performedBy(performedBy)
                .role(role)
                .description("Cập nhật báo cáo: " + oldStatus + " -> " + req.trangThai())
                .build());

        return updated;
    }

    // === Private helpers ===

    private String determinePriority(String loaiVanDe) {
        if (loaiVanDe == null) return "LOW";
        if (HIGH_PRIORITY_TYPES.contains(loaiVanDe.toUpperCase())) return "HIGH";
        if (MEDIUM_PRIORITY_TYPES.contains(loaiVanDe.toUpperCase())) return "MEDIUM";
        return "LOW";
    }

    private void validateStatusTransition(String current, String next) {
        List<String> validFrom = switch (current) {
            case "PENDING" -> List.of("IN_PROGRESS", "CLOSED");
            case "IN_PROGRESS" -> List.of("RESOLVED", "CLOSED");
            case "RESOLVED" -> List.of("CLOSED");
            default -> List.of();
        };
        if (!validFrom.contains(next)) {
            throw new IllegalArgumentException(
                    "Không thể chuyển trạng thái từ '" + current + "' sang '" + next + "'");
        }
    }
}
