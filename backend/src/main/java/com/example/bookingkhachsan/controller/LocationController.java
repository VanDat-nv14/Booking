package com.example.bookingkhachsan.controller;

import com.example.bookingkhachsan.entity.QuocGia;
import com.example.bookingkhachsan.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*") // Allow all for dev
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/tree")
    public ResponseEntity<List<QuocGia>> getTree() {
        return ResponseEntity.ok(locationService.getTree());
    }
}
