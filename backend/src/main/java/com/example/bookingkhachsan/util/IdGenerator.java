package com.example.bookingkhachsan.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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

    /** NTB-YYYYMMDD-XXXX */
    public String generateNotificationId() {
        return generate("NTB");
    }

    /** GG-YYYYMMDD-XXXX */
    public String generateDiscountId() {
        return generate("GG");
    }

    /** KM-YYYYMMDD-XXXX */
    public String generatePromotionId() {
        return generate("KM");
    }
}
