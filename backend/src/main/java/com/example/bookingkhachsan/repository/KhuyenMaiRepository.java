package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, String> {
    java.util.List<KhuyenMai> findByKhachSan_Id(Integer khachSanId);
}
