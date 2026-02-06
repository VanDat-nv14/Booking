package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    Optional<NguoiDung> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<NguoiDung> findByResetToken(String resetToken);
}
