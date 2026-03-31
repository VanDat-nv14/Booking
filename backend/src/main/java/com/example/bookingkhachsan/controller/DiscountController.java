package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.Discount;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiscountController {

    private final DiscountService discountService;

    /**
     * POST /api/discounts
     * Admin tạo mã giảm giá mới.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Discount> createDiscount(
            @RequestBody DiscountService.CreateDiscountRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(discountService.createDiscount(request, currentUser.getEmail()));
    }

    /**
     * GET /api/discounts
     * Admin lấy tất cả mã giảm giá (filter by status).
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<List<Discount>> getAllDiscounts(
            @RequestParam(required = false) String trangThai
    ) {
        if (trangThai != null) {
            return ResponseEntity.ok(discountService.getByStatus(trangThai));
        }
        return ResponseEntity.ok(discountService.getAll());
    }

    /**
     * GET /api/discounts/{id}
     * Admin xem chi tiết mã giảm giá.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Discount> getDiscount(@PathVariable String id) {
        return ResponseEntity.ok(discountService.getById(id));
    }

    /**
     * GET /api/discounts/active
     * Lấy danh sách mã giảm giá đang hoạt động.
     * Có thể lọc theo khách sạn: ?hotelId=1
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Discount>> getActiveDiscounts(
            @RequestParam(required = false) Integer hotelId
    ) {
        return ResponseEntity.ok(discountService.getActiveDiscounts(hotelId));
    }

    /**
     * POST /api/discounts/validate
     * Xác thực mã giảm giá và tính toán số tiền giảm.
     * Body: { "code": "SALE10", "orderAmount": 5000000, "hotelId": 1 }
     */
    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> validateDiscount(
            @RequestBody Map<String, Object> body
    ) {
        String code = (String) body.get("code");
        BigDecimal orderAmount = new BigDecimal(body.get("orderAmount").toString());
        Integer hotelId = body.containsKey("hotelId") && body.get("hotelId") != null
                ? Integer.parseInt(body.get("hotelId").toString()) : null;

        DiscountService.ValidateDiscountResult result =
                discountService.validateAndCalculate(code, orderAmount, hotelId);

        return ResponseEntity.ok(Map.of(
                "valid", result.valid(),
                "message", result.message(),
                "discountAmount", result.discountAmount(),
                "discountId", result.discount() != null ? result.discount().getId() : ""
        ));
    }

    /**
     * PUT /api/discounts/{id}
     * Admin cập nhật mã giảm giá.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Discount> updateDiscount(
            @PathVariable String id,
            @RequestBody DiscountService.UpdateDiscountRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(discountService.updateDiscount(id, request, currentUser.getEmail()));
    }

    /**
     * GET /api/discounts/stats
     * Admin xem thống kê mã giảm giá.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Discount> all = discountService.getAll();
        long active = all.stream().filter(d -> "ACTIVE".equals(d.getTrangThai())).count();
        long inactive = all.stream().filter(d -> "INACTIVE".equals(d.getTrangThai())).count();
        long expired = all.stream().filter(d -> "EXPIRED".equals(d.getTrangThai())).count();
        long totalUsed = all.stream().mapToLong(d -> d.getSoLanDaDung() != null ? d.getSoLanDaDung() : 0).sum();

        return ResponseEntity.ok(Map.of(
                "total", all.size(),
                "active", active,
                "inactive", inactive,
                "expired", expired,
                "totalUsed", totalUsed
        ));
    }
}
