using BE_PetWeb_API.DTOs.Auth;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly PetWebContext _context;
        private readonly IConfiguration _configuration;
        private readonly IDateTimeService _dateTimeService;

        public AuthService(PetWebContext context, IConfiguration configuration, IDateTimeService dateTimeService)
        {
            _context = context;
            _configuration = configuration;
            _dateTimeService = dateTimeService;
        }

        public async Task<AuthResponseDto> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.Username))
                throw new Exception("Username already exists");

            if (await EmailExists(registerDto.Email))
                throw new Exception("Email already exists");

            CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                Phone = registerDto.Phone,
                Address = registerDto.Address,
                // Sử dụng HMACSHA256 thay vì HMACSHA512 để giảm kích thước
                Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt),
                Role = "Customer",
                CreatedAt = _dateTimeService.Now,
                UpdatedAt = _dateTimeService.Now,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = await CreateToken(user);

            // Get StaffId if user is a staff member (usually not for registration, but included for consistency)
            int? staffId = null;
            if (user.Role == "Staff")
            {
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == user.UserId);
                staffId = staff?.StaffId;
            }

            return new AuthResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                Token = token,
                StaffId = staffId
            };
        }

        public async Task<AuthResponseDto> Login(LoginDto loginDto)
        {
            // Tìm user theo username hoặc email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.UsernameOrEmail ||
                                         u.Email == loginDto.UsernameOrEmail);

            if (user == null)
                throw new Exception("Không tìm thấy tài khoản");

            bool passwordValid = false;

            // Trường hợp đặc biệt cho tài khoản admin
            if (user.Username == "admin")
            {
                // Kiểm tra nếu mật khẩu chưa được mã hóa (không có dấu ":")
                if (!user.Password.Contains(":"))
                {
                    // So sánh trực tiếp mật khẩu
                    passwordValid = user.Password == loginDto.Password;

                    // Nếu đăng nhập thành công với mật khẩu chưa mã hóa, tiến hành mã hóa lại
                    if (passwordValid)
                    {
                        CreatePasswordHash(loginDto.Password, out byte[] passwordHash, out byte[] passwordSalt);
                        user.Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt);
                        user.UpdatedAt = _dateTimeService.Now;
                        await _context.SaveChangesAsync();
                    }
                }
                else
                {
                    // Trường hợp mật khẩu đã được mã hóa, sử dụng phương thức kiểm tra thông thường
                    passwordValid = VerifyPasswordHash(loginDto.Password, user.Password);
                }
            }
            else
            {
                // Các tài khoản khác vẫn sử dụng phương thức kiểm tra thông thường
                passwordValid = VerifyPasswordHash(loginDto.Password, user.Password);
            }

            if (!passwordValid)
                throw new Exception("Sai mật khẩu");

            var token = await CreateToken(user);

            // Get StaffId if user is a staff member
            int? staffId = null;
            if (user.Role == "Staff")
            {
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == user.UserId);
                staffId = staff?.StaffId;
            }

            return new AuthResponseDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                Token = token,
                StaffId = staffId
            };
        }

        public async Task<AuthResponseDto> ExternalLogin(ExternalAuthDto externalAuth)
        {
            // Xác thực token từ Google (trong thực tế cần xác thực token này với Google API)
            if (externalAuth.Provider.ToLower() == "google")
            {
                // Log thông tin đăng nhập từ Google
                Console.WriteLine($"Google login attempt - Email: {externalAuth.Email}, Name: {externalAuth.Name}");

                // Tìm user theo email
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == externalAuth.Email.ToLower());

                if (user == null)
                {
                    // Tạo tài khoản mới nếu chưa tồn tại
                    var newUsername = externalAuth.Email.Split('@')[0] + "_google";
                    int counter = 1;

                    // Đảm bảo username không trùng lặp
                    while (await UserExists(newUsername))
                    {
                        newUsername = externalAuth.Email.Split('@')[0] + "_google" + counter;
                        counter++;
                    }

                    // Tạo mật khẩu ngẫu nhiên
                    var randomPassword = GenerateRandomPassword(12);
                    CreatePasswordHash(randomPassword, out byte[] passwordHash, out byte[] passwordSalt);

                    user = new User
                    {
                        Username = newUsername,
                        Email = externalAuth.Email,
                        FullName = externalAuth.Name ?? externalAuth.Email.Split('@')[0],
                        Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt),
                        Role = "Customer",
                        CreatedAt = _dateTimeService.Now,
                        UpdatedAt = _dateTimeService.Now,
                        IsActive = true,
                        // Thêm ảnh đại diện nếu có
                        Avatar = externalAuth.Picture
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    Console.WriteLine($"Created new user from Google login - Username: {user.Username}, Email: {user.Email}");
                }
                else
                {
                    Console.WriteLine($"Found existing user for Google login - Username: {user.Username}, Email: {user.Email}");
                }

                // Tạo JWT token
                var token = await CreateToken(user);

                // Get StaffId if user is a staff member
                int? staffId = null;
                if (user.Role == "Staff")
                {
                    var staff = await _context.Staff.FirstOrDefaultAsync(s => s.UserId == user.UserId);
                    staffId = staff?.StaffId;
                }

                return new AuthResponseDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    Token = token,
                    StaffId = staffId
                };
            }

            throw new Exception("Không hỗ trợ provider này");
        }

        public async Task<string> CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("JWT:Key").Value));

            // Thay đổi từ HmacSha512Signature sang HmacSha256Signature để phù hợp với kích thước khóa
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = _dateTimeService.Now.AddDays(1),
                SigningCredentials = creds,
                Issuer = _configuration["JWT:Issuer"],
                Audience = _configuration["JWT:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task<bool> ChangePassword(int userId, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            // Kiểm tra mật khẩu hiện tại
            bool passwordValid = VerifyPasswordHash(currentPassword, user.Password);
            if (!passwordValid)
                throw new Exception("Current password is incorrect");

            // Tạo mật khẩu mới
            CreatePasswordHash(newPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt);
            user.UpdatedAt = _dateTimeService.Now;

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(x => x.Username.ToLower() == username.ToLower());
        }

        private async Task<bool> EmailExists(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email.ToLower() == email.ToLower());
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            // Sử dụng HMACSHA256 thay vì HMACSHA512 để giảm kích thước
            using (var hmac = new HMACSHA256())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, string storedPassword)
        {
            var parts = storedPassword.Split(':');
            if (parts.Length != 2)
                return false;

            var passwordHash = Convert.FromBase64String(parts[0]);
            var passwordSalt = Convert.FromBase64String(parts[1]);

            // Sử dụng HMACSHA256 thay vì HMACSHA512 để phù hợp với hàm CreatePasswordHash
            using (var hmac = new HMACSHA256(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != passwordHash[i])
                        return false;
                }
            }

            return true;
        }

        // Hàm tạo mật khẩu ngẫu nhiên
        private string GenerateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}