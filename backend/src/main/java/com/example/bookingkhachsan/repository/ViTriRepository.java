package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.ViTri;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViTriRepository extends JpaRepository<ViTri, Integer> {
}
