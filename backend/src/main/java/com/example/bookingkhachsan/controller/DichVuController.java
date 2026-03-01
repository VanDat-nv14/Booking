package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.DichVuDto;
import com.example.bookingkhachsan.entity.DichVu;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.service.DichVuService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class DichVuController {

    private final DichVuService dichVuService;

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<DichVu>> getServicesByHotel(@PathVariable Integer hotelId) {
        return ResponseEntity.ok(dichVuService.getServicesByHotel(hotelId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<DichVu> createService(
            @AuthenticationPrincipal NguoiDung nguoiDung,
            @jakarta.validation.Valid @RequestBody DichVuDto dto) {
        return ResponseEntity.ok(dichVuService.createService(nguoiDung.getId(), dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<DichVu> updateService(
            @PathVariable Integer id,
            @AuthenticationPrincipal NguoiDung nguoiDung,
            @jakarta.validation.Valid @RequestBody DichVuDto dto) {
        return ResponseEntity.ok(dichVuService.updateService(nguoiDung.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<Void> deleteService(
            @PathVariable Integer id,
            @AuthenticationPrincipal NguoiDung nguoiDung) {
        dichVuService.deleteService(nguoiDung.getId(), id);
        return ResponseEntity.ok().build();
    }
}
