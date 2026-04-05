package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.Discount;
import com.example.bookingkhachsan.entity.PromotionCode;
import com.example.bookingkhachsan.repository.DiscountRepository;
import com.example.bookingkhachsan.repository.PromotionCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dữ liệu mã giảm / khuyến mãi hiển thị công khai (trang KS, chuông thông báo).
 */
@Service
@RequiredArgsConstructor
public class CouponPublicService {

    private final DiscountRepository discountRepository;
    private final PromotionCodeRepository promotionCodeRepository;

    public Map<String, Object> summaryForHotel(Integer hotelId) {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> platform = discountRepository.findActivePlatformDiscounts(today).stream()
                .filter(this::hasGlobalQuotaLeft)
                .map(this::toDiscountTeaser)
                .collect(Collectors.toList());
        List<Map<String, Object>> hotel = promotionCodeRepository.findActivePublicByHotel(hotelId, today).stream()
                .filter(this::hasPromoQuotaLeft)
                .map(this::toPromoTeaser)
                .collect(Collectors.toList());
        return Map.of(
                "platformDiscounts", platform,
                "hotelPromotions", hotel
        );
    }

    /**
     * Gợi ý ngắn cho chuông thông báo: mã nền tảng + mã KS (giới hạn số dòng).
     */
    public Map<String, Object> bellTeasers() {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> platform = discountRepository.findActivePlatformDiscounts(today).stream()
                .filter(this::hasGlobalQuotaLeft)
                .limit(8)
                .map(this::toDiscountTeaser)
                .collect(Collectors.toList());
        List<Map<String, Object>> hotel = promotionCodeRepository
                .findActivePublicRecent(today, PageRequest.of(0, 12)).stream()
                .filter(this::hasPromoQuotaLeft)
                .map(this::toPromoTeaser)
                .collect(Collectors.toList());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("platformDiscounts", platform);
        out.put("hotelPromotions", hotel);
        return out;
    }

    private boolean hasGlobalQuotaLeft(Discount d) {
        if (d.getSoLanSuDungToiDa() == null) {
            return true;
        }
        int used = d.getSoLanDaDung() == null ? 0 : d.getSoLanDaDung();
        return used < d.getSoLanSuDungToiDa();
    }

    private boolean hasPromoQuotaLeft(PromotionCode p) {
        if (p.getSoLanSuDungToiDa() == null) {
            return true;
        }
        int used = p.getSoLanDaDung() == null ? 0 : p.getSoLanDaDung();
        return used < p.getSoLanSuDungToiDa();
    }

    private Map<String, Object> toDiscountTeaser(Discount d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("kind", "DISCOUNT");
        m.put("code", d.getCode());
        m.put("ten", d.getTen());
        m.put("loai", d.getLoai());
        m.put("giaTri", d.getGiaTri());
        m.put("ngayKetThuc", d.getNgayKetThuc() != null ? d.getNgayKetThuc().toString() : null);
        m.put("donHangToiThieu", d.getDonHangToiThieu());
        return m;
    }

    private Map<String, Object> toPromoTeaser(PromotionCode p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("kind", "PROMO_CODE");
        m.put("hotelId", p.getKhachSan() != null ? p.getKhachSan().getId() : null);
        m.put("hotelName", p.getKhachSan() != null ? p.getKhachSan().getTen() : null);
        m.put("code", p.getCode());
        m.put("ten", p.getTen());
        m.put("moTa", p.getMoTa());
        m.put("loai", p.getLoai());
        m.put("giaTri", p.getGiaTri());
        m.put("ngayKetThuc", p.getNgayKetThuc() != null ? p.getNgayKetThuc().toString() : null);
        m.put("donHangToiThieu", p.getDonHangToiThieu());
        m.put("soDemToiThieu", p.getSoDemToiThieu());
        m.put("loaiPhongId", p.getLoaiPhongId());
        return m;
    }
}
