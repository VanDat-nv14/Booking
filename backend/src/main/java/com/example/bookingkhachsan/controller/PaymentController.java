package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.config.VnPayConfig;
import com.example.bookingkhachsan.dto.BookingDto;
import com.example.bookingkhachsan.entity.PhieuDatPhong;
import com.example.bookingkhachsan.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final BookingService bookingService;
    private final VnPayConfig vnPayConfig;

    /**
     * Tạo link thanh toán VNPAY cho một booking Pending/Confirmed chưa thanh toán.
     */
    @PostMapping("/vnpay/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingDto.VnPayCreatePaymentResponse> createVnPayPayment(
            @RequestParam("bookingId") Integer bookingId,
            HttpServletRequest request
    ) {
        PhieuDatPhong booking = bookingService.getBookingById(bookingId);

        if (booking == null) {
            return ResponseEntity.badRequest().build();
        }
        if ("DaThanhToan".equalsIgnoreCase(booking.getTrangThaiThanhToan())) {
            return ResponseEntity.badRequest().body(null);
        }

        BigDecimal amount = booking.getThanhTien();
        if (amount == null) {
            // Fallback: giaPhongGoc * soNgay
            BigDecimal gia = booking.getGiaPhongGoc() != null ? booking.getGiaPhongGoc() : BigDecimal.ZERO;
            LocalDate den = booking.getNgayDen();
            LocalDate di = booking.getNgayDi();
            long soNgay = (den != null && di != null) ? ChronoUnit.DAYS.between(den, di) : 1;
            if (soNgay < 1) soNgay = 1;
            amount = gia.multiply(BigDecimal.valueOf(soNgay));
        }
        BigDecimal rounded = amount.setScale(0, RoundingMode.HALF_UP);

        String clientIp = request.getRemoteAddr();
        String orderInfo = "Thanh toan don dat phong " + booking.getMaDatPhong();
        String paymentUrl = vnPayConfig.buildPaymentUrl(
                booking.getMaDatPhong(),
                rounded.longValue(),
                orderInfo,
                clientIp
        );

        BookingDto.VnPayCreatePaymentResponse res = BookingDto.VnPayCreatePaymentResponse.builder()
                .bookingId(booking.getId())
                .amount(rounded)
                .paymentUrl(paymentUrl)
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .build();

        return ResponseEntity.ok(res);
    }

    /**
     * Endpoint cho VNPAY gọi lại sau khi thanh toán (returnUrl).
     * Không yêu cầu authentication.
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> handleVnPayReturn(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Enumeration<String> names = request.getParameterNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            params.put(name, request.getParameter(name));
        }

        log.info("VNPAY return params: {}", params);

        String redirectBase = "http://localhost:5173/user/bookings";
        String redirectUrl = redirectBase + "?paymentResult=fail";

        try {
            if (!vnPayConfig.validateSignature(params)) {
                log.warn("VNPAY signature invalid");
                return ResponseEntity.status(302).header("Location", redirectUrl).build();
            }

            String rsp = params.getOrDefault("vnp_ResponseCode", "");
            String txnRef = params.get("vnp_TxnRef"); // maDatPhong
            String transNo = params.get("vnp_TransactionNo");
            String amountStr = params.get("vnp_Amount");

            if (!"00".equals(rsp) || txnRef == null) {
                log.warn("VNPAY response code not success: {}", rsp);
                return ResponseEntity.status(302).header("Location", redirectUrl).build();
            }

            BigDecimal amount = BigDecimal.ZERO;
            if (amountStr != null && !amountStr.isBlank()) {
                try {
                    long vndTimes100 = Long.parseLong(amountStr);
                    amount = BigDecimal.valueOf(vndTimes100 / 100L);
                } catch (NumberFormatException e) {
                    log.warn("Unable to parse vnp_Amount: {}", amountStr);
                }
            }

            PhieuDatPhong booking = bookingService.getBookingByCode(txnRef);
            bookingService.updatePaymentStatusFromGateway(
                    booking.getId(),
                    amount,
                    "VNPAY",
                    transNo != null ? transNo : "VNPAY"
            );

            redirectUrl = redirectBase + "?paymentResult=success";
        } catch (Exception e) {
            log.error("Error processing VNPAY return: {}", e.getMessage(), e);
        }

        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }
}

