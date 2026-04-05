package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.PromotionCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromotionCodeRepository extends JpaRepository<PromotionCode, String> {

    Optional<PromotionCode> findByCode(String code);

    boolean existsByCode(String code);

    List<PromotionCode> findByKhachSan_IdOrderByCreatedAtDesc(Integer khachSanId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PromotionCode p WHERE p.code = :code")
    Optional<PromotionCode> findByCodeForUpdate(@Param("code") String code);

    @Query("SELECT p FROM PromotionCode p JOIN FETCH p.khachSan ks WHERE ks.id = :hotelId AND p.trangThai = 'ACTIVE' AND p.ngayBatDau <= :today AND p.ngayKetThuc >= :today ORDER BY p.ngayKetThuc ASC")
    List<PromotionCode> findActivePublicByHotel(@Param("hotelId") Integer hotelId, @Param("today") LocalDate today);

    @Query("SELECT p FROM PromotionCode p JOIN FETCH p.khachSan ks WHERE p.trangThai = 'ACTIVE' AND p.ngayBatDau <= :today AND p.ngayKetThuc >= :today ORDER BY p.createdAt DESC")
    List<PromotionCode> findActivePublicRecent(@Param("today") LocalDate today, Pageable pageable);
}
