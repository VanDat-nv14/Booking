package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.LoyaltyTier;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.UserLoyalty;
import com.example.bookingkhachsan.repository.LoyaltyTierRepository;
import com.example.bookingkhachsan.repository.NguoiDungRepository;
import com.example.bookingkhachsan.repository.UserLoyaltyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Xử lý nghiệp vụ tích điểm và hạng thành viên cho user.
 */
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private static final int POINTS_PER_VND = 10_000; // 1 điểm / 10,000 VND

    private final UserLoyaltyRepository userLoyaltyRepository;
    private final LoyaltyTierRepository tierRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * Lấy (hoặc tạo mới) thông tin loyalty của user.
     */
    @Transactional
    public UserLoyalty getOrCreate(Integer userId) {
        return userLoyaltyRepository.findByNguoiDung_Id(userId).orElseGet(() -> {
            NguoiDung user = nguoiDungRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + userId));
            UserLoyalty ul = UserLoyalty.builder()
                    .nguoiDung(user)
                    .tongDiem(0)
                    .ngayCapNhatHang(LocalDate.now())
                    .build();
            return userLoyaltyRepository.save(ul);
        });
    }

    /**
     * Cộng điểm sau khi checkout. 1 điểm / 10,000 VND.
     * Tự động nâng hạng nếu đủ điều kiện.
     */
    @Transactional
    public UserLoyalty awardPoints(Integer userId, BigDecimal bookingAmount) {
        if (bookingAmount == null || bookingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return getOrCreate(userId);
        }
        UserLoyalty ul = getOrCreate(userId);
        int points = bookingAmount.divideToIntegralValue(BigDecimal.valueOf(POINTS_PER_VND)).intValue();
        if (points <= 0) return ul;

        ul.setTongDiem(ul.getTongDiem() + points);
        upgradeTierIfNeeded(ul);
        return userLoyaltyRepository.save(ul);
    }

    /**
     * Cộng điểm trực tiếp (VD: thưởng khi mua gói membership).
     */
    @Transactional
    public UserLoyalty awardBonusPoints(Integer userId, int points) {
        if (points <= 0) return getOrCreate(userId);
        UserLoyalty ul = getOrCreate(userId);
        ul.setTongDiem(ul.getTongDiem() + points);
        upgradeTierIfNeeded(ul);
        return userLoyaltyRepository.save(ul);
    }

    /**
     * Lấy % ưu đãi hiện tại của user dựa trên hạng tích điểm.
     * Trả về 0 nếu user chưa có hạng hoặc hạng không có ưu đãi.
     */
    public BigDecimal getTierDiscount(Integer userId) {
        return userLoyaltyRepository.findByNguoiDung_Id(userId)
                .map(ul -> ul.getHangHienTai() != null ? ul.getHangHienTai().getPhanTramUuDai() : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);
    }

    /**
     * Kiểm tra và nâng hạng nếu đủ điểm.
     */
    private void upgradeTierIfNeeded(UserLoyalty ul) {
        List<LoyaltyTier> eligibleTiers = tierRepository
                .findByActiveTrueAndDiemToiThieuLessThanEqualOrderByDiemToiThieuDesc(ul.getTongDiem());
        if (!eligibleTiers.isEmpty()) {
            LoyaltyTier bestTier = eligibleTiers.get(0);
            if (ul.getHangHienTai() == null || !ul.getHangHienTai().getId().equals(bestTier.getId())) {
                ul.setHangHienTai(bestTier);
                ul.setNgayCapNhatHang(LocalDate.now());
            }
        }
    }
}
