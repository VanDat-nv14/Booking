package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.PhongKhaDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PhongKhaDungRepository extends JpaRepository<PhongKhaDung, Integer> {

    /**
     * Kiem tra xem phong co bi trung ngay khong (de tranh overbooking).
     * Tra ve so ngay bi trung voi cac booking Confirmed/TamGiu.
     */
    @Query("""
        SELECT COUNT(pkd) FROM PhongKhaDung pkd
        WHERE pkd.phong.id = :phongId
          AND pkd.ngay >= :checkIn
          AND pkd.ngay < :checkOut
          AND pkd.trangThai IN ('TamGiu', 'DaDat', 'BaoTri')
          AND (:excludeBookingId IS NULL OR pkd.phieuDatPhong.id <> :excludeBookingId)
        """)
    long countUnavailableDays(
            @Param("phongId") Integer phongId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("excludeBookingId") Integer excludeBookingId
    );

    /**
     * Lay danh sach phong trong theo khach san va khoang ngay.
     * Tra ve phong_id cua cac phong KHONG co bat ky ngay nao bi block.
     */
    @Query(value = """
        SELECT DISTINCT p.id
        FROM phong p
        WHERE p.khach_san_id = :khachSanId
          AND p.trang_thai != 'BaoTri'
          AND NOT EXISTS (
              SELECT 1 FROM phong_kha_dung pkd
              WHERE pkd.phong_id = p.id
                AND pkd.ngay >= :checkIn
                AND pkd.ngay < :checkOut
                AND pkd.trang_thai IN ('TamGiu', 'DaDat', 'BaoTri')
          )
        """, nativeQuery = true)
    List<Integer> findAvailablePhongIds(
            @Param("khachSanId") Integer khachSanId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("SELECT pkd FROM PhongKhaDung pkd WHERE pkd.phieuDatPhong.id = :bookingId")
    List<PhongKhaDung> findByPhieuDatPhongId(@Param("bookingId") Integer bookingId);

    @Modifying
    @Query("""
        UPDATE PhongKhaDung pkd SET pkd.trangThai = :trangThai
        WHERE pkd.phieuDatPhong.id = :bookingId
        """)
    void updateTrangThaiByBookingId(@Param("bookingId") Integer bookingId,
                                    @Param("trangThai") String trangThai);

    @Modifying
    @Query("""
        UPDATE PhongKhaDung pkd SET pkd.trangThai = 'Trong', pkd.phieuDatPhong = null
        WHERE pkd.phieuDatPhong.id = :bookingId
        """)
    void releaseRoomByBookingId(@Param("bookingId") Integer bookingId);
}
