package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.Discount;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.DiscountRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import com.example.bookingkhachsan.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final KhachSanRepository khachSanRepository;
    private final AuditLogRepository auditLogRepository;
    private final IdGenerator idGenerator;

    private static final BigDecimal MAX_PERCENT = new BigDecimal("80");

    // DTO inner classes
    public record CreateDiscountRequest(
            String code,
            String ten,
            String moTa,
            String loai,
            BigDecimal giaTri,
            BigDecimal giamToiDa,
            BigDecimal donHangToiThieu,
            Integer soLanSuDungToiDa,
            LocalDate ngayBatDau,
            LocalDate ngayKetThuc,
            Integer khachSanId
    ) {}

    public record UpdateDiscountRequest(
            String ten,
            String moTa,
            BigDecimal giamToiDa,
            BigDecimal donHangToiThieu,
            Integer soLanSuDungToiDa,
            LocalDate ngayKetThuc,
            String trangThai
    ) {}

    public record ValidateDiscountResult(
            boolean valid,
            String message,
            BigDecimal discountAmount,
            Discount discount
    ) {}

    /**
     * Admin tạo mã giảm giá mới.
     * Quy tắc:
     * 1. code phải là duy nhất
     * 2. loại PERCENT: giaTri <= 80
     * 3. ngayBatDau < ngayKetThuc
     * 4. giaTri > 0
     */
    @Transactional
    public Discount createDiscount(CreateDiscountRequest req, String adminEmail) {
        // 1. Validate code uniqueness
        if (req.code() == null || req.code().isBlank()) {
            throw new IllegalArgumentException("Mã giảm giá không được để trống.");
        }
        String code = req.code().trim().toUpperCase();
        if (discountRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Mã giảm giá '" + code + "' đã tồn tại.");
        }

        // 2. Validate loai
        if (!List.of("PERCENT", "FIXED").contains(req.loai())) {
            throw new IllegalArgumentException("Loại giảm giá phải là PERCENT hoặc FIXED. Nhận: " + req.loai());
        }

        // 3. Validate giaTri
        if (req.giaTri() == null || req.giaTri().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị giảm phải lớn hơn 0.");
        }
        if ("PERCENT".equals(req.loai()) && req.giaTri().compareTo(MAX_PERCENT) > 0) {
            throw new IllegalArgumentException(
                    "Giảm giá theo tỷ lệ không được vượt quá " + MAX_PERCENT + "%. Nhận: " + req.giaTri() + "%");
        }

        // 4. Validate dates
        if (req.ngayBatDau() == null || req.ngayKetThuc() == null) {
            throw new IllegalArgumentException("Ngày bắt đầu và ngày kết thúc không được để trống.");
        }
        if (!req.ngayBatDau().isBefore(req.ngayKetThuc())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc.");
        }

        // 5. Optional: hotel
        KhachSan khachSan = null;
        if (req.khachSanId() != null) {
            khachSan = khachSanRepository.findById(req.khachSanId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Khách sạn ID " + req.khachSanId() + " không tồn tại."));
        }

        Discount discount = Discount.builder()
                .id(idGenerator.generateDiscountId())
                .code(code)
                .ten(req.ten())
                .moTa(req.moTa())
                .loai(req.loai())
                .giaTri(req.giaTri())
                .giamToiDa(req.giamToiDa())
                .donHangToiThieu(req.donHangToiThieu())
                .soLanSuDungToiDa(req.soLanSuDungToiDa())
                .soLanDaDung(0)
                .ngayBatDau(req.ngayBatDau())
                .ngayKetThuc(req.ngayKetThuc())
                .khachSan(khachSan)
                .trangThai("ACTIVE")
                .nguoiTao(adminEmail)
                .build();

        Discount saved = discountRepository.save(discount);

        auditLogRepository.save(AuditLog.builder()
                .module("DISCOUNT")
                .entityId(saved.getId())
                .action("CREATE")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Tạo mã giảm giá: " + code + " | Loại: " + req.loai()
                        + " | Giá trị: " + req.giaTri())
                .build());

        return saved;
    }

    /**
     * Admin cập nhật mã giảm giá.
     */
    @Transactional
    public Discount updateDiscount(String id, UpdateDiscountRequest req, String adminEmail) {
        Discount discount = getById(id);

        if (discount.getSoLanDaDung() > 0) {
            // Khi đã sử dụng: chỉ cho phép vô hiệu hóa, không chỉnh sửa giá trị
            if (req.trangThai() != null && "INACTIVE".equals(req.trangThai())) {
                discount.setTrangThai("INACTIVE");
                discountRepository.save(discount);
                auditLogRepository.save(AuditLog.builder()
                        .module("DISCOUNT")
                        .entityId(id)
                        .action("DEACTIVATE")
                        .performedBy(adminEmail)
                        .role("Admin")
                        .description("Vô hiệu hóa mã giảm giá đã được dùng: " + discount.getCode())
                        .build());
                return discount;
            }
        }

        String oldState = discount.getTrangThai();
        if (req.ten() != null) discount.setTen(req.ten());
        if (req.moTa() != null) discount.setMoTa(req.moTa());
        if (req.giamToiDa() != null) discount.setGiamToiDa(req.giamToiDa());
        if (req.donHangToiThieu() != null) discount.setDonHangToiThieu(req.donHangToiThieu());
        if (req.soLanSuDungToiDa() != null) discount.setSoLanSuDungToiDa(req.soLanSuDungToiDa());
        if (req.ngayKetThuc() != null) {
            if (!discount.getNgayBatDau().isBefore(req.ngayKetThuc())) {
                throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu.");
            }
            discount.setNgayKetThuc(req.ngayKetThuc());
        }
        if (req.trangThai() != null) discount.setTrangThai(req.trangThai());

        Discount updated = discountRepository.save(discount);

        auditLogRepository.save(AuditLog.builder()
                .module("DISCOUNT")
                .entityId(id)
                .action("UPDATE")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Cập nhật mã giảm giá: " + discount.getCode()
                        + " | Trạng thái: " + oldState + " -> " + discount.getTrangThai())
                .build());

        return updated;
    }

    /**
     * Xác thực và áp dụng mã giảm giá cho một đơn đặt phòng.
     * Không save vào DB ở đây - chỉ trả về kết quả tính toán.
     */
    public ValidateDiscountResult validateAndCalculate(String code, BigDecimal orderAmount, Integer hotelId) {
        Discount discount = discountRepository.findByCode(code.trim().toUpperCase())
                .orElse(null);

        if (discount == null) {
            return new ValidateDiscountResult(false, "Mã giảm giá không tồn tại.", BigDecimal.ZERO, null);
        }
        if (!"ACTIVE".equals(discount.getTrangThai())) {
            return new ValidateDiscountResult(false, "Mã giảm giá không còn hiệu lực.", BigDecimal.ZERO, null);
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(discount.getNgayBatDau()) || today.isAfter(discount.getNgayKetThuc())) {
            return new ValidateDiscountResult(false, "Mã giảm giá đã hết hạn hoặc chưa đến ngày áp dụng.", BigDecimal.ZERO, null);
        }
        if (discount.getSoLanSuDungToiDa() != null
                && discount.getSoLanDaDung() >= discount.getSoLanSuDungToiDa()) {
            return new ValidateDiscountResult(false, "Mã giảm giá đã được sử dụng hết lượt.", BigDecimal.ZERO, null);
        }
        if (discount.getDonHangToiThieu() != null
                && orderAmount.compareTo(discount.getDonHangToiThieu()) < 0) {
            return new ValidateDiscountResult(false,
                    "Đơn hàng tối thiểu phải là " + discount.getDonHangToiThieu() + " VNĐ.",
                    BigDecimal.ZERO, null);
        }
        // Kiểm tra hotel scope
        if (discount.getKhachSan() != null && !discount.getKhachSan().getId().equals(hotelId)) {
            return new ValidateDiscountResult(false, "Mã giảm giá không áp dụng cho khách sạn này.", BigDecimal.ZERO, null);
        }

        // Tính toán
        BigDecimal discountAmount;
        if ("PERCENT".equals(discount.getLoai())) {
            discountAmount = orderAmount.multiply(discount.getGiaTri()).divide(new BigDecimal("100"));
            if (discount.getGiamToiDa() != null && discountAmount.compareTo(discount.getGiamToiDa()) > 0) {
                discountAmount = discount.getGiamToiDa();
            }
        } else {
            discountAmount = discount.getGiaTri();
            if (discountAmount.compareTo(orderAmount) > 0) {
                discountAmount = orderAmount;
            }
        }

        return new ValidateDiscountResult(true, "Mã giảm giá hợp lệ.", discountAmount, discount);
    }

    /**
     * Ghi nhận lượt sử dụng mã giảm giá (gọi sau khi booking được confirm).
     */
    @Transactional
    public void incrementUsage(String discountId) {
        Discount discount = getById(discountId);
        discount.setSoLanDaDung(discount.getSoLanDaDung() + 1);
        // Tự động vô hiệu nếu hết lượt
        if (discount.getSoLanSuDungToiDa() != null
                && discount.getSoLanDaDung() >= discount.getSoLanSuDungToiDa()) {
            discount.setTrangThai("INACTIVE");
        }
        discountRepository.save(discount);
    }

    public Discount getById(String id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá: " + id));
    }

    public List<Discount> getAll() {
        return discountRepository.findAll();
    }

    public List<Discount> getByStatus(String trangThai) {
        return discountRepository.findByTrangThaiOrderByCreatedAtDesc(trangThai);
    }

    public List<Discount> getActiveDiscounts(Integer hotelId) {
        if (hotelId != null) {
            return discountRepository.findActiveDiscountsForHotel(hotelId, LocalDate.now());
        }
        return discountRepository.findActiveDiscounts(LocalDate.now());
    }

    /**
     * Scheduled: Hàng ngày lúc 0h, đánh dấu các mã đã hết hạn.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void expireOutdatedDiscounts() {
        List<Discount> expired = discountRepository.findExpiredDiscounts(LocalDate.now());
        for (Discount d : expired) {
            d.setTrangThai("EXPIRED");
            discountRepository.save(d);
            log.info("[DISCOUNT] Đã đánh dấu hết hạn: {}", d.getCode());
        }
    }
}
