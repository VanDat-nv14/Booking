package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.DiscountFramework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscountFrameworkRepository extends JpaRepository<DiscountFramework, Long> {
}
