package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.GuestReport;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.GuestReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guest-reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GuestReportController {

    private final GuestReportService guestReportService;

    /**
     * POST /api/guest-reports
     * Khách gửi báo cáo sự cố. Yêu cầu đã đăng nhập.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GuestReport> createReport(
            @RequestBody GuestReportService.CreateReportRequest request
    ) {
        return ResponseEntity.ok(guestReportService.createReport(request));
    }

    /**
     * GET /api/guest-reports
     * Admin lấy tất cả báo cáo.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<List<GuestReport>> getAllReports(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String priority
    ) {
        if (trangThai != null) {
            return ResponseEntity.ok(guestReportService.getReportsByStatus(trangThai));
        }
        if (priority != null && priority.equalsIgnoreCase("HIGH")) {
            return ResponseEntity.ok(guestReportService.getHighPriorityUnnotified());
        }
        return ResponseEntity.ok(guestReportService.getAllReports());
    }

    /**
     * GET /api/guest-reports/{id}
     * Admin/Manager xem chi tiết báo cáo.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<GuestReport> getReport(@PathVariable String id) {
        return ResponseEntity.ok(guestReportService.getReportById(id));
    }

    /**
     * GET /api/guest-reports/booking/{bookingCode}
     * Xem báo cáo theo mã đặt phòng.
     */
    @GetMapping("/booking/{bookingCode}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<List<GuestReport>> getReportsByBooking(@PathVariable String bookingCode) {
        return ResponseEntity.ok(guestReportService.getReportsByBooking(bookingCode));
    }

    /**
     * GET /api/guest-reports/high-priority
     * Admin lấy danh sách báo cáo HIGH priority chưa xử lý.
     */
    @GetMapping("/high-priority")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<List<GuestReport>> getHighPriorityUnnotified() {
        return ResponseEntity.ok(guestReportService.getHighPriorityUnnotified());
    }

    /**
     * PUT /api/guest-reports/{id}
     * Admin/Manager cập nhật trạng thái và phản hồi báo cáo.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<GuestReport> updateReport(
            @PathVariable String id,
            @RequestBody GuestReportService.UpdateReportRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        String role = currentUser.getChucVu();
        String email = currentUser.getEmail();
        return ResponseEntity.ok(guestReportService.updateReport(id, request, email, role));
    }

    /**
     * GET /api/guest-reports/stats
     * Admin xem thống kê báo cáo.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<GuestReport> all = guestReportService.getAllReports();
        long pending = all.stream().filter(r -> "PENDING".equals(r.getTrangThai())).count();
        long inProgress = all.stream().filter(r -> "IN_PROGRESS".equals(r.getTrangThai())).count();
        long resolved = all.stream().filter(r -> "RESOLVED".equals(r.getTrangThai())).count();
        long high = all.stream().filter(r -> "HIGH".equals(r.getPriority())).count();

        return ResponseEntity.ok(Map.of(
                "total", all.size(),
                "pending", pending,
                "inProgress", inProgress,
                "resolved", resolved,
                "highPriority", high
        ));
    }
}
