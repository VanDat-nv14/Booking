package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.CouponApplicationService;
import com.example.bookingkhachsan.service.CouponPublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponApplicationService couponApplicationService;
    private final CouponPublicService couponPublicService;

    /**
     * Mã nền tảng + mã khuyến mãi đang hiệu lực của một khách sạn (hiển thị trang chi tiết KS).
     */
    @GetMapping("/public/hotel/{hotelId}")
    public ResponseEntity<Map<String, Object>> publicForHotel(@PathVariable Integer hotelId) {
        return ResponseEntity.ok(couponPublicService.summaryForHotel(hotelId));
    }

    /**
     * Gợi ý ngắn cho chuông thông báo (mã toàn hệ thống + mã theo KS gần đây).
     */
    @GetMapping("/public/bell-teasers")
    public ResponseEntity<Map<String, Object>> bellTeasers() {
        return ResponseEntity.ok(couponPublicService.bellTeasers());
    }

    /**
     * Xem trước mã (Discount nền tảng hoặc PromotionCode KS) — không khóa.
     * Cho phép gọi khi chưa đăng nhập (không kiểm tra giới hạn theo user); khi đã đăng nhập thì áp dụng max/user.
     */
    @PostMapping("/preview")
    public ResponseEntity<Map<String, Object>> preview(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        Integer userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof NguoiDung u) {
            userId = u.getId();
        }
        String code = (String) body.get("code");
        BigDecimal orderAmount = new BigDecimal(body.get("orderAmount").toString());
        Integer hotelId = parseInt(body.get("hotelId"));
        Integer loaiPhongId = parseInt(body.get("loaiPhongId"));
        long nights = body.get("nights") != null ? Long.parseLong(body.get("nights").toString()) : 1L;

        CouponApplicationService.SimplePreview r = couponApplicationService.previewCode(
                code, orderAmount, hotelId, loaiPhongId, nights, userId);

        return ResponseEntity.ok(Map.of(
                "valid", r.valid(),
                "message", r.message(),
                "discountAmount", r.discountAmount(),
                "kind", r.kind() != null ? r.kind() : ""
        ));
    }

    private static Integer parseInt(Object o) {
        if (o == null) {
            return null;
        }
        return Integer.parseInt(o.toString());
    }
}
