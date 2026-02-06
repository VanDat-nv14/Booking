using BE_PetWeb_API.Models;
using BE_PetWeb_API.DTOs.Users;
using BE_PetWeb_API.DTOs.Notification;
using BE_PetWeb_API.Services.Interfaces;
using BE_PetWeb_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly PetWebContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UsersController> _logger;
        private readonly IDateTimeService _dateTimeService;
        private readonly IFirebaseMessagingService _firebaseMessagingService;

        public UsersController(
            PetWebContext context,
            IWebHostEnvironment environment,
            ILogger<UsersController> logger,
            IDateTimeService dateTimeService,
            IFirebaseMessagingService firebaseMessagingService)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
            _dateTimeService = dateTimeService;
            _firebaseMessagingService = firebaseMessagingService;
        }

        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            try
            {
                _logger.LogInformation("Lấy danh sách người dùng");

                var users = await _context.Users
                    .Select(u => new
                    {
                        userId = u.UserId,
                        username = u.Username,
                        email = u.Email,
                        fullName = u.FullName,
                        phone = u.Phone,
                        address = u.Address,
                        avatar = u.Avatar,
                        role = u.Role,
                        isActive = u.IsActive,
                        createdAt = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách người dùng");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // GET: api/Users/public (Không cần Admin role)
        [HttpGet("public")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetUsersPublic()
        {
            try
            {
                _logger.LogInformation("Lấy danh sách người dùng");

                var users = await _context.Users
                    .Select(u => new
                    {
                        userId = u.UserId,
                        username = u.Username,
                        email = u.Email,
                        fullName = u.FullName,
                        phone = u.Phone,
                        address = u.Address,
                        avatar = u.Avatar,
                        role = u.Role,
                        isActive = u.IsActive,
                        createdAt = u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách người dùng");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            try
            {
                _logger.LogInformation($"Lấy thông tin người dùng ID: {id}");

                // Kiểm tra quyền truy cập
                bool isAdmin = User.IsInRole("Admin");
                if (!isAdmin && !UserOwnsResource(id))
                {
                    _logger.LogWarning($"Từ chối truy cập - Người dùng không có quyền");
                    return Forbid("Bạn không có quyền xem thông tin của người dùng khác");
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {id}");
                    return NotFound("Không tìm thấy người dùng");
                }

                return Ok(new
                {
                    userId = user.UserId,
                    username = user.Username,
                    email = user.Email,
                    fullName = user.FullName,
                    phone = user.Phone,
                    address = user.Address,
                    avatar = user.Avatar,
                    role = user.Role,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin người dùng ID: {id}");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // PUT: api/Users/5
        // PUT: api/Users/5/profile - Update profile without Role and Avatar
        [HttpPut("{id}/profile")]
        [Authorize]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromForm] UserProfileUpdateDto userDto)
        {
            try
            {
                // Log thông tin nhận được
                _logger.LogInformation($"Bắt đầu cập nhật profile người dùng ID: {id}");

                // Loại bỏ validation cho Avatar và Role
                ModelState.Remove("Avatar");
                ModelState.Remove("Role");

                // Kiểm tra validation
                if (!ModelState.IsValid)
                {
                    // Log chi tiết các lỗi validation
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new {
                            Field = x.Key,
                            Errors = x.Value.Errors.Select(e => e.ErrorMessage)
                        })
                        .ToList();

                    _logger.LogWarning($"Lỗi validation: {System.Text.Json.JsonSerializer.Serialize(errors)}");

                    return BadRequest(new
                    {
                        message = "Dữ liệu không hợp lệ",
                        errors = errors
                    });
                }

                // Kiểm tra quyền truy cập
                bool isAdmin = User.IsInRole("Admin");
                if (!isAdmin && !UserOwnsResource(id))
                {
                    _logger.LogWarning($"Từ chối cập nhật - Người dùng không có quyền");
                    return Forbid("Bạn không có quyền cập nhật thông tin của người dùng khác");
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {id}");
                    return NotFound("Không tìm thấy người dùng");
                }

                // Cập nhật thông tin bắt buộc
                user.Email = userDto.Email;
                user.FullName = userDto.FullName;

                // Cập nhật thông tin không bắt buộc
                if (!string.IsNullOrWhiteSpace(userDto.Phone))
                    user.Phone = userDto.Phone;

                if (!string.IsNullOrWhiteSpace(userDto.Address))
                    user.Address = userDto.Address;

                // Đặt role mặc định cho user thường nếu chưa có
                if (string.IsNullOrWhiteSpace(user.Role))
                {
                    user.Role = "Customer";
                }

                // Cập nhật thời gian
                user.UpdatedAt = _dateTimeService.Now;

                // Sửa lỗi cập nhật CreatedAt
                var entry = _context.Entry(user);
                entry.Property(u => u.Email).IsModified = true;
                entry.Property(u => u.FullName).IsModified = true;
                entry.Property(u => u.Phone).IsModified = !string.IsNullOrWhiteSpace(userDto.Phone);
                entry.Property(u => u.Address).IsModified = !string.IsNullOrWhiteSpace(userDto.Address);
                entry.Property(u => u.Role).IsModified = string.IsNullOrWhiteSpace(user.Role);
                entry.Property(u => u.UpdatedAt).IsModified = true;
                // Đảm bảo CreatedAt không bị thay đổi
                entry.Property(u => u.CreatedAt).IsModified = false;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cập nhật profile người dùng {id} thành công");

                // Trả về thông tin người dùng đã cập nhật
                return Ok(new
                {
                    userId = user.UserId,
                    username = user.Username,
                    email = user.Email,
                    fullName = user.FullName,
                    phone = user.Phone,
                    address = user.Address,
                    role = user.Role,
                    avatar = user.Avatar,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt,
                    updatedAt = user.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật profile người dùng {id}");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, [FromForm] UserProfileUpdateDto userDto)
        {
            try
            {
                // Log thông tin nhận được
                _logger.LogInformation($"Bắt đầu cập nhật người dùng ID: {id}");

                // Loại bỏ validation cho Avatar và Role trước khi kiểm tra
                ModelState.Remove("Avatar");
                ModelState.Remove("Role");

                // Kiểm tra validation
                if (!ModelState.IsValid)
                {
                    // Log chi tiết các lỗi validation
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new {
                            Field = x.Key,
                            Errors = x.Value.Errors.Select(e => e.ErrorMessage)
                        })
                        .ToList();

                    _logger.LogWarning($"Lỗi validation: {System.Text.Json.JsonSerializer.Serialize(errors)}");

                    return BadRequest(new
                    {
                        message = "Dữ liệu không hợp lệ",
                        errors = errors
                    });
                }

                // Kiểm tra quyền truy cập
                bool isAdmin = User.IsInRole("Admin");
                if (!isAdmin && !UserOwnsResource(id))
                {
                    _logger.LogWarning($"Từ chối cập nhật - Người dùng không có quyền");
                    return Forbid("Bạn không có quyền cập nhật thông tin của người dùng khác");
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {id}");
                    return NotFound("Không tìm thấy người dùng");
                }

                // Cập nhật thông tin bắt buộc
                user.Email = userDto.Email;
                user.FullName = userDto.FullName;

                // Cập nhật thông tin không bắt buộc
                if (!string.IsNullOrWhiteSpace(userDto.Phone))
                    user.Phone = userDto.Phone;

                if (!string.IsNullOrWhiteSpace(userDto.Address))
                    user.Address = userDto.Address;

                // Chỉ admin mới được thay đổi role và trạng thái
                if (isAdmin && !string.IsNullOrWhiteSpace(userDto.Role))
                {
                    user.Role = userDto.Role;
                }
                else if (!isAdmin && string.IsNullOrWhiteSpace(user.Role))
                {
                    // Đặt role mặc định cho user thường nếu chưa có
                    user.Role = "Customer";
                }

                if (isAdmin && userDto.IsActive.HasValue)
                {
                    user.IsActive = userDto.IsActive.Value;
                }

                // Xử lý avatar - chỉ khi có file được upload
                if (userDto.Avatar != null && userDto.Avatar.Length > 0)
                {
                    try
                    {
                        // Xóa avatar cũ
                        if (!string.IsNullOrEmpty(user.Avatar) && user.Avatar != "default-avatar.png")
                        {
                            var oldAvatarPath = Path.Combine(_environment.WebRootPath, "uploads", "avatars", Path.GetFileName(user.Avatar));
                            if (System.IO.File.Exists(oldAvatarPath))
                            {
                                System.IO.File.Delete(oldAvatarPath);
                            }
                        }

                        // Tạo thư mục uploads nếu chưa tồn tại
                        string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "avatars");
                        Directory.CreateDirectory(uploadsFolder);

                        // Tạo tên file duy nhất
                        string uniqueFileName = $"{Guid.NewGuid()}_{userDto.Avatar.FileName}";
                        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        // Lưu file
                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await userDto.Avatar.CopyToAsync(fileStream);
                        }

                        // Cập nhật đường dẫn avatar
                        user.Avatar = $"/uploads/avatars/{uniqueFileName}";
                        _logger.LogInformation($"Đã tải lên avatar mới: {uniqueFileName}");
                    }
                    catch (Exception avatarEx)
                    {
                        _logger.LogError(avatarEx, "Lỗi khi xử lý avatar");
                        // Không ném lỗi để vẫn cập nhật được thông tin khác
                    }
                }
                else
                {
                    // Nếu không có avatar mới, giữ nguyên avatar cũ hoặc để null
                    _logger.LogInformation("Không có avatar mới được upload, giữ nguyên avatar hiện tại");
                }

                // Cập nhật thời gian
                user.UpdatedAt = _dateTimeService.Now;

                // Sửa lỗi cập nhật CreatedAt
                var entry = _context.Entry(user);
                entry.Property(u => u.Email).IsModified = true;
                entry.Property(u => u.FullName).IsModified = true;
                entry.Property(u => u.Phone).IsModified = !string.IsNullOrWhiteSpace(userDto.Phone);
                entry.Property(u => u.Address).IsModified = !string.IsNullOrWhiteSpace(userDto.Address);
                entry.Property(u => u.Avatar).IsModified = userDto.Avatar != null && userDto.Avatar.Length > 0;
                entry.Property(u => u.Role).IsModified = isAdmin && userDto.Role != null;
                entry.Property(u => u.IsActive).IsModified = isAdmin && userDto.IsActive.HasValue;
                entry.Property(u => u.UpdatedAt).IsModified = true;
                // Đảm bảo CreatedAt không bị thay đổi
                entry.Property(u => u.CreatedAt).IsModified = false;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cập nhật người dùng {id} thành công");

                // Trả về thông tin người dùng đã cập nhật
                return Ok(new
                {
                    userId = user.UserId,
                    username = user.Username,
                    email = user.Email,
                    fullName = user.FullName,
                    phone = user.Phone,
                    address = user.Address,
                    avatar = user.Avatar,
                    role = user.Role,
                    isActive = user.IsActive
                });
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết
                _logger.LogError(ex, $"Lỗi khi cập nhật người dùng {id}");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // POST: api/Users/5/change-password
        [HttpPost("{id}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto passwordDto)
        {
            try
            {
                _logger.LogInformation($"Bắt đầu đổi mật khẩu cho người dùng ID: {id}");

                // Kiểm tra quyền truy cập
                if (!UserOwnsResource(id))
                {
                    _logger.LogWarning($"Từ chối đổi mật khẩu - Người dùng không có quyền");
                    return Forbid("Bạn không có quyền đổi mật khẩu của người dùng khác");
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {id}");
                    return NotFound("Không tìm thấy người dùng");
                }

                // Kiểm tra mật khẩu hiện tại
                bool passwordValid = VerifyPasswordHash(passwordDto.CurrentPassword, user.Password);
                if (!passwordValid)
                {
                    _logger.LogWarning($"Đổi mật khẩu thất bại - Mật khẩu hiện tại không đúng");
                    return BadRequest("Mật khẩu hiện tại không đúng");
                }

                // Tạo mật khẩu mới
                CreatePasswordHash(passwordDto.NewPassword, out byte[] passwordHash, out byte[] passwordSalt);
                user.Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt);
                user.UpdatedAt = _dateTimeService.Now;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đổi mật khẩu cho người dùng {id} thành công");
                return Ok(new { message = "Đổi mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi đổi mật khẩu cho người dùng {id}");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // PATCH: api/Users/5/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] StatusUpdateDto statusDto)
        {
            try
            {
                _logger.LogInformation($"Cập nhật trạng thái người dùng ID: {id}");

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {id}");
                    return NotFound("Không tìm thấy người dùng");
                }

                user.IsActive = statusDto.IsActive;
                user.UpdatedAt = _dateTimeService.Now;

                _context.Entry(user).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Cập nhật trạng thái người dùng {id} thành công");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật trạng thái người dùng {id}");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                _logger.LogInformation($"Bắt đầu xóa người dùng ID: {id}");

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    _logger.LogWarning($"Không tìm thấy người dùng ID: {id}");
                    return NotFound("Không tìm thấy người dùng");
                }

                // Không xóa tài khoản admin mặc định
                if (user.Role == "Admin" && user.Username == "admin")
                {
                    _logger.LogWarning("Từ chối xóa tài khoản admin mặc định");
                    return BadRequest("Không thể xóa tài khoản admin mặc định");
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Xóa người dùng {id} thành công");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa người dùng {id}");
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // Phương thức kiểm tra người dùng hiện tại có phải là chủ sở hữu của tài nguyên
        private bool UserOwnsResource(int userId)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return currentUserId != null && int.Parse(currentUserId) == userId;
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }

        // Các phương thức xử lý mật khẩu
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
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

        // POST: api/Users/{userId}/fcm-token
        [HttpPost("{userId}/fcm-token")]
        [Authorize]
        public async Task<IActionResult> UpdateFcmToken(int userId, [FromBody] UpdateFcmTokenDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                user.FcmToken = dto.FcmToken;
                user.UpdatedAt = _dateTimeService.Now;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"FCM token updated for user {userId}");
                return Ok(new { message = "FCM token updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating FCM token");
                return StatusCode(500, new { message = "Error updating FCM token" });
            }
        }

        // POST: api/Users/send-notification
        [HttpPost("send-notification")]
        [Authorize]
        public async Task<IActionResult> SendNotification([FromBody] SendPushNotificationDto dto)
        {
            try
            {
                var targetUser = await _context.Users.FindAsync(dto.TargetUserId);
                if (targetUser == null)
                {
                    return NotFound(new { message = "Target user not found" });
                }

                if (string.IsNullOrEmpty(targetUser.FcmToken))
                {
                    return BadRequest(new { message = "User does not have FCM token" });
                }

                var success = await _firebaseMessagingService.SendNotificationAsync(
                    targetUser.FcmToken,
                    dto.Title,
                    dto.Body,
                    dto.Data
                );

                if (success)
                {
                    return Ok(new { message = "Notification sent successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Failed to send notification" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification");
                return StatusCode(500, new { message = "Error sending notification" });
            }
        }
    }
}