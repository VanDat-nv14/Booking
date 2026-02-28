package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.PhongDto;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.Phong;
import com.example.bookingkhachsan.service.PhongService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "Bearer Authentication")
public class PhongController {

    private final PhongService phongService;

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Phong>> getRoomsByHotel(@PathVariable Integer hotelId) {
        return ResponseEntity.ok(phongService.getRoomsByHotel(hotelId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<Phong> createRoom(
            @AuthenticationPrincipal NguoiDung nguoiDung,
            @jakarta.validation.Valid @RequestBody PhongDto dto) {
        return ResponseEntity.ok(phongService.createRoom(nguoiDung.getId(), dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<Phong> updateRoom(
            @PathVariable Integer id,
            @AuthenticationPrincipal NguoiDung nguoiDung,
            @jakarta.validation.Valid @RequestBody PhongDto dto) {
        return ResponseEntity.ok(phongService.updateRoom(nguoiDung.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_HotelManager')")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Integer id,
            @AuthenticationPrincipal NguoiDung nguoiDung) {
        phongService.deleteRoom(nguoiDung.getId(), id);
        return ResponseEntity.ok().build();
    }
}
