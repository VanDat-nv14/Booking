package com.example.bookingkhachsan.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Utility để tạo các ID theo định dạng đặc thù cho từng module.
 * Các format:
 *  - Guest Report   : RPT-YYYYMMDD-XXXX
 *  - System Notif   : NTB-YYYYMMDD-XXXX
 *  - Discount       : GG-YYYYMMDD-XXXX
 *  - Promotion      : KM-YYYYMMDD-XXXX
 */
@Component
public class IdGenerator {

    private final AtomicInteger counter = new AtomicInteger(0);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private String generate(String prefix) {
        String date = LocalDate.now().format(DATE_FMT);
        int seq = counter.incrementAndGet() % 10000;
        return String.format("%s-%s-%04d", prefix, date, seq);
    }

    /** RPT-YYYYMMDD-XXXX */
    public String generateReportId() {
        return generate("RPT");
    }

    /**
     * NTB-YYYYMMDD-xxxxxxxx — hậu tố ngẫu nhiên để không trùng khóa sau restart JVM
     * (bộ đếm {@link #generate} cũ dễ sinh NTB-…-0001 trùng bản ghi cũ).
     */
    public String generateNotificationId() {
        String date = LocalDate.now().format(DATE_FMT);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        return "NTB-" + date + "-" + suffix;
    }

    /** GG-YYYYMMDD-XXXX */
    public String generateDiscountId() {
        return generate("GG");
    }

    /** KM-YYYYMMDD-XXXX */
    public String generatePromotionId() {
        return generate("KM");
    }

    /** PC-yyyymmdd-xxxxxxxx — mã khuyến mãi nhập khi đặt phòng (theo khách sạn) */
    public String generatePromotionCodeId() {
        String date = LocalDate.now().format(DATE_FMT);
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        return "PC-" + date + "-" + suffix;
    }

    /** LM-YYYYMMDD-XXXX — gói thành viên trả phí */
    public String generateLoyaltyMembershipId() {
        return generate("LM");
    }

    /** CB-YYYYMMDD-XXXX — gói combo phòng + dịch vụ */
    public String generateComboPackageId() {
        return generate("CB");
    }
}
