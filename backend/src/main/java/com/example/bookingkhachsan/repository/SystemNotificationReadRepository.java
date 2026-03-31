package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.SystemNotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SystemNotificationReadRepository extends JpaRepository<SystemNotificationRead, Long> {

    @Query("SELECT r.notificationId FROM SystemNotificationRead r WHERE r.userEmail = :email")
    List<String> findNotificationIdsByUserEmail(@Param("email") String email);

    boolean existsByUserEmailAndNotificationId(String userEmail, String notificationId);
}
