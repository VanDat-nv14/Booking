package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.Phong;
import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhongRepository extends JpaRepository<Phong, Integer> {
    List<Phong> findByKhachSanId(Integer khachSanId);
}
