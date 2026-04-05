package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.CouponRedemption;
import com.example.bookingkhachsan.entity.Discount;
import com.example.bookingkhachsan.entity.NguoiDung;
import com.example.bookingkhachsan.entity.PhieuDatPhong;
import com.example.bookingkhachsan.entity.PromotionCode;
import com.example.bookingkhachsan.repository.CouponRedemptionRepository;
import com.example.bookingkhachsan.repository.DiscountRepository;
import com.example.bookingkhachsan.repository.PromotionCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Một booking chỉ áp dụng một mã: Discount (nền tảng, Admin) hoặc PromotionCode (theo KS, Manager).
 * Thứ tự tra cứu: Discount trước, sau đó PromotionCode (tránh trùng code ưu tiên mã nền tảng).
 * {@link #prepareLocked} dùng khóa pessimistic ngay trước khi tạo đơn để giảm race quota.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CouponApplicationService {

    private static final BigDecimal MAX_PERCENT = new BigDecimal("80");

    private final DiscountRepository discountRepository;
    private final PromotionCodeRepository promotionCodeRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;

    public enum SourceType {
        DISCOUNT, PROMO_CODE
    }

    public record CouponPlan(
            SourceType sourceType,
            Discount discount,
            PromotionCode promotionCode,
            BigDecimal discountAmount,
            String codeSnapshot
    ) {}

    /**
     * Khóa bản ghi mã + validate đầy đủ. Gọi trong cùng transaction với tạo booking.
     */
    @Transactional
    public CouponPlan prepareLocked(String rawCode, Integer userId, Integer hotelId,
                                    Integer loaiPhongId, long soDem, BigDecimal orderAmount) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new IllegalArgumentException("Mã giảm giá không được để trống.");
        }
        String code = rawCode.trim().toUpperCase();

        Optional<Discount> dOpt = discountRepository.findByCodeForUpdate(code);
        if (dOpt.isPresent()) {
            Discount d = dOpt.get();
            validateDiscountChain(d, userId, hotelId, orderAmount);
            BigDecimal amt = calculateDiscountAmount(d, orderAmount);
            return new CouponPlan(SourceType.DISCOUNT, d, null, amt, d.getCode());
        }

        Optional<PromotionCode> pOpt = promotionCodeRepository.findByCodeForUpdate(code);
        if (pOpt.isPresent()) {
            PromotionCode p = pOpt.get();
            validatePromotionChain(p, userId, hotelId, loaiPhongId, soDem, orderAmount);
            BigDecimal amt = calculatePromotionAmount(p, orderAmount);
            return new CouponPlan(SourceType.PROMO_CODE, null, p, amt, p.getCode());
        }

        throw new IllegalArgumentException("Mã không tồn tại.");
    }

    public record SimplePreview(boolean valid, String message, BigDecimal discountAmount, String kind) {}

    /**
     * Xem trước một mã: ưu tiên Discount nền tảng, sau đó PromotionCode (không khóa).
     */
    public SimplePreview previewCode(String code, BigDecimal orderAmount, Integer hotelId,
                                     Integer loaiPhongId, long soDem, Integer userId) {
        String norm = code.trim().toUpperCase();
        if (discountRepository.findByCode(norm).isPresent()) {
            Discount d = discountRepository.findByCode(norm).orElseThrow();
            try {
                validateDiscountChain(d, userId, hotelId, orderAmount);
            } catch (IllegalArgumentException ex) {
                return new SimplePreview(false, ex.getMessage(), BigDecimal.ZERO, "DISCOUNT");
            }
            return new SimplePreview(true, "Mã giảm giá hợp lệ.", calculateDiscountAmount(d, orderAmount), "DISCOUNT");
        }
        if (promotionCodeRepository.findByCode(norm).isPresent()) {
            PromotionCode p = promotionCodeRepository.findByCode(norm).orElseThrow();
            try {
                validatePromotionChain(p, userId, hotelId, loaiPhongId, soDem, orderAmount);
            } catch (IllegalArgumentException ex) {
                return new SimplePreview(false, ex.getMessage(), BigDecimal.ZERO, "PROMO_CODE");
            }
            return new SimplePreview(true, "Mã khuyến mãi hợp lệ.", calculatePromotionAmount(p, orderAmount), "PROMO_CODE");
        }
        return new SimplePreview(false, "Mã không tồn tại.", BigDecimal.ZERO, null);
    }

    @Transactional
    public void finalizeAfterBooking(CouponPlan plan, PhieuDatPhong booking, NguoiDung user) {
        if (plan == null) {
            return;
        }
        if (plan.sourceType == SourceType.DISCOUNT) {
            Discount d = plan.discount();
            int used = d.getSoLanDaDung() == null ? 0 : d.getSoLanDaDung();
            d.setSoLanDaDung(used + 1);
            if (d.getSoLanSuDungToiDa() != null && d.getSoLanDaDung() >= d.getSoLanSuDungToiDa()) {
                d.setTrangThai("INACTIVE");
            }
            discountRepository.save(d);
            couponRedemptionRepository.save(CouponRedemption.builder()
                    .nguoiDung(user)
                    .phieuDatPhong(booking)
                    .sourceType("DISCOUNT")
                    .discountId(d.getId())
                    .maSnapshot(plan.codeSnapshot())
                    .soTienGiam(plan.discountAmount())
                    .build());
        } else {
            PromotionCode p = plan.promotionCode();
            int used = p.getSoLanDaDung() == null ? 0 : p.getSoLanDaDung();
            p.setSoLanDaDung(used + 1);
            if (p.getSoLanSuDungToiDa() != null && p.getSoLanDaDung() >= p.getSoLanSuDungToiDa()) {
                p.setTrangThai("INACTIVE");
            }
            promotionCodeRepository.save(p);
            couponRedemptionRepository.save(CouponRedemption.builder()
                    .nguoiDung(user)
                    .phieuDatPhong(booking)
                    .sourceType("PROMO_CODE")
                    .promotionCodeId(p.getId())
                    .maSnapshot(plan.codeSnapshot())
                    .soTienGiam(plan.discountAmount())
                    .build());
        }
    }

    // --- Validation chains (thứ tự gần với spec) ---

    private void validateDiscountChain(Discount d, Integer userId, Integer hotelId, BigDecimal orderAmount) {
        if (!"ACTIVE".equals(d.getTrangThai())) {
            throw new IllegalArgumentException("Mã giảm giá không còn hiệu lực (không Active).");
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(d.getNgayBatDau()) || today.isAfter(d.getNgayKetThuc())) {
            throw new IllegalArgumentException("Mã giảm giá ngoài thời gian hiệu lực.");
        }
        if (d.getKhachSan() != null) {
            throw new IllegalArgumentException("Mã giảm giá nền tảng không được gắn khách sạn. Liên hệ quản trị.");
        }
        if (d.getSoLanSuDungToiDa() != null
                && (d.getSoLanDaDung() != null && d.getSoLanDaDung() >= d.getSoLanSuDungToiDa())) {
            throw new IllegalArgumentException("Mã đã hết lượt sử dụng toàn hệ thống.");
        }
        if (d.getDonHangToiThieu() != null && orderAmount.compareTo(d.getDonHangToiThieu()) < 0) {
            throw new IllegalArgumentException(
                    "Giá trị đơn chưa đạt tối thiểu " + d.getDonHangToiThieu() + " VNĐ.");
        }
        if (userId != null && d.getSoLanToiDaMoiUser() != null) {
            long n = couponRedemptionRepository.countByNguoiDung_IdAndDiscountId(userId, d.getId());
            if (n >= d.getSoLanToiDaMoiUser()) {
                throw new IllegalArgumentException("Bạn đã dùng hết lượt cho mã này.");
            }
        }
    }

    private void validatePromotionChain(PromotionCode p, Integer userId, Integer hotelId,
                                        Integer loaiPhongId, long soDem, BigDecimal orderAmount) {
        if (!"ACTIVE".equals(p.getTrangThai())) {
            throw new IllegalArgumentException("Mã khuyến mãi không còn hiệu lực (không Active).");
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(p.getNgayBatDau()) || today.isAfter(p.getNgayKetThuc())) {
            throw new IllegalArgumentException("Mã khuyến mãi ngoài thời gian hiệu lực.");
        }
        if (p.getKhachSan() == null || hotelId == null
                || !p.getKhachSan().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Mã khuyến mãi không áp dụng cho khách sạn này.");
        }
        if (p.getLoaiPhongId() != null) {
            if (loaiPhongId == null || !p.getLoaiPhongId().equals(loaiPhongId)) {
                throw new IllegalArgumentException("Mã không áp dụng cho loại phòng đã chọn.");
            }
        }
        if (p.getSoDemToiThieu() != null && soDem < p.getSoDemToiThieu()) {
            throw new IllegalArgumentException("Số đêm chưa đạt tối thiểu (" + p.getSoDemToiThieu() + " đêm).");
        }
        if (p.getDonHangToiThieu() != null && orderAmount.compareTo(p.getDonHangToiThieu()) < 0) {
            throw new IllegalArgumentException(
                    "Giá trị đơn chưa đạt tối thiểu " + p.getDonHangToiThieu() + " VNĐ.");
        }
        if (p.getSoLanSuDungToiDa() != null
                && (p.getSoLanDaDung() != null && p.getSoLanDaDung() >= p.getSoLanSuDungToiDa())) {
            throw new IllegalArgumentException("Mã đã hết lượt sử dụng.");
        }
        if (userId != null && p.getSoLanToiDaMoiUser() != null) {
            long n = couponRedemptionRepository.countByNguoiDung_IdAndPromotionCodeId(userId, p.getId());
            if (n >= p.getSoLanToiDaMoiUser()) {
                throw new IllegalArgumentException("Bạn đã dùng hết lượt cho mã này.");
            }
        }
    }

    private BigDecimal calculateDiscountAmount(Discount discount, BigDecimal orderAmount) {
        BigDecimal discountAmount;
        if ("PERCENT".equals(discount.getLoai())) {
            discountAmount = orderAmount.multiply(discount.getGiaTri()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (discount.getGiamToiDa() != null && discountAmount.compareTo(discount.getGiamToiDa()) > 0) {
                discountAmount = discount.getGiamToiDa();
            }
        } else {
            discountAmount = discount.getGiaTri();
            if (discountAmount.compareTo(orderAmount) > 0) {
                discountAmount = orderAmount;
            }
        }
        return discountAmount.setScale(0, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePromotionAmount(PromotionCode p, BigDecimal orderAmount) {
        if (!List.of("PERCENT", "FIXED").contains(p.getLoai())) {
            throw new IllegalArgumentException("Loại mã khuyến mãi không hỗ trợ: " + p.getLoai());
        }
        if ("PERCENT".equals(p.getLoai())) {
            if (p.getGiaTri().compareTo(MAX_PERCENT) > 0) {
                throw new IllegalArgumentException("Phần trăm giảm không hợp lệ.");
            }
            BigDecimal amt = orderAmount.multiply(p.getGiaTri()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (p.getGiamToiDa() != null && amt.compareTo(p.getGiamToiDa()) > 0) {
                amt = p.getGiamToiDa();
            }
            return amt.setScale(0, RoundingMode.HALF_UP);
        }
        BigDecimal amt = p.getGiaTri();
        if (amt.compareTo(orderAmount) > 0) {
            amt = orderAmount;
        }
        return amt.setScale(0, RoundingMode.HALF_UP);
    }
}
