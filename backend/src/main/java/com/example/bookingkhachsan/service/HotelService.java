package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelService {
    
    private final KhachSanRepository khachSanRepository;

    public List<KhachSan> search(Integer viTriId, Integer soSao, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice, java.time.LocalDate checkIn, java.time.LocalDate checkOut) {
        if (checkIn == null) checkIn = java.time.LocalDate.now();
        if (checkOut == null) checkOut = checkIn.plusDays(1);
        
        return khachSanRepository.findAvailableHotels(viTriId, soSao, minPrice, maxPrice, checkIn, checkOut);
    }

    public KhachSan getDetails(Integer id) {
        return khachSanRepository.findById(id).orElseThrow(() -> new RuntimeException("Hotel not found"));
    }
}
