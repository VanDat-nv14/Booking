package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.HotelDetailDto;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.HotelService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class HotelController {

    private final HotelService service;

    @GetMapping
    public ResponseEntity<List<KhachSan>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/my-hotel")
    public ResponseEntity<KhachSan> getMyHotel(@AuthenticationPrincipal NguoiDung nguoiDung) {
        if (nguoiDung == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(service.getMyHotel(nguoiDung.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<KhachSan>> search(
            @RequestParam(name = "viTriId", required = false) Integer viTriId,
            @RequestParam(name = "soSao", required = false) Integer soSao,
            @RequestParam(name = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) java.math.BigDecimal maxPrice,
            @RequestParam(name = "checkIn", required = false) java.time.LocalDate checkIn,
            @RequestParam(name = "checkOut", required = false) java.time.LocalDate checkOut
    ) {
        return ResponseEntity.ok(service.search(viTriId, soSao, minPrice, maxPrice, checkIn, checkOut));
    }

    @GetMapping("/map")
    public ResponseEntity<List<com.example.bookingkhachsan.dto.HotelMapDto>> getMapData() {
        return ResponseEntity.ok(service.getMapData());
    }

    /** Trang chi tiết khách sạn — trả về HotelDetailDto với dịch vụ và đánh giá */
    @GetMapping("/{id}/details")
    public ResponseEntity<HotelDetailDto> getDetails(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.getHotelDetail(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> createHotel(@jakarta.validation.Valid @RequestBody com.example.bookingkhachsan.dto.HotelDto dto) {
        try {
            return ResponseEntity.ok(service.createHotel(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateHotel(@PathVariable Integer id, @jakarta.validation.Valid @RequestBody com.example.bookingkhachsan.dto.HotelDto dto) {
        try {
            return ResponseEntity.ok(service.updateHotel(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Integer id) {
        service.deleteHotel(id);
        return ResponseEntity.ok().build();
    }
}
