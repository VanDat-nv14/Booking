package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.LoyaltyTier;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.LoyaltyTierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty-tiers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoyaltyTierController {

    private final LoyaltyTierService loyaltyTierService;

    /** GET /api/loyalty-tiers — Public: danh sách hạng (để hiển thị trên UI) */
    @GetMapping
    public ResponseEntity<List<LoyaltyTier>> getAll(
            @RequestParam(defaultValue = "false") boolean activeOnly
    ) {
        return ResponseEntity.ok(activeOnly ? loyaltyTierService.getActiveAll() : loyaltyTierService.getAll());
    }

    /** POST /api/loyalty-tiers — Admin tạo hạng mới */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<LoyaltyTier> create(
            @RequestBody LoyaltyTierService.CreateTierRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(loyaltyTierService.create(request, currentUser.getEmail()));
    }

    /** PUT /api/loyalty-tiers/{id} — Admin sửa hạng */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<LoyaltyTier> update(
            @PathVariable Integer id,
            @RequestBody LoyaltyTierService.UpdateTierRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        return ResponseEntity.ok(loyaltyTierService.update(id, request, currentUser.getEmail()));
    }

    /** DELETE /api/loyalty-tiers/{id} — Admin xóa hạng */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        loyaltyTierService.delete(id, currentUser.getEmail());
        return ResponseEntity.noContent().build();
    }
}
