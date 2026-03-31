package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, String> {

    List<SystemNotification> findByLoaiOrderByCreatedAtDesc(String loai);

    List<SystemNotification> findByTrangThaiOrderByCreatedAtDesc(String trangThai);

    List<SystemNotification> findByDoiTuongOrderByCreatedAtDesc(String doiTuong);

    @Query("SELECT n FROM SystemNotification n WHERE n.trangThai = 'SCHEDULED' AND n.lichGui <= :now")
    List<SystemNotification> findDueScheduledNotifications(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM SystemNotification n WHERE n.loai = 'ALERT' AND n.trangThai = 'PENDING_CONFIRM' ORDER BY n.createdAt DESC")
    List<SystemNotification> findPendingAlerts();

    List<SystemNotification> findByNguoiTaoOrderByCreatedAtDesc(String nguoiTao);

    /**
     * Khớp doiTuong với chucVu (Admin/HotelManager/User) và bản ghi cũ (ADMIN/HOTEL_MANAGER/USER).
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.trangThai = 'SENT' AND ("
            + "n.doiTuong = 'ALL' OR n.nguoiNhan = :email OR "
            + "((n.doiTuong = 'Admin' OR n.doiTuong = 'ADMIN') AND (:role = 'Admin' OR :role = 'ADMIN')) OR "
            + "((n.doiTuong = 'HotelManager' OR n.doiTuong = 'HOTEL_MANAGER') "
            + "AND (:role = 'HotelManager' OR :role = 'HOTEL_MANAGER')) OR "
            + "((n.doiTuong = 'User' OR n.doiTuong = 'USER') AND (:role = 'User' OR :role = 'USER'))"
            + ") ORDER BY n.createdAt DESC")
    List<SystemNotification> findFilteredNotifications(@Param("role") String role, @Param("email") String email);

    long countByTrangThai(String trangThai);
}
