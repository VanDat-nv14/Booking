package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.PhieuDatPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
    
    @Modifying
    @Query(value = "EXEC sp_ThanhToanCuoiKy @pdp_id = :pdpId", nativeQuery = true)
    void checkout(@Param("pdpId") Integer pdpId);

    @Query("SELECT COUNT(pdp) FROM PhieuDatPhong pdp " +
           "WHERE pdp.phong.id = :phongId " +
           "AND pdp.trangThai NOT IN ('Đã hủy', 'Đã checkout') " +
           "AND (pdp.ngayDen < :checkOut AND pdp.ngayDi > :checkIn)")
    long countOverlappingBookings(@Param("phongId") Integer phongId, 
                                  @Param("checkIn") LocalDate checkIn, 
                                  @Param("checkOut") LocalDate checkOut);
}
