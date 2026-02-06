package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.QuocGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuocGiaRepository extends JpaRepository<QuocGia, Integer> {
    List<QuocGia> findByTrangThaiTrue();
}
