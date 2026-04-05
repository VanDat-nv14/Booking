package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.LoyaltyMembership;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.UserMembership;
import com.example.bookingkhachsan.service.LoyaltyMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Quản lý Loyalty Membership (Gói thành viên trả phí).
 */
@RestController
@RequestMapping("/api/loyalty-memberships")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoyaltyMembershipController {

    private final LoyaltyMembershipService membershipService;

    /**
     * GET /api/loyalty-memberships
     * Public: Xem danh sách gói thành viên (dành cho khách).
     */
    @GetMapping
    public ResponseEntity<List<LoyaltyMembership>> listActivePackages() {
        List<LoyaltyMembership> packages = membershipService.getActivePackages();
        return ResponseEntity.ok(packages);
    }

    /**
     * POST /api/loyalty-memberships
     * Admin tạo gói thành viên mới.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<LoyaltyMembership> createPackage(
            @RequestBody LoyaltyMembershipService.CreateMembershipRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        LoyaltyMembership created = membershipService.createPackage(request, currentUser.getEmail());
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/loyalty-memberships/{id}
     * Admin cập nhật gói thành viên.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<LoyaltyMembership> updatePackage(
            @PathVariable String id,
            @RequestBody LoyaltyMembershipService.UpdateMembershipRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        LoyaltyMembership updated = membershipService.updatePackage(id, request, currentUser.getEmail());
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/loyalty-memberships/{id}/purchase
     * User mua gói thành viên.
     */
    @PostMapping("/{id}/purchase")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserMembership> purchaseMembership(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        UserMembership purchased = membershipService.purchaseMembership(id, currentUser.getId());
        return ResponseEntity.ok(purchased);
    }

    /**
     * GET /api/loyalty-memberships/my
     * User xem gói đang dùng và lịch sử mua hàng.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserMembership>> getMyMemberships(
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        List<UserMembership> memberships = membershipService.getUserMemberships(currentUser.getId());
        return ResponseEntity.ok(memberships);
    }
}
