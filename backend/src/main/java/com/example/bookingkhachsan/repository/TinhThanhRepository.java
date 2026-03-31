package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.TinhThanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinhThanhRepository extends JpaRepository<TinhThanh, Integer> {
    List<TinhThanh> findByQuocGia_Id(Integer quocGiaId);
    java.util.Optional<TinhThanh> findByTenAndQuocGia_Id(String ten, Integer quocGiaId);
}
