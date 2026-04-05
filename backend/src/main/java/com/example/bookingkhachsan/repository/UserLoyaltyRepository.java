package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.UserLoyalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLoyaltyRepository extends JpaRepository<UserLoyalty, Long> {

    Optional<UserLoyalty> findByNguoiDung_Id(Integer userId);
}
