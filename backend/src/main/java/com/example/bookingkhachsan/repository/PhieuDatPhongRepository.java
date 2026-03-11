package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.PhieuDatPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuDatPhongRepository extends JpaRepository<PhieuDatPhong, Integer> {

    Optional<PhieuDatPhong> findByMaDatPhong(String maDatPhong);

    List<PhieuDatPhong> findByNguoiDungId(Integer nguoiDungId);

    List<PhieuDatPhong> findByPhong_KhachSan_IdOrderByNgayDatDesc(Integer khachSanId);

    List<PhieuDatPhong> findByTrangThaiOrderByNgayDatDesc(String trangThai);

    List<PhieuDatPhong> findAllByOrderByNgayDatDesc();

    /**
     * Dem so booking trung ngay (dung cho fallback check, chinh la phong_kha_dung)
     */
    @Query("""
        SELECT COUNT(pdp) FROM PhieuDatPhong pdp
        WHERE pdp.phong.id = :phongId
          AND pdp.trangThai NOT IN ('Cancelled', 'Expired', 'Rejected', 'NoShow')
          AND (pdp.ngayDen < :checkOut AND pdp.ngayDi > :checkIn)
        """)
    long countOverlappingBookings(
            @Param("phongId") Integer phongId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    /**
     * Kiem tra user da co booking ACTIVE cho cung phong trong khoang ngay hay chua.
     * Active = chua bi huy/het han/tu choi/hoan thanh
     */
    @Query("""
        SELECT COUNT(pdp) FROM PhieuDatPhong pdp
        WHERE pdp.phong.id = :phongId
          AND pdp.nguoiDung.id = :userId
          AND pdp.trangThai NOT IN ('Cancelled', 'Expired', 'Rejected', 'NoShow', 'Completed')
          AND (pdp.ngayDen < :checkOut AND pdp.ngayDi > :checkIn)
        """)
    long countActiveUserBookingsForRoom(
            @Param("phongId") Integer phongId,
            @Param("userId") Integer userId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}
