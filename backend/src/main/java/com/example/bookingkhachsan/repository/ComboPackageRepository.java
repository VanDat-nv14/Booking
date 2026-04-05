package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.ComboPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ComboPackageRepository extends JpaRepository<ComboPackage, String> {

    List<ComboPackage> findByKhachSan_IdOrderByCreatedAtDesc(Integer hotelId);

    /** Combo ACTIVE còn trong thời hạn của khách sạn */
    @Query("SELECT c FROM ComboPackage c WHERE c.khachSan.id = :hotelId " +
           "AND c.trangThai = 'ACTIVE' " +
           "AND (c.ngayBatDau IS NULL OR c.ngayBatDau <= :today) " +
           "AND (c.ngayKetThuc IS NULL OR c.ngayKetThuc >= :today) " +
           "ORDER BY c.createdAt DESC")
    List<ComboPackage> findActiveByHotel(Integer hotelId, LocalDate today);
}
