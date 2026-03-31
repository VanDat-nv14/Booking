package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    List<Promotion> findByTrangThaiOrderByCreatedAtDesc(String trangThai);

    List<Promotion> findByLoaiOrderByCreatedAtDesc(String loai);

    List<Promotion> findByNguoiTaoOrderByCreatedAtDesc(String nguoiTao);

    @Query("SELECT p FROM Promotion p WHERE p.trangThai = 'PENDING_APPROVAL' ORDER BY p.createdAt ASC")
    List<Promotion> findPendingApprovals();

    @Query("SELECT p FROM Promotion p WHERE p.trangThai = 'APPROVED' AND p.ngayBatDau <= :today AND p.ngayKetThuc >= :today")
    List<Promotion> findActivePromotions(@Param("today") LocalDate today);

    @Query("SELECT p FROM Promotion p WHERE (p.khachSan IS NULL OR p.khachSan.id = :hotelId) AND p.trangThai = 'APPROVED' AND p.ngayBatDau <= :today AND p.ngayKetThuc >= :today")
    List<Promotion> findActivePromotionsForHotel(@Param("hotelId") Integer hotelId, @Param("today") LocalDate today);

    @Query("SELECT p FROM Promotion p WHERE p.ngayKetThuc < :today AND p.trangThai IN ('APPROVED', 'ACTIVE')")
    List<Promotion> findExpiredPromotions(@Param("today") LocalDate today);

    @Query("SELECT p FROM Promotion p WHERE p.khachSan.id = :hotelId ORDER BY p.createdAt DESC")
    List<Promotion> findByKhachSanId(@Param("hotelId") Integer hotelId);

    long countByTrangThai(String trangThai);
}
