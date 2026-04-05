package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.PromotionCode;
import com.example.bookingkhachsan.service.PromotionCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotion-codes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromotionCodeController {

    private final PromotionCodeService promotionCodeService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<PromotionCode> create(
            @RequestBody PromotionCodeService.CreatePromotionCodeRequest request,
            @AuthenticationPrincipal NguoiDung user
    ) {
        return ResponseEntity.ok(promotionCodeService.create(request, user.getId(), user.getEmail()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<List<PromotionCode>> list(@AuthenticationPrincipal NguoiDung user) {
        return ResponseEntity.ok(promotionCodeService.listForManager(user.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<PromotionCode> getOne(
            @PathVariable String id,
            @AuthenticationPrincipal NguoiDung user
    ) {
        return ResponseEntity.ok(promotionCodeService.getByIdForManager(id, user.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<PromotionCode> update(
            @PathVariable String id,
            @RequestBody PromotionCodeService.UpdatePromotionCodeRequest request,
            @AuthenticationPrincipal NguoiDung user
    ) {
        return ResponseEntity.ok(promotionCodeService.update(id, request, user.getId(), user.getEmail()));
    }
}
