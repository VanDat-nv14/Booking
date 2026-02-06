using BE_PetWeb_API.Services.Interfaces;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BE_PetWeb_API.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _baseUrl;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Load email settings from configuration
            _smtpServer = _configuration["EmailSettings:SmtpServer"];
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
            _smtpUsername = _configuration["EmailSettings:Username"];
            _smtpPassword = _configuration["EmailSettings:Password"];
            _fromEmail = _configuration["EmailSettings:FromEmail"];
            _fromName = _configuration["EmailSettings:FromName"];
            _baseUrl = _configuration["AppSettings:BaseUrl"];
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                using (var client = new SmtpClient(_smtpServer, _smtpPort))
                {
                    client.EnableSsl = true;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);

                    using (var message = new MailMessage())
                    {
                        message.From = new MailAddress(_fromEmail, _fromName);
                        message.To.Add(to);
                        message.Subject = subject;
                        message.Body = body;
                        message.IsBodyHtml = isHtml;

                        await client.SendMailAsync(message);
                        _logger.LogInformation($"Email sent successfully to {to}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send email to {to}. Error: {ex.Message}");
                throw new Exception($"Failed to send email: {ex.Message}");
            }
        }

        public async Task SendAppointmentConfirmationEmail(string email, string userName, DateTime appointmentDate, string serviceName, string staffName, int appointmentId)
        {
            string subject = "Xác nhận đặt lịch hẹn thành công";

            string body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #4CAF50; color: white; padding: 10px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
                        .button {{ background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Xác nhận đặt lịch hẹn</h2>
                        </div>
                        <div class='content'>
                            <p>Xin chào {userName},</p>
                            <p>Cảm ơn bạn đã đặt lịch hẹn tại dịch vụ thú cưng của chúng tôi. Dưới đây là thông tin chi tiết về lịch hẹn của bạn:</p>
                            <ul>
                                <li><strong>Dịch vụ:</strong> {serviceName}</li>
                                <li><strong>Ngày và giờ:</strong> {appointmentDate.ToString("dd/MM/yyyy HH:mm")}</li>
                                <li><strong>Nhân viên phụ trách:</strong> {staffName ?? "Chưa phân công"}</li>
                                <li><strong>Mã lịch hẹn:</strong> #{appointmentId}</li>
                            </ul>
                            <p>Vui lòng đến trước 10 phút so với giờ hẹn để làm thủ tục.</p>
                            <p>Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng thực hiện trước ít nhất 2 giờ so với thời gian hẹn.</p>
                            <p>
                                <a href='{_baseUrl}/appointments/{appointmentId}' class='button'>Xem chi tiết lịch hẹn</a>
                            </p>
                            <p>Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi!</p>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Pet Web Services. Tất cả các quyền được bảo lưu.</p>
                            <p>Đây là email tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendAppointmentUpdateEmail(string email, string userName, DateTime appointmentDate, string serviceName, string staffName, int appointmentId, string status)
        {
            string subject = "Thông báo cập nhật lịch hẹn";

            string statusMessage = "";
            switch (status)
            {
                case "Confirmed":
                    statusMessage = "Lịch hẹn của bạn đã được xác nhận";
                    break;
                case "Completed":
                    statusMessage = "Lịch hẹn của bạn đã hoàn thành";
                    break;
                case "In-Progress":
                    statusMessage = "Lịch hẹn của bạn đang được thực hiện";
                    break;
                default:
                    statusMessage = $"Trạng thái lịch hẹn của bạn đã được cập nhật thành {status}";
                    break;
            }

            string body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #2196F3; color: white; padding: 10px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
                        .button {{ background-color: #2196F3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Cập nhật lịch hẹn</h2>
                        </div>
                        <div class='content'>
                            <p>Xin chào {userName},</p>
                            <p><strong>{statusMessage}</strong></p>
                            <p>Thông tin chi tiết về lịch hẹn của bạn:</p>
                            <ul>
                                <li><strong>Dịch vụ:</strong> {serviceName}</li>
                                <li><strong>Ngày và giờ:</strong> {appointmentDate.ToString("dd/MM/yyyy HH:mm")}</li>
                                <li><strong>Nhân viên phụ trách:</strong> {staffName ?? "Chưa phân công"}</li>
                                <li><strong>Mã lịch hẹn:</strong> #{appointmentId}</li>
                                <li><strong>Trạng thái:</strong> {status}</li>
                            </ul>
                            <p>
                                <a href='{_baseUrl}/appointments/{appointmentId}' class='button'>Xem chi tiết lịch hẹn</a>
                            </p>
                            <p>Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi!</p>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Pet Web Services. Tất cả các quyền được bảo lưu.</p>
                            <p>Đây là email tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendAppointmentCancellationEmail(string email, string userName, DateTime appointmentDate, string serviceName, int appointmentId, string reason = null)
        {
            string subject = "Thông báo hủy lịch hẹn";

            string body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #F44336; color: white; padding: 10px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Thông báo hủy lịch hẹn</h2>
                        </div>
                        <div class='content'>
                            <p>Xin chào {userName},</p>
                            <p>Lịch hẹn của bạn đã bị hủy. Dưới đây là thông tin chi tiết:</p>
                            <ul>
                                <li><strong>Dịch vụ:</strong> {serviceName}</li>
                                <li><strong>Ngày và giờ:</strong> {appointmentDate.ToString("dd/MM/yyyy HH:mm")}</li>
                                <li><strong>Mã lịch hẹn:</strong> #{appointmentId}</li>
                            </ul>
                            {(!string.IsNullOrEmpty(reason) ? $"<p><strong>Lý do hủy:</strong> {reason}</p>" : "")}
                            <p>Nếu bạn muốn đặt lại lịch hẹn, vui lòng truy cập website hoặc liên hệ với chúng tôi.</p>
                            <p>Cảm ơn bạn đã quan tâm đến dịch vụ của chúng tôi!</p>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Pet Web Services. Tất cả các quyền được bảo lưu.</p>
                            <p>Đây là email tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(email, subject, body);
        }
    }
}