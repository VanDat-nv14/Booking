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
        // Because of JPA mappings, fetching QuocGia will lazily fetch inner lists when accessed or serialized if not cautious.
        // However, we need to be careful with LazyInitializationException if outside transaction.
        // But Controller will serialize it. 
        // Best to use DTOs or OpenEntityManagerInView (default true in Boot). 
        // Let's rely on default fetch for now.
        return quocGiaRepository.findByTrangThaiTrue();
    }
}
