package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.ComboPackage;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.ComboPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Quản lý Gói Combo (Phòng + Dịch vụ nội khu).
 */
@RestController
@RequestMapping("/api/combo-packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComboPackageController {

    private final ComboPackageService comboPackageService;

    /**
     * POST /api/combo-packages
     * Hotel Manager tạo combo mới.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<ComboPackage> createCombo(
            @RequestBody ComboPackageService.CreateComboRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        ComboPackage created = comboPackageService.create(request, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(created);
    }

    /**
     * GET /api/combo-packages
     * Hotel Manager xem danh sách combo của mình.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<List<ComboPackage>> listForManager(
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        List<ComboPackage> combos = comboPackageService.listForManager(currentUser.getId());
        return ResponseEntity.ok(combos);
    }

    /**
     * PUT /api/combo-packages/{id}
     * Hotel Manager cập nhật combo.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<ComboPackage> updateCombo(
            @PathVariable String id,
            @RequestBody ComboPackageService.UpdateComboRequest request,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        ComboPackage updated = comboPackageService.update(id, request, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/combo-packages/{id}
     * Hotel Manager xóa combo.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<Void> deleteCombo(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung currentUser
    ) {
        comboPackageService.delete(id, currentUser.getId(), currentUser.getEmail());
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/combo-packages/hotel/{hotelId}
     * Public: Xem danh sách combo combo của khách sạn (dành cho khách).
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ComboPackage>> listActiveForHotel(
            @PathVariable Integer hotelId
    ) {
        List<ComboPackage> combos = comboPackageService.listActiveForHotel(hotelId);
        return ResponseEntity.ok(combos);
    }

    /**
     * GET /api/combo-packages/{id}
     * Public: Xem chi tiết combo.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ComboPackage> getComboDetail(
            @PathVariable String id
    ) {
        ComboPackage combo = comboPackageService.getById(id);
        return ResponseEntity.ok(combo);
    }
}
