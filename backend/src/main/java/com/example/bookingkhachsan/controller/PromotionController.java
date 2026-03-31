package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.Promotion;
import com.example.bookingkhachsan.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    /**
     * POST /api/promotions
     * Manager tạo nháp khuyến mãi.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_HotelManager', 'ROLE_Admin')")
    public ResponseEntity<Promotion> createDraft(
            @RequestBody PromotionService.CreatePromotionRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(promotionService.createDraft(request, currentUser.getEmail()));
    }

    /**
     * GET /api/promotions
     * Admin lấy tất cả khuyến mãi; Manager chỉ thấy của mình.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<List<Promotion>> getAllPromotions(
            @RequestParam(required = false) String trangThai,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        String cv = currentUser.getChucVu();
        boolean isAdmin = "Admin".equals(cv) || "ADMIN".equals(cv);
        if (isAdmin) {
            if (trangThai != null) {
                return ResponseEntity.ok(promotionService.getAll().stream()
                        .filter(p -> trangThai.equals(p.getTrangThai()))
                        .toList());
            }
            return ResponseEntity.ok(promotionService.getAll());
        } else {
            // Manager chỉ xem của mình
            return ResponseEntity.ok(promotionService.getByCreator(currentUser.getEmail()));
        }
    }

    /**
     * GET /api/promotions/pending-approvals
     * Admin xem danh sách KM đang chờ phê duyệt.
     */
    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<List<Promotion>> getPendingApprovals() {
        return ResponseEntity.ok(promotionService.getPendingApprovals());
    }

    /**
     * GET /api/promotions/active
     * Lấy danh sách KM đang hoạt động, có thể filter theo hotel.
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Promotion>> getActivePromotions(
            @RequestParam(required = false) Integer hotelId
    ) {
        return ResponseEntity.ok(promotionService.getActivePromotions(hotelId));
    }

    /**
     * GET /api/promotions/{id}
     * Xem chi tiết một khuyến mãi.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<Promotion> getPromotion(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.getById(id));
    }

    /**
     * PUT /api/promotions/{id}
     * Manager cập nhật nháp KM (chỉ khi DRAFT hoặc REJECTED).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_HotelManager', 'ROLE_Admin')")
    public ResponseEntity<Promotion> updateDraft(
            @PathVariable String id,
            @RequestBody PromotionService.UpdatePromotionRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                promotionService.updateDraft(id, request, currentUser.getEmail()));
    }

    /**
     * PUT /api/promotions/{id}/submit
     * Manager gửi KM để phê duyệt.
     */
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('ROLE_HotelManager', 'ROLE_Admin')")
    public ResponseEntity<Promotion> submitForApproval(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                promotionService.submitForApproval(id, currentUser.getEmail()));
    }

    /**
     * PUT /api/promotions/{id}/review
     * Admin phê duyệt hoặc từ chối KM.
     * Body: { "approved": true/false, "lyDoTuChoi": "..." }
     */
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Promotion> reviewPromotion(
            @PathVariable String id,
            @RequestBody PromotionService.ReviewPromotionRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(
                promotionService.reviewPromotion(id, request, currentUser.getEmail()));
    }

    /**
     * PUT /api/promotions/{id}/cancel
     * Hủy khuyến mãi. Manager hủy DRAFT/PENDING, Admin hủy bất kỳ.
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<Promotion> cancelPromotion(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        String role = currentUser.getChucVu();
        return ResponseEntity.ok(
                promotionService.cancelPromotion(id, currentUser.getEmail(), role));
    }

    /**
     * DELETE /api/promotions/{id}
     * Manager xóa nháp/từ chối của mình; Admin xóa nháp/từ chối/đã hủy.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_HotelManager')")
    public ResponseEntity<Void> deletePromotion(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        promotionService.deletePromotion(id, currentUser.getEmail(), currentUser.getChucVu());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/promotions/stats
     * Admin xem thống kê khuyến mãi.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Promotion> all = promotionService.getAll();
        long draft = all.stream().filter(p -> "DRAFT".equals(p.getTrangThai())).count();
        long pending = all.stream().filter(p -> "PENDING_APPROVAL".equals(p.getTrangThai())).count();
        long active = all.stream().filter(p -> "ACTIVE".equals(p.getTrangThai())).count();
        long approved = all.stream().filter(p -> "APPROVED".equals(p.getTrangThai())).count();
        long rejected = all.stream().filter(p -> "REJECTED".equals(p.getTrangThai())).count();

        return ResponseEntity.ok(Map.of(
                "total", all.size(),
                "draft", draft,
                "pendingApproval", pending,
                "active", active,
                "approved", approved,
                "rejected", rejected
        ));
    }
}
