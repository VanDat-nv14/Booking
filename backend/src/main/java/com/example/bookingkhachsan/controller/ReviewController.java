package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.dto.ReviewDto;
import com.example.bookingkhachsan.dto.UserReviewResponse;
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
    public ResponseEntity<Void> createReview(@jakarta.validation.Valid @RequestBody ReviewDto request) {
        service.createReview(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/hotels/{id}/reviews")
    public ResponseEntity<List<DanhGia>> getReviews(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getReviews(id));
    }

    @GetMapping("/reviews/manager/hotel/{id}")
    public ResponseEntity<List<DanhGia>> getReviewsForManager(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getReviewsForManager(id));
    }

    @GetMapping("/reviews/user/{id}")
    public ResponseEntity<List<UserReviewResponse>> getReviewsByUser(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getReviewsByUser(id));
    }

    @PutMapping("/reviews/{id}/reply")
    public ResponseEntity<Void> addReply(
            @PathVariable Integer id,
            @RequestBody java.util.Map<String, String> request) {
        service.addReply(id, request.get("phanHoi"));
        return ResponseEntity.ok().build();
    }
}
