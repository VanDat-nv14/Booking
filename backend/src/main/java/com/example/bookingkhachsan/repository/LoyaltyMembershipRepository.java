package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.LoyaltyMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyMembershipRepository extends JpaRepository<LoyaltyMembership, String> {

    List<LoyaltyMembership> findByActiveTrueOrderByGiaAsc();
}
