using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminSetupController : ControllerBase
    {
        private readonly PetWebContext _context;
        private readonly IDateTimeService _dateTimeService;

        public AdminSetupController(PetWebContext context, IDateTimeService dateTimeService)
        {
            _context = context;
            _dateTimeService = dateTimeService;
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            try
            {
                // Kiểm tra xem đã có admin chưa
                var existingAdmin = await _context.Users
                    .FirstOrDefaultAsync(u => u.Role == "Admin");

                if (existingAdmin != null)
                {
                    return BadRequest(new { message = "Tài khoản admin đã tồn tại!" });
                }

                // Tạo mật khẩu mã hóa
                CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);
                string hashedPassword = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt);

                // Tạo tài khoản admin
                var admin = new User
                {
                    Username = request.Username ?? "admin",
                    Email = request.Email ?? "admin@petservice.com",
                    Password = hashedPassword,
                    FullName = request.FullName ?? "Administrator",
                    Phone = request.Phone ?? "0123456789",
                    Address = request.Address ?? "Việt Nam",
                    Avatar = "default-avatar.png",
                    Role = "Admin",
                    CreatedAt = _dateTimeService.Now,
                    UpdatedAt = _dateTimeService.Now,
                    IsActive = true
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Tạo tài khoản admin thành công!",
                    username = admin.Username,
                    email = admin.Email,
                    fullName = admin.FullName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpPost("create-admin-simple")]
        public async Task<IActionResult> CreateAdminSimple()
        {
            try
            {
                // Kiểm tra xem đã có admin chưa
                var existingAdmin = await _context.Users
                    .FirstOrDefaultAsync(u => u.Role == "Admin");

                if (existingAdmin != null)
                {
                    return BadRequest(new { message = "Tài khoản admin đã tồn tại!" });
                }

                // Tạo admin với thông tin mặc định
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@petservice.com",
                    Password = "admin123", // Plain text - sẽ được mã hóa khi đăng nhập lần đầu
                    FullName = "Administrator",
                    Phone = "0123456789",
                    Address = "Việt Nam",
                    Avatar = "default-avatar.png",
                    Role = "Admin",
                    CreatedAt = _dateTimeService.Now,
                    UpdatedAt = _dateTimeService.Now,
                    IsActive = true
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Tạo tài khoản admin thành công!",
                    username = "admin",
                    password = "admin123",
                    note = "Mật khẩu sẽ được mã hóa tự động khi đăng nhập lần đầu"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet("check-admin")]
        public async Task<IActionResult> CheckAdmin()
        {
            var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
            var adminExists = adminCount > 0;

            if (adminExists)
            {
                var admin = await _context.Users
                    .Where(u => u.Role == "Admin")
                    .Select(u => new { u.Username, u.Email, u.FullName, u.IsActive })
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    exists = true,
                    admin = admin
                });
            }

            return Ok(new { exists = false });
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA256())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }
    }

    public class CreateAdminRequest
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string Password { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
} 