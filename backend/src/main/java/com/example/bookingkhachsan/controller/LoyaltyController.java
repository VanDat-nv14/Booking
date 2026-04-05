package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.UserLoyalty;
import com.example.bookingkhachsan.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    /**
     * GET /api/loyalty/me
     * User xem điểm tích lũy và hạng thành viên của bản thân.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserLoyalty> getMyLoyalty(@AuthenticationPrincipal NguoiDung currentUser) {
        return ResponseEntity.ok(loyaltyService.getOrCreate(currentUser.getId()));
    }
}
