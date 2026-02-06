using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly PetWebContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public PasswordResetService(
            PetWebContext context,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _jwtKey = _configuration["JWT:Key"];
            _jwtIssuer = _configuration["JWT:Issuer"];
            _jwtAudience = _configuration["JWT:Audience"];
        }

        public async Task<string> GeneratePasswordResetToken(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng với email này");
            }

            // Tạo token JWT với thông tin cần thiết
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtKey);

            // Tạo một ID duy nhất cho token
            string jti = Guid.NewGuid().ToString();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim("UserId", user.UserId.ToString()),
                    new Claim("TokenType", "PasswordReset"),
                    new Claim(JwtRegisteredClaimNames.Jti, jti)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _jwtIssuer,
                Audience = _jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<bool> ResetPassword(string email, string token, string newPassword)
        {
            // Xác thực token JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtKey);

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                ClaimsPrincipal principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                // Kiểm tra các claims trong token
                var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;
                var tokenTypeClaim = principal.FindFirst("TokenType")?.Value;
                var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

                if (emailClaim != email || tokenTypeClaim != "PasswordReset")
                {
                    throw new Exception("Token không hợp lệ");
                }

                // Kiểm tra xem token đã được sử dụng chưa
                if (TokenStore.IsTokenUsed(jti))
                {
                    throw new Exception("Token đã được sử dụng");
                }

                // Tìm và cập nhật user
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    throw new Exception("Không tìm thấy người dùng với email này");
                }

                // Đặt lại mật khẩu - sử dụng HMACSHA256 giống AuthService
                CreatePasswordHash(newPassword, out byte[] passwordHash, out byte[] passwordSalt);
                user.Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt);
                user.UpdatedAt = DateTime.Now;

                // Đánh dấu token đã được sử dụng
                TokenStore.AddUsedToken(jti, ((JwtSecurityToken)validatedToken).ValidTo);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (SecurityTokenExpiredException)
            {
                throw new Exception("Token đã hết hạn");
            }
            catch (SecurityTokenException ex)
            {
                throw new Exception($"Token không hợp lệ: {ex.Message}");
            }
        }

        public async Task SendPasswordResetEmail(string email, string resetToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng với email này");
            }

            // Lấy base URL từ cấu hình
            string baseUrl = _configuration["AppSettings:BaseUrl"];
            string resetUrl = $"{baseUrl}reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(email)}";

            string subject = "Đặt lại mật khẩu PetWeb";
            string body = $@"
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 10px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
                    .button {{ background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Đặt lại mật khẩu</h2>
                    </div>
                    <div class='content'>
                        <p>Xin chào {user.FullName},</p>
                        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
                        <p><a href='{resetUrl}' class='button'>Đặt lại mật khẩu</a></p>
                        <p>Hoặc bạn có thể sao chép và dán liên kết sau vào trình duyệt: {resetUrl}</p>
                        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
                        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <p>Trân trọng,<br/>Đội ngũ PetWeb</p>
                    </div>
                    <div class='footer'>
                        <p>© {DateTime.Now.Year} Pet Web Services. Tất cả các quyền được bảo lưu.</p>
                        <p>Đây là email tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>";

            await _emailService.SendEmailAsync(email, subject, body);
        }

        public async Task<bool> GenerateAndSendOtp(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng với email này");
            }

            // Tạo OTP 6 chữ số
            var otp = GenerateOtp();

            // Tạo token JWT có chứa OTP
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtKey);

            // Tạo một ID duy nhất cho token
            string jti = Guid.NewGuid().ToString();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Email, email),
                    new Claim("UserId", user.UserId.ToString()),
                    new Claim("Otp", otp),
                    new Claim("TokenType", "Otp"),
                    new Claim(JwtRegisteredClaimNames.Jti, jti)
                }),
                Expires = DateTime.UtcNow.AddMinutes(10),
                Issuer = _jwtIssuer,
                Audience = _jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);

            // Lưu token vào store để kiểm tra sau này
            TokenStore.StoreOtp(email, jwtToken);

            // Gửi OTP qua email
            string subject = "Mã xác thực OTP - PetWeb";
            string body = $@"
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 10px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #777; }}
                    .otp {{ font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background-color: #f0f0f0; margin: 20px 0; border-radius: 4px; letter-spacing: 5px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Mã xác thực OTP</h2>
                    </div>
                    <div class='content'>
                        <p>Xin chào {user.FullName},</p>
                        <p>Đây là mã xác thực OTP của bạn:</p>
                        <div class='otp'>{otp}</div>
                        <p>Mã này sẽ hết hạn sau 10 phút.</p>
                        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                        <p>Trân trọng,<br/>Đội ngũ PetWeb</p>
                    </div>
                    <div class='footer'>
                        <p>© {DateTime.Now.Year} Pet Web Services. Tất cả các quyền được bảo lưu.</p>
                        <p>Đây là email tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>";

            await _emailService.SendEmailAsync(email, subject, body);
            return true;
        }

        public async Task<bool> VerifyOtp(string email, string otp)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng với email này");
            }

            // Lấy token JWT từ store
            string jwtToken = TokenStore.GetOtpToken(email);
            if (string.IsNullOrEmpty(jwtToken))
            {
                throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn");
            }

            // Xác thực token JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtKey);

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                ClaimsPrincipal principal = tokenHandler.ValidateToken(jwtToken, validationParameters, out SecurityToken validatedToken);

                // Kiểm tra các claims trong token
                var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;
                var otpClaim = principal.FindFirst("Otp")?.Value;
                var tokenTypeClaim = principal.FindFirst("TokenType")?.Value;
                var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

                if (emailClaim != email || otpClaim != otp || tokenTypeClaim != "Otp")
                {
                    throw new Exception("Mã OTP không hợp lệ");
                }

                // Kiểm tra xem token đã được sử dụng chưa
                if (TokenStore.IsTokenUsed(jti))
                {
                    throw new Exception("Mã OTP đã được sử dụng");
                }

                return true;
            }
            catch (SecurityTokenExpiredException)
            {
                throw new Exception("Mã OTP đã hết hạn");
            }
            catch (SecurityTokenException ex)
            {
                throw new Exception($"Mã OTP không hợp lệ: {ex.Message}");
            }
        }

        public async Task<bool> ResetPasswordWithOtp(string email, string otp, string newPassword)
        {
            // Xác thực OTP trước
            await VerifyOtp(email, otp);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            // Lấy token JWT từ store
            string jwtToken = TokenStore.GetOtpToken(email);
            if (string.IsNullOrEmpty(jwtToken))
            {
                throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn");
            }

            // Lấy JTI từ token
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(jwtToken) as JwtSecurityToken;
            var jti = jsonToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Jti).Value;

            // Đánh dấu token đã sử dụng
            TokenStore.AddUsedToken(jti, jsonToken.ValidTo);

            // Đặt lại mật khẩu - sử dụng HMACSHA256 giống AuthService
            CreatePasswordHash(newPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt);
            user.UpdatedAt = DateTime.Now;

            // Xóa OTP đã sử dụng
            TokenStore.RemoveOtp(email);

            await _context.SaveChangesAsync();
            return true;
        }

        #region Helper Methods
        private string GenerateOtp()
        {
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        // Thêm hàm CreatePasswordHash giống như trong AuthService
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA256())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }
        #endregion
    }
}