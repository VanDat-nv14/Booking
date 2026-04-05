package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, Integer> {

    List<LoyaltyTier> findByActiveTrueOrderByThuTuAsc();

    /** Tìm hạng cao nhất mà user đủ điều kiện (tongDiem >= diemToiThieu) */
    List<LoyaltyTier> findByActiveTrueAndDiemToiThieuLessThanEqualOrderByDiemToiThieuDesc(Integer tongDiem);
}
