package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.ViTri;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViTriRepository extends JpaRepository<ViTri, Integer> {
    List<ViTri> findByTinhThanh_Id(Integer tinhThanhId);
    Optional<ViTri> findByTenAndTinhThanh_Id(String ten, Integer tinhThanhId);
}
