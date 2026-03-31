package com.example.bookingkhachsan.util;

/**
 * Sửa tiêu đề thông báo đã bị lưu sai (VARCHAR / code page) thành chuỗi chuẩn tiếng Việt.
 * Chỉ áp dụng khi phát hiện ký tự thay thế (thường là '?').
 */
public final class NotificationTitleFix {

    public static final String TITLE_BOOKING_CONFIRMED = "Đơn đặt phòng đã được xác nhận";
    public static final String TITLE_BOOKING_REJECTED = "Đơn đặt phòng bị từ chối";
    public static final String TITLE_CHECKIN_OK = "Bạn đã Check-in thành công";
    public static final String TITLE_CHECKOUT_OK = "Bạn đã Check-out thành công";

    private NotificationTitleFix() {}

    /**
     * Trả về tiêu đề đã chuẩn hóa nếu nhận dạng được bản lỗi; không đổi nếu không chắc.
     */
    public static String repairIfNeeded(String tieuDe) {
        if (tieuDe == null || tieuDe.isBlank()) {
            return tieuDe;
        }
        if (!looksCorrupted(tieuDe)) {
            return tieuDe;
        }
        String t = tieuDe.trim();
        // Check-in / Check-out (Bạn → B?n)
        if (containsIgnoreCase(t, "check-in") && containsIgnoreCase(t, "thành công")) {
            return TITLE_CHECKIN_OK;
        }
        if (containsIgnoreCase(t, "check-out") && containsIgnoreCase(t, "thành công")) {
            return TITLE_CHECKOUT_OK;
        }
        // Đơn đặt phòng đã được xác nhận
        if ((containsIgnoreCase(t, "xác nhận") || t.contains("nh?n") || t.contains("nhận"))
                && (containsIgnoreCase(t, "phòng") || t.contains("phòng") || t.contains("d?t"))) {
            if (!containsIgnoreCase(t, "từ chối") && !t.contains("ch?i")) {
                return TITLE_BOOKING_CONFIRMED;
            }
        }
        if (containsIgnoreCase(t, "từ chối") || t.contains("ch?i") || containsIgnoreCase(t, "tu choi")) {
            return TITLE_BOOKING_REJECTED;
        }
        // Tiêu đề khuyến mãi / admin: "Gi?m giá" → "Giảm giá" (giữ phần sau nếu có)
        if (t.contains("Gi?m") || t.contains("gi?m")) {
            return t.replace("Gi?m", "Giảm").replace("gi?m", "giảm");
        }
        return tieuDe;
    }

    private static boolean looksCorrupted(String s) {
        return s.indexOf('?') >= 0
                || s.contains("B?n")
                || s.contains("Đon")
                || s.contains("d?t")
                || s.contains("du?c")
                || s.contains("nh?n")
                || s.contains("Gi?m")
                || s.contains("gi?m");
    }

    private static boolean containsIgnoreCase(String s, String sub) {
        return s.toLowerCase().contains(sub.toLowerCase());
    }
}
