package com.example.bookingkhachsan.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Tự động fix DB khi Spring Boot khởi động:
 * 1. Xóa trigger INSTEAD OF INSERT trg_GenerateBookingCode (gây lỗi "null identifier")
 * 2. Thêm các cột mới còn thiếu
 * 3. Đảm bảo ma_dat_phong nullable (Java sinh mã, không cần trigger)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DbMigrationRunner {

    private final JdbcTemplate jdbc;

    @EventListener(ApplicationReadyEvent.class)
    public void runMigrations() {
        log.info("=== DbMigrationRunner: Bắt đầu kiểm tra DB ===");
        try {
            dropTriggerIfExists("trg_GenerateBookingCode");
            addColumnIfNotExists("phieu_dat_phong", "loai_dat_phong",     "NVARCHAR(30) DEFAULT 'InstantBooking'");
            addColumnIfNotExists("phieu_dat_phong", "phuong_thuc_thanh_toan", "NVARCHAR(50)");
            addColumnIfNotExists("phieu_dat_phong", "pending_expires_at", "DATETIME2");
            addColumnIfNotExists("phieu_dat_phong", "so_nguoi_lon",       "INT DEFAULT 1");
            addColumnIfNotExists("phieu_dat_phong", "so_tre_em",          "INT DEFAULT 0");
            addColumnIfNotExists("phieu_dat_phong", "ghi_chu_khach",      "NVARCHAR(MAX)");
            addColumnIfNotExists("phieu_dat_phong", "ghi_chu_huy",        "NVARCHAR(MAX)");
            addColumnIfNotExists("phieu_dat_phong", "ti_le_hoa_hong",     "DECIMAL(5,2) DEFAULT 0");
            addColumnIfNotExists("phieu_dat_phong", "tien_hoa_hong",      "DECIMAL(18,2) DEFAULT 0");
            addColumnIfNotExists("phieu_dat_phong", "tien_coc",           "DECIMAL(18,2) DEFAULT 0");
            addColumnIfNotExists("phieu_dat_phong", "trang_thai_coc",     "NVARCHAR(20) DEFAULT 'ChuaCoc'");
            addColumnIfNotExists("khach_san",       "ti_le_coc",          "DECIMAL(5,2) DEFAULT 30.00");
            addColumnIfNotExists("khach_san",       "mo_ta",              "NVARCHAR(MAX)");
            addColumnIfNotExists("khach_san",       "hinh_anh_bia",       "NVARCHAR(MAX)");
            addColumnIfNotExists("khach_san",       "vi_do",             "FLOAT NULL");
            addColumnIfNotExists("khach_san",       "kinh_do",           "FLOAT NULL");
            addColumnIfNotExists("phong",           "tang",               "INT");
            addColumnIfNotExists("phong",           "so_phong",           "NVARCHAR(20)");
            addColumnIfNotExists("phong",           "mo_ta",              "NVARCHAR(MAX)");
            makeColumnNullable("phieu_dat_phong", "ma_dat_phong", "NVARCHAR(50)");
            log.info("=== DbMigrationRunner: Hoàn tất ===");
        } catch (Exception e) {
            log.error("DbMigrationRunner gặp lỗi: {}", e.getMessage());
        }
    }

    private void dropTriggerIfExists(String triggerName) {
        try {
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM sys.triggers WHERE name = ?",
                    Integer.class, triggerName);
            if (count != null && count > 0) {
                jdbc.execute("DROP TRIGGER " + triggerName);
                log.info("Đã xóa trigger: {}", triggerName);
            } else {
                log.info("Trigger {} không tồn tại, bỏ qua.", triggerName);
            }
        } catch (Exception e) {
            log.warn("Không xóa được trigger {}: {}", triggerName, e.getMessage());
        }
    }

    private void addColumnIfNotExists(String table, String column, String definition) {
        try {
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(?) AND name = ?",
                    Integer.class, table, column);
            if (count != null && count == 0) {
                jdbc.execute("ALTER TABLE " + table + " ADD " + column + " " + definition);
                log.info("Đã thêm cột: {}.{}", table, column);
            }
        } catch (Exception e) {
            log.warn("Không thêm được cột {}.{}: {}", table, column, e.getMessage());
        }
    }

    private void makeColumnNullable(String table, String column, String type) {
        try {
            Integer notNullCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                            "WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND IS_NULLABLE = 'NO'",
                    Integer.class, table, column);
            if (notNullCount != null && notNullCount > 0) {
                jdbc.execute("ALTER TABLE " + table + " ALTER COLUMN " + column + " " + type + " NULL");
                log.info("Đã cho phép NULL: {}.{}", table, column);
            }
        } catch (Exception e) {
            log.warn("Không thể alter column {}.{}: {}", table, column, e.getMessage());
        }
    }
}
