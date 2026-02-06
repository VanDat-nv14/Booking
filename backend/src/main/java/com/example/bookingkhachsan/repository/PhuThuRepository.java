package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.PhuThu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhuThuRepository extends JpaRepository<PhuThu, Integer> {
}
