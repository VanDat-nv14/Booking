package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.GuestReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestReportRepository extends JpaRepository<GuestReport, String> {

    List<GuestReport> findByBookingCodeOrderByCreatedAtDesc(String bookingCode);

    List<GuestReport> findByTrangThaiOrderByCreatedAtDesc(String trangThai);

    List<GuestReport> findByPriorityOrderByCreatedAtDesc(String priority);

    @Query("SELECT r FROM GuestReport r WHERE r.priority = 'HIGH' AND r.daThongBaoAdmin = false ORDER BY r.createdAt DESC")
    List<GuestReport> findHighPriorityUnnotified();

    @Query("SELECT r FROM GuestReport r WHERE r.email = :email ORDER BY r.createdAt DESC")
    List<GuestReport> findByEmail(@Param("email") String email);

    List<GuestReport> findByNguoiXuLyOrderByCreatedAtDesc(String nguoiXuLy);

    long countByTrangThai(String trangThai);

    long countByPriority(String priority);
}
