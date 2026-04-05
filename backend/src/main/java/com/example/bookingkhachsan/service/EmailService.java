package com.example.bookingkhachsan.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Gửi email qua SMTP (Gmail). Cần {@code spring.mail.username/password} hợp lệ.
 * Khác hẳn thông báo chuông trong app ({@link com.example.bookingkhachsan.entity.SystemNotification}):
 * chuông gắn email tài khoản trong DB, không cần cấu hình Gmail để hiển thị.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    /** Chưa cấu hình MAIL_USERNAME thật (env) hoặc dùng placeholder mặc định. */
    private boolean isMailConfigured() {
        return fromEmail != null && !fromEmail.isBlank()
                && !"placeholder".equalsIgnoreCase(fromEmail.trim());
    }

    public void sendEmail(String to, String subject, String body) {
        if (!isMailConfigured()) {
            log.warn("Bo qua gui mail (chua cau hinh MAIL_USERNAME / Gmail SMTP): subject={}", subject);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    /**
     * Gửi email xác nhận đặt phòng (HTML) đến khách hàng.
     * Nhận tham số primitive để tránh LazyInitializationException khi @Async
     * chạy ở thread khác sau khi JPA transaction đã đóng.
     */
    @Async
    public void sendBookingConfirmationEmail(
            String toEmail,
            String hoTen,
            String maDatPhong,
            String tenKhachSan,
            String tenPhong,
            String ngayDen,
            String ngayDi,
            String thanhTien) {

        try {
            if (!isMailConfigured()) {
                log.warn("Booking {} - khong gui mail: chua cau hinh MAIL_USERNAME / Gmail SMTP (xem application.properties).",
                        maDatPhong);
                return;
            }
            if (toEmail == null || toEmail.isBlank()) {
                log.warn("Booking {} - khong co email khach hang, bo qua gui mail.", maDatPhong);
                return;
            }

            String subject = "✅ Xác nhận đặt phòng thành công - Mã: " + maDatPhong;

            String html = """
                    <!DOCTYPE html>
                    <html lang="vi">
                    <head><meta charset="UTF-8">
                    <style>
                      body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
                      .container { max-width:600px; margin:30px auto; background:#fff;
                                   border-radius:8px; overflow:hidden;
                                   box-shadow:0 2px 8px rgba(0,0,0,.1); }
                      .header { background:#1a73e8; color:#fff; padding:28px 32px; }
                      .header h1 { margin:0; font-size:22px; }
                      .body { padding:28px 32px; color:#333; }
                      .body p { margin:0 0 12px; line-height:1.6; }
                      .info-table { width:100%%; border-collapse:collapse; margin:16px 0; }
                      .info-table td { padding:10px 12px; border-bottom:1px solid #eee; font-size:15px; }
                      .info-table td:first-child { color:#555; width:45%%; }
                      .info-table td:last-child { font-weight:bold; color:#1a1a1a; }
                      .badge { display:inline-block; background:#e6f4ea; color:#137333;
                               border-radius:4px; padding:4px 12px; font-size:14px; }
                      .footer { background:#f8f8f8; text-align:center; padding:18px 32px;
                                color:#888; font-size:13px; border-top:1px solid #eee; }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                      <div class="header">
                        <h1>🏨 Đặt phòng thành công!</h1>
                      </div>
                      <div class="body">
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Chúng tôi xác nhận đặt phòng của bạn đã được <span class="badge">✔ Xác nhận</span></p>
                        <p>Chi tiết đặt phòng:</p>
                        <table class="info-table">
                          <tr><td>Mã đặt phòng</td><td>%s</td></tr>
                          <tr><td>Khách sạn</td><td>%s</td></tr>
                          <tr><td>Phòng</td><td>%s</td></tr>
                          <tr><td>Ngày nhận phòng</td><td>%s</td></tr>
                          <tr><td>Ngày trả phòng</td><td>%s</td></tr>
                          <tr><td>Tổng tiền</td><td style="color:#1a73e8">%s</td></tr>
                        </table>
                        <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
                        <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi! 🙏</p>
                      </div>
                      <div class="footer">
                        © 2025 Booking Khách Sạn &nbsp;|&nbsp; %s
                      </div>
                    </div>
                    </body>
                    </html>
                    """.formatted(hoTen, maDatPhong, tenKhachSan, tenPhong, ngayDen, ngayDi, thanhTien, fromEmail);

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(mime);
            log.info("Da gui email xac nhan dat phong {} den {}.", maDatPhong, toEmail);

        } catch (Exception e) {
            log.error("Loi gui email xac nhan dat phong {}: {}", maDatPhong, e.getMessage(), e);
        }
    }
}
