package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.QuocGia;
import com.example.bookingkhachsan.repository.QuocGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {
    
    @Autowired
    private QuocGiaRepository quocGiaRepository;

    public List<QuocGia> getTree() {
        return quocGiaRepository.findTreeWithLocations();
    }
}
