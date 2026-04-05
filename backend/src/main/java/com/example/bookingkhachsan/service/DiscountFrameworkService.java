package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.entity.AuditLog;
import com.example.bookingkhachsan.entity.DiscountFramework;
import com.example.bookingkhachsan.repository.AuditLogRepository;
import com.example.bookingkhachsan.repository.DiscountFrameworkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Quản lý khung chính sách giảm giá toàn chuỗi.
 * Admin thiết lập trần/sàn cho PromotionCode của Manager.
 */
@Service
@RequiredArgsConstructor
public class DiscountFrameworkService {

    private static final Long SINGLETON_ID = 1L;

    private final DiscountFrameworkRepository frameworkRepository;
    private final AuditLogRepository auditLogRepository;

    public record UpdateFrameworkRequest(
            BigDecimal phanTramToiDa,
            BigDecimal phanTramToiThieu,
            BigDecimal soTienToiDa,
            BigDecimal donHangToiThieuBatBuoc
    ) {}

    /**
     * Lấy framework hiện tại. Nếu chưa có, trả về bản ghi mặc định (không lưu DB).
     */
    public DiscountFramework getFramework() {
        return frameworkRepository.findById(SINGLETON_ID).orElseGet(() -> {
            DiscountFramework df = new DiscountFramework();
            df.setId(SINGLETON_ID);
            df.setPhanTramToiDa(new BigDecimal("50"));
            df.setPhanTramToiThieu(new BigDecimal("5"));
            df.setSoTienToiDa(new BigDecimal("2000000"));
            df.setDonHangToiThieuBatBuoc(new BigDecimal("500000"));
            return df;
        });
    }

    @Transactional
    public DiscountFramework updateFramework(UpdateFrameworkRequest req, String adminEmail) {
        DiscountFramework df = frameworkRepository.findById(SINGLETON_ID)
                .orElseGet(() -> {
                    DiscountFramework newDf = new DiscountFramework();
                    newDf.setId(SINGLETON_ID);
                    return newDf;
                });

        if (req.phanTramToiDa() != null) {
            if (req.phanTramToiDa().compareTo(BigDecimal.ZERO) <= 0 || req.phanTramToiDa().compareTo(new BigDecimal("80")) > 0) {
                throw new IllegalArgumentException("% tối đa phải trong khoảng 0-80%.");
            }
            df.setPhanTramToiDa(req.phanTramToiDa());
        }
        if (req.phanTramToiThieu() != null) {
            if (req.phanTramToiThieu().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("% tối thiểu không được âm.");
            }
            df.setPhanTramToiThieu(req.phanTramToiThieu());
        }
        if (req.soTienToiDa() != null) {
            if (req.soTienToiDa().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Số tiền tối đa phải > 0.");
            }
            df.setSoTienToiDa(req.soTienToiDa());
        }
        if (req.donHangToiThieuBatBuoc() != null) {
            df.setDonHangToiThieuBatBuoc(req.donHangToiThieuBatBuoc());
        }

        // Validate min < max
        if (df.getPhanTramToiThieu() != null && df.getPhanTramToiDa() != null
                && df.getPhanTramToiThieu().compareTo(df.getPhanTramToiDa()) >= 0) {
            throw new IllegalArgumentException("% tối thiểu phải nhỏ hơn % tối đa.");
        }

        df.setNguoiCapNhat(adminEmail);
        df.setUpdatedAt(LocalDateTime.now());
        DiscountFramework saved = frameworkRepository.save(df);

        auditLogRepository.save(AuditLog.builder()
                .module("DISCOUNT_FRAMEWORK")
                .entityId("1")
                .action("UPDATE")
                .performedBy(adminEmail)
                .role("Admin")
                .description("Cập nhật khung chính sách giảm giá")
                .build());

        return saved;
    }
}
