package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.DiscountFramework;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.DiscountFrameworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discount-framework")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiscountFrameworkController {

    private final DiscountFrameworkService frameworkService;

    /**
     * GET /api/discount-framework
     * Xem khung chính sách hiện tại (Admin + Manager).
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DiscountFramework> getFramework() {
        return ResponseEntity.ok(frameworkService.getFramework());
    }

    /**
     * PUT /api/discount-framework
     * Admin cập nhật trần/sàn giảm giá.
     */
    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<DiscountFramework> updateFramework(
            @RequestBody DiscountFrameworkService.UpdateFrameworkRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(frameworkService.updateFramework(request, currentUser.getEmail()));
    }
}
