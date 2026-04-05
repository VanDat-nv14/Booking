package com.example.bookingkhachsan.repository;

import com.example.bookingkhachsan.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {

    long countByNguoiDung_IdAndDiscountId(Integer nguoiDungId, String discountId);

    long countByNguoiDung_IdAndPromotionCodeId(Integer nguoiDungId, String promotionCodeId);
}
