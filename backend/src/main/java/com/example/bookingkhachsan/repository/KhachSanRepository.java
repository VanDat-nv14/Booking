package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachSanRepository extends JpaRepository<KhachSan, Integer> {

    Optional<KhachSan> findByNguoiQuanLy_Id(Integer managerId);
    
    // Simple search by location and stars
    List<KhachSan> findByViTriId(Integer viTriId);
    List<KhachSan> findByViTriIdAndSoSaoGreaterThanEqual(Integer viTriId, Integer soSao);
    
    @Query("SELECT DISTINCT k FROM KhachSan k " +
           "JOIN k.phongs p " +
           "WHERE (:viTriId IS NULL OR k.viTri.id = :viTriId) " +
           "AND (:soSao IS NULL OR k.soSao >= :soSao) " +
           "AND (:minPrice IS NULL OR p.giaTien >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.giaTien <= :maxPrice) " +
           "AND p.trangThai = 'Trống' " +
           "AND p.id NOT IN (" +
           "  SELECT pdp.phong.id FROM PhieuDatPhong pdp " +
           "  WHERE pdp.trangThai NOT IN ('Đã hủy', 'Đã checkout') " +
           "  AND (pdp.ngayDen < :checkOut AND pdp.ngayDi > :checkIn)" +
           ")")
    List<KhachSan> findAvailableHotels(@Param("viTriId") Integer viTriId,
                                       @Param("soSao") Integer soSao,
                                       @Param("minPrice") BigDecimal minPrice,
                                       @Param("maxPrice") BigDecimal maxPrice,
                                       @Param("checkIn") LocalDate checkIn,
                                       @Param("checkOut") LocalDate checkOut);

    /** Load hotels with phongs in one query for map data (avoid N+1). */
    @Query("SELECT DISTINCT k FROM KhachSan k LEFT JOIN FETCH k.phongs WHERE k.viDo IS NOT NULL AND k.kinhDo IS NOT NULL")
    List<KhachSan> findAllWithPhongsForMap();
}
