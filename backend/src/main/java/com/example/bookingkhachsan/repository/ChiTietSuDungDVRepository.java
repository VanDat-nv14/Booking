package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.ChiTietSuDungDV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietSuDungDVRepository extends JpaRepository<ChiTietSuDungDV, Integer> {
}
