package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.BookingDto;
import com.example.bookingkhachsan.entity.PhieuDatPhong;
import com.example.bookingkhachsan.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {
    
    private final BookingService bookingService;

    @PostMapping("/bookings/create")
    public ResponseEntity<PhieuDatPhong> createBooking(@RequestBody BookingDto.CreateBookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/bookings/{code}")
    public ResponseEntity<PhieuDatPhong> getBooking(@PathVariable String code) {
        return ResponseEntity.ok(bookingService.getBooking(code));
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<PhieuDatPhong>> getBookingsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    @PutMapping("/bookings/{id}/checkin")
    public ResponseEntity<Void> checkin(@PathVariable Integer id) {
        bookingService.checkin(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bookings/{id}/checkout")
    public ResponseEntity<Void> checkout(@PathVariable Integer id) {
        bookingService.checkout(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/services/add-to-booking")
    public ResponseEntity<Void> addService(@RequestBody BookingDto.AddServiceRequest request) {
        bookingService.addService(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/surcharges/add")
    public ResponseEntity<Void> addSurcharge(@RequestBody BookingDto.AddSurchargeRequest request) {
        bookingService.addSurcharge(request);
        return ResponseEntity.ok().build();
    }
}
