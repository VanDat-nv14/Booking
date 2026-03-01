package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.DichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DichVuRepository extends JpaRepository<DichVu, Integer> {
    List<DichVu> findByKhachSanId(Integer khachSanId);
}

