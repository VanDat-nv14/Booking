package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {

    List<UserMembership> findByNguoiDung_IdOrderByCreatedAtDesc(Integer userId);

    /** Tìm gói ACTIVE còn hạn của user */
    @Query("SELECT um FROM UserMembership um WHERE um.nguoiDung.id = :userId " +
           "AND um.trangThai = 'ACTIVE' AND um.ngayKetThuc >= :today " +
           "ORDER BY um.goiThanhVien.phanTramGiam DESC")
    Optional<UserMembership> findActiveMembership(Integer userId, LocalDate today);

    /** Lấy danh sách ACTIVE đã hết hạn để auto-expire */
    @Query("SELECT um FROM UserMembership um WHERE um.trangThai = 'ACTIVE' AND um.ngayKetThuc < :today")
    List<UserMembership> findExpiredMemberships(LocalDate today);
}
