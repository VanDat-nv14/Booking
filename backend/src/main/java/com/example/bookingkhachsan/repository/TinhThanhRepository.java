package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.TinhThanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TinhThanhRepository extends JpaRepository<TinhThanh, Integer> {
}
