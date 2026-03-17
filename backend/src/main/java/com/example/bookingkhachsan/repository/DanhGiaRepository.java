package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    List<DanhGia> findByKhachSanIdAndTrangThai(Integer khachSanId, String trangThai);
    boolean existsByPhieuDatPhongId(Integer phieuDatPhongId);

    /** Batch check which booking ids have a review (avoid N+1 in getBookingsByUser). */
    @Query("SELECT DISTINCT d.phieuDatPhong.id FROM DanhGia d WHERE d.phieuDatPhong.id IN :ids")
    Set<Integer> findPhieuDatPhongIdsWithReview(@Param("ids") List<Integer> ids);
}
