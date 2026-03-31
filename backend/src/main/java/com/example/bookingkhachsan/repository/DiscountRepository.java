package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, String> {

    Optional<Discount> findByCode(String code);

    boolean existsByCode(String code);

    List<Discount> findByTrangThaiOrderByCreatedAtDesc(String trangThai);

    List<Discount> findByLoaiOrderByCreatedAtDesc(String loai);

    @Query("SELECT d FROM Discount d WHERE d.trangThai = 'ACTIVE' AND d.ngayBatDau <= :today AND d.ngayKetThuc >= :today")
    List<Discount> findActiveDiscounts(@Param("today") LocalDate today);

    @Query("SELECT d FROM Discount d WHERE (d.khachSan IS NULL OR d.khachSan.id = :hotelId) AND d.trangThai = 'ACTIVE' AND d.ngayBatDau <= :today AND d.ngayKetThuc >= :today")
    List<Discount> findActiveDiscountsForHotel(@Param("hotelId") Integer hotelId, @Param("today") LocalDate today);

    List<Discount> findByNguoiTaoOrderByCreatedAtDesc(String nguoiTao);

    @Query("SELECT d FROM Discount d WHERE d.ngayKetThuc < :today AND d.trangThai = 'ACTIVE'")
    List<Discount> findExpiredDiscounts(@Param("today") LocalDate today);

    long countByTrangThai(String trangThai);
}
