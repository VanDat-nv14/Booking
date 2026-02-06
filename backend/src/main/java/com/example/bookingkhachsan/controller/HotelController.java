package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService service;

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

    @GetMapping("/{id}/details")
    public ResponseEntity<KhachSan> getDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getDetails(id));
    }
}
