package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Integer> {
    List<DanhGia> findByKhachSanId(Integer khachSanId);

    @EntityGraph(attributePaths = {"nguoiDung", "phieuDatPhong"})
    List<DanhGia> findByKhachSanIdAndTrangThai(Integer khachSanId, String trangThai);

    @EntityGraph(attributePaths = {"nguoiDung", "phieuDatPhong"})
    List<DanhGia> findByKhachSanIdOrderByNgayDanhGiaDesc(Integer khachSanId);

    boolean existsByPhieuDatPhongId(Integer phieuDatPhongId);

    /** Batch check which booking ids have a review (avoid N+1 in getBookingsByUser). */
    @Query("SELECT DISTINCT d.phieuDatPhong.id FROM DanhGia d WHERE d.phieuDatPhong.id IN :ids")
    Set<Integer> findPhieuDatPhongIdsWithReview(@Param("ids") List<Integer> ids);

    /**
     * Lịch sử đánh giá của user — derived query + EntityGraph (tránh JPQL JOIN FETCH + ORDER BY gây lỗi trên một số DB).
     */
    @EntityGraph(attributePaths = {"khachSan", "phieuDatPhong"})
    List<DanhGia> findByNguoiDung_IdOrderByNgayDanhGiaDesc(Integer nguoiDungId);

    /** Số sao theo phiếu đặt (cho card lịch sử) */
    @Query("SELECT d.phieuDatPhong.id, d.soSaoTong FROM DanhGia d WHERE d.phieuDatPhong.id IN :ids")
    List<Object[]> findStarsByPhieuDatPhongIds(@Param("ids") List<Integer> ids);

    long countByNguoiDungId(Integer nguoiDungId);
}
