package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    List<DanhGia> findByKhachSanIdAndTrangThai(Integer khachSanId, String trangThai);
    boolean existsByPhieuDatPhongId(Integer phieuDatPhongId);
}
