package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.ReviewDto;
import com.example.bookingkhachsan.entity.DanhGia;
import com.example.bookingkhachsan.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewService service;

    @PostMapping("/reviews")
    public ResponseEntity<Void> createReview(@RequestBody ReviewDto request) {
        service.createReview(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/hotels/{id}/reviews")
    public ResponseEntity<List<DanhGia>> getReviews(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getReviews(id));
    }
}
