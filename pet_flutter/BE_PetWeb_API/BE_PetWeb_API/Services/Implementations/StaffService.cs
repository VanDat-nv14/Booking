using BE_PetWeb_API.DTOs.Staff;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class StaffService : IStaffService
    {
        private readonly PetWebContext _context;
        private readonly IFileService _fileService;
        private readonly ILogger<StaffService> _logger;

        public StaffService(PetWebContext context, IFileService fileService, ILogger<StaffService> logger)
        {
            _context = context;
            _fileService = fileService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách tất cả nhân viên đang hoạt động
        /// </summary>
        public async Task<IEnumerable<StaffDto>> GetAllStaffAsync()
        {
            try
            {
                _logger.LogInformation("Đang lấy danh sách tất cả nhân viên");

                var staffList = await _context.Staff
                    .Include(s => s.User)
                    .Include(s => s.StaffServices)
                    .ThenInclude(ss => ss.Service)
                    .Where(s => s.IsActive == true)
                    .Select(s => new StaffDto
                    {
                        StaffId = s.StaffId,
                        UserId = s.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        Phone = s.User.Phone,
                        Specialization = s.Specialization,
                        Bio = s.Bio,
                        Experience = s.Experience,
                        Rating = s.Rating,
                        Avatar = s.User.Avatar,
                        Services = s.StaffServices.Select(ss => new StaffServiceDto
                        {
                            ServiceId = ss.Service.ServiceId,
                            Name = ss.Service.Name,
                            Category = ss.Service.Category,
                            Price = ss.Service.Price
                        }).ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation($"Đã lấy {staffList.Count()} nhân viên");
                return staffList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách nhân viên");
                throw new Exception("Không thể lấy danh sách nhân viên. Lỗi: " + ex.Message);
            }
        }

        /// <summary>
        /// Lấy thông tin nhân viên theo ID
        /// </summary>
        public async Task<StaffDto> GetStaffByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation($"Đang lấy thông tin nhân viên có ID: {id}");

                var staff = await _context.Staff
                    .Include(s => s.User)
                    .Include(s => s.StaffServices)
                    .ThenInclude(ss => ss.Service)
                    .Where(s => s.StaffId == id && s.IsActive == true)
                    .Select(s => new StaffDto
                    {
                        StaffId = s.StaffId,
                        UserId = s.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        Phone = s.User.Phone,
                        Specialization = s.Specialization,
                        Bio = s.Bio,
                        Experience = s.Experience,
                        Rating = s.Rating,
                        Avatar = s.User.Avatar,
                        Services = s.StaffServices.Select(ss => new StaffServiceDto
                        {
                            ServiceId = ss.Service.ServiceId,
                            Name = ss.Service.Name,
                            Category = ss.Service.Category,
                            Price = ss.Service.Price
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (staff == null)
                {
                    _logger.LogWarning($"Không tìm thấy nhân viên có ID: {id}");
                }

                return staff;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin nhân viên ID: {id}");
                throw new Exception($"Không thể lấy thông tin nhân viên ID: {id}. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy thông tin nhân viên theo UserID
        /// </summary>
        public async Task<StaffDto> GetStaffByUserIdAsync(int userId)
        {
            try
            {
                _logger.LogInformation($"Đang lấy thông tin nhân viên có UserID: {userId}");

                var staff = await _context.Staff
                    .Include(s => s.User)
                    .Include(s => s.StaffServices)
                    .ThenInclude(ss => ss.Service)
                    .Where(s => s.UserId == userId && s.IsActive == true)
                    .Select(s => new StaffDto
                    {
                        StaffId = s.StaffId,
                        UserId = s.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        Phone = s.User.Phone,
                        Specialization = s.Specialization,
                        Bio = s.Bio,
                        Experience = s.Experience,
                        Rating = s.Rating,
                        Avatar = s.User.Avatar,
                        Services = s.StaffServices.Select(ss => new StaffServiceDto
                        {
                            ServiceId = ss.Service.ServiceId,
                            Name = ss.Service.Name,
                            Category = ss.Service.Category,
                            Price = ss.Service.Price
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (staff == null)
                {
                    _logger.LogWarning($"Không tìm thấy nhân viên có UserID: {userId}");
                }

                return staff;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thông tin nhân viên UserID: {userId}");
                throw new Exception($"Không thể lấy thông tin nhân viên UserID: {userId}. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Tạo mới nhân viên từ User có sẵn
        /// </summary>
        public async Task<StaffDto> CreateStaffAsync(CreateStaffDto createStaffDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Đang tạo nhân viên mới cho UserID: {createStaffDto.UserId}");

                // Kiểm tra user có tồn tại không
                var user = await _context.Users.FindAsync(createStaffDto.UserId);
                if (user == null)
                {
                    _logger.LogWarning($"User không tồn tại: {createStaffDto.UserId}");
                    throw new Exception("User không tồn tại");
                }

                // Kiểm tra user đã là staff chưa
                var existingStaff = await _context.Staff
                    .Where(s => s.UserId == createStaffDto.UserId && s.IsActive == true)
                    .FirstOrDefaultAsync();

                if (existingStaff != null)
                {
                    _logger.LogWarning($"User {createStaffDto.UserId} đã là nhân viên");
                    throw new Exception("User này đã là nhân viên rồi");
                }

                var staff = new Staff
                {
                    UserId = createStaffDto.UserId,
                    Specialization = createStaffDto.Specialization ?? string.Empty,
                    Bio = createStaffDto.Bio,
                    Experience = createStaffDto.Experience ?? 0,
                    Rating = 0, // Rating mặc định
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true
                };

                _context.Staff.Add(staff);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đã tạo nhân viên mới với ID: {staff.StaffId}");

                // Cập nhật avatar nếu có
                if (createStaffDto.Avatar != null)
                {
                    try
                    {
                        _logger.LogInformation("Đang tải lên avatar cho nhân viên mới");
                        var avatarPath = await _fileService.UploadImageAsync(createStaffDto.Avatar, "avatars");
                        user.Avatar = avatarPath;
                        _context.Users.Update(user);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Đã tải lên avatar thành công");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi tải lên avatar");
                        throw new Exception($"Lỗi khi tải lên avatar: {ex.Message}");
                    }
                }

                // Cập nhật role thành Staff nếu không phải Admin
                if (user.Role != "Admin")
                {
                    _logger.LogInformation($"Cập nhật role của user {user.UserId} thành Staff");
                    user.Role = "Staff";
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                _logger.LogInformation($"Hoàn tất tạo nhân viên với ID: {staff.StaffId}");

                return await GetStaffByIdAsync(staff.StaffId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi khi tạo nhân viên mới");
                throw new Exception($"Không thể tạo nhân viên mới. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Tạo User và Staff cùng lúc (Admin tạo nhân viên hoàn toàn mới)
        /// </summary>
        public async Task<StaffDto> CreateUserStaffAsync(CreateUserStaffDto createUserStaffDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Đang tạo User và Staff mới cho: {createUserStaffDto.Username}");

                // Kiểm tra username và email đã tồn tại chưa
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == createUserStaffDto.Username || u.Email == createUserStaffDto.Email);

                if (existingUser != null)
                {
                    var errorMsg = existingUser.Username == createUserStaffDto.Username ? "Username đã tồn tại" : "Email đã tồn tại";
                    _logger.LogWarning(errorMsg);
                    throw new Exception(errorMsg);
                }

                // Mã hóa mật khẩu
                CreatePasswordHash(createUserStaffDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

                // Tạo User mới
                var user = new User
                {
                    Username = createUserStaffDto.Username,
                    Email = createUserStaffDto.Email,
                    Password = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt),
                    FullName = createUserStaffDto.FullName,
                    Phone = createUserStaffDto.Phone,
                    Address = createUserStaffDto.Address,
                    Avatar = "default-avatar.png",
                    Role = "Staff",
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đã tạo User mới với ID: {user.UserId}");

                // Xử lý avatar nếu có
                if (createUserStaffDto.Avatar != null)
                {
                    try
                    {
                        var avatarPath = await _fileService.UploadImageAsync(createUserStaffDto.Avatar, "avatars");
                        user.Avatar = avatarPath;
                        _context.Users.Update(user);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Đã tải lên avatar thành công");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi tải lên avatar");
                        // Không throw exception, chỉ log lỗi
                    }
                }

                // Tạo Staff
                var staff = new Staff
                {
                    UserId = user.UserId,
                    Specialization = createUserStaffDto.Specialization,
                    Bio = createUserStaffDto.Bio,
                    Experience = createUserStaffDto.Experience ?? 0,
                    Rating = 0,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true
                };

                _context.Staff.Add(staff);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đã tạo Staff mới với ID: {staff.StaffId}");

                // Gán dịch vụ nếu có
                if (createUserStaffDto.ServiceIds != null && createUserStaffDto.ServiceIds.Any())
                {
                    foreach (var serviceId in createUserStaffDto.ServiceIds)
                    {
                        // Kiểm tra service có tồn tại không
                        var serviceExists = await _context.Services.AnyAsync(s => s.ServiceId == serviceId && s.IsActive == true);
                        if (serviceExists)
                        {
                            var staffService = new Models.StaffService
                            {
                                StaffId = staff.StaffId,
                                ServiceId = serviceId
                            };
                            _context.StaffServices.Add(staffService);
                        }
                    }
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Đã gán {createUserStaffDto.ServiceIds.Count} dịch vụ cho Staff");
                }

                await transaction.CommitAsync();
                _logger.LogInformation($"Hoàn tất tạo User và Staff: {createUserStaffDto.Username}");

                return await GetStaffByIdAsync(staff.StaffId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Lỗi khi tạo User và Staff: {createUserStaffDto?.Username}");
                throw new Exception($"Không thể tạo User và Staff. Lỗi: {ex.Message}");
            }
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA256())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        /// <summary>
        /// Cập nhật thông tin nhân viên
        /// </summary>
        public async Task<StaffDto> UpdateStaffAsync(int id, UpdateStaffDto updateStaffDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Đang cập nhật thông tin nhân viên ID: {id}");

                var staff = await _context.Staff.FindAsync(id);
                if (staff == null || staff.IsActive != true)
                {
                    _logger.LogWarning($"Nhân viên ID: {id} không tồn tại hoặc đã bị vô hiệu hóa");
                    throw new Exception("Nhân viên không tồn tại hoặc đã bị vô hiệu hóa");
                }

                // Cập nhật thông tin
                if (!string.IsNullOrEmpty(updateStaffDto.Specialization))
                {
                    staff.Specialization = updateStaffDto.Specialization;
                }

                if (updateStaffDto.Bio != null)
                {
                    staff.Bio = updateStaffDto.Bio;
                }

                if (updateStaffDto.Experience.HasValue)
                {
                    staff.Experience = updateStaffDto.Experience.Value;
                }

                staff.UpdatedAt = DateTime.Now;

                _context.Staff.Update(staff);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Đã cập nhật thông tin cơ bản nhân viên ID: {id}");

                // Cập nhật avatar nếu có
                if (updateStaffDto.Avatar != null)
                {
                    try
                    {
                        _logger.LogInformation($"Đang cập nhật avatar cho nhân viên ID: {id}");
                        var user = await _context.Users.FindAsync(staff.UserId);
                        if (user != null)
                        {
                            // Xóa avatar cũ nếu có
                            if (!string.IsNullOrEmpty(user.Avatar))
                            {
                                bool deleteResult = _fileService.DeleteImage(user.Avatar);
                                _logger.LogInformation($"Xóa avatar cũ: {(deleteResult ? "thành công" : "thất bại")}");
                            }

                            var avatarPath = await _fileService.UploadImageAsync(updateStaffDto.Avatar, "avatars");
                            user.Avatar = avatarPath;
                            _context.Users.Update(user);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Đã cập nhật avatar thành công");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi khi cập nhật avatar");
                        throw new Exception($"Lỗi khi cập nhật avatar: {ex.Message}");
                    }
                }

                await transaction.CommitAsync();
                _logger.LogInformation($"Hoàn tất cập nhật nhân viên ID: {id}");

                return await GetStaffByIdAsync(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Lỗi khi cập nhật nhân viên ID: {id}");
                throw new Exception($"Không thể cập nhật nhân viên ID: {id}. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa (vô hiệu hóa) nhân viên
        /// </summary>
        public async Task<bool> DeleteStaffAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Đang xóa (vô hiệu hóa) nhân viên ID: {id}");

                var staff = await _context.Staff.FindAsync(id);
                if (staff == null || staff.IsActive != true)
                {
                    _logger.LogWarning($"Nhân viên ID: {id} không tồn tại hoặc đã bị vô hiệu hóa");
                    return false;
                }

                // Kiểm tra xem staff có đang phụ trách lịch hẹn nào không
                var hasAppointments = await _context.Appointments
                    .AnyAsync(a => a.StaffId == id &&
                             (a.Status == "Scheduled" || a.Status == "Confirmed" || a.Status == "Pending"));

                if (hasAppointments)
                {
                    _logger.LogWarning($"Không thể xóa nhân viên ID: {id} vì có lịch hẹn đang hoạt động");
                    throw new Exception("Không thể xóa nhân viên đang có lịch hẹn hoạt động");
                }

                // Soft delete
                staff.IsActive = false;
                staff.UpdatedAt = DateTime.Now;

                _context.Staff.Update(staff);
                await _context.SaveChangesAsync();

                // Cũng cần cập nhật Role của User nếu cần
                var user = await _context.Users.FindAsync(staff.UserId);
                if (user != null && user.Role == "Staff")
                {
                    user.Role = "Customer"; // Hoặc role thích hợp khác
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                _logger.LogInformation($"Đã vô hiệu hóa nhân viên ID: {id} thành công");

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Lỗi khi xóa nhân viên ID: {id}");
                throw new Exception($"Không thể xóa nhân viên ID: {id}. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy danh sách nhân viên theo chuyên môn
        /// </summary>
        public async Task<IEnumerable<StaffDto>> GetStaffBySpecializationAsync(string specialization)
        {
            try
            {
                if (string.IsNullOrEmpty(specialization))
                {
                    _logger.LogWarning("Chuyên môn không được để trống");
                    throw new ArgumentException("Chuyên môn không được để trống");
                }

                _logger.LogInformation($"Đang lấy danh sách nhân viên theo chuyên môn: {specialization}");

                var staffList = await _context.Staff
                    .Include(s => s.User)
                    .Include(s => s.StaffServices)
                    .ThenInclude(ss => ss.Service)
                    .Where(s => s.Specialization == specialization && s.IsActive == true)
                    .Select(s => new StaffDto
                    {
                        StaffId = s.StaffId,
                        UserId = s.UserId,
                        FullName = s.User.FullName,
                        Email = s.User.Email,
                        Phone = s.User.Phone,
                        Specialization = s.Specialization,
                        Bio = s.Bio,
                        Experience = s.Experience,
                        Rating = s.Rating,
                        Avatar = s.User.Avatar,
                        Services = s.StaffServices.Select(ss => new StaffServiceDto
                        {
                            ServiceId = ss.Service.ServiceId,
                            Name = ss.Service.Name,
                            Category = ss.Service.Category,
                            Price = ss.Service.Price
                        }).ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation($"Đã tìm thấy {staffList.Count()} nhân viên với chuyên môn: {specialization}");
                return staffList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy danh sách nhân viên theo chuyên môn: {specialization}");
                throw new Exception($"Không thể lấy danh sách nhân viên theo chuyên môn. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy danh sách nhân viên theo dịch vụ
        /// </summary>
        public async Task<IEnumerable<StaffDto>> GetStaffByServiceIdAsync(int serviceId)
        {
            try
            {
                _logger.LogInformation($"Đang lấy danh sách nhân viên cung cấp dịch vụ ID: {serviceId}");

                // Kiểm tra dịch vụ có tồn tại không
                var serviceExists = await _context.Services.AnyAsync(s => s.ServiceId == serviceId && s.IsActive == true);
                if (!serviceExists)
                {
                    _logger.LogWarning($"Dịch vụ ID: {serviceId} không tồn tại hoặc đã bị vô hiệu hóa");
                    throw new Exception("Dịch vụ không tồn tại hoặc đã bị vô hiệu hóa");
                }

                var staffList = await _context.StaffServices
                    .Include(ss => ss.Staff)
                    .ThenInclude(s => s.User)
                    .Include(ss => ss.Staff.StaffServices)
                    .ThenInclude(ss => ss.Service)
                    .Where(ss => ss.ServiceId == serviceId && ss.Staff.IsActive == true)
                    .Select(ss => new StaffDto
                    {
                        StaffId = ss.Staff.StaffId,
                        UserId = ss.Staff.UserId,
                        FullName = ss.Staff.User.FullName,
                        Email = ss.Staff.User.Email,
                        Phone = ss.Staff.User.Phone,
                        Specialization = ss.Staff.Specialization,
                        Bio = ss.Staff.Bio,
                        Experience = ss.Staff.Experience,
                        Rating = ss.Staff.Rating,
                        Avatar = ss.Staff.User.Avatar,
                        Services = ss.Staff.StaffServices.Select(s => new StaffServiceDto
                        {
                            ServiceId = s.Service.ServiceId,
                            Name = s.Service.Name,
                            Category = s.Service.Category,
                            Price = s.Service.Price
                        }).ToList()
                    })
                    .ToListAsync();

                _logger.LogInformation($"Đã tìm thấy {staffList.Count()} nhân viên cung cấp dịch vụ ID: {serviceId}");
                return staffList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy danh sách nhân viên theo dịch vụ ID: {serviceId}");
                throw new Exception($"Không thể lấy danh sách nhân viên theo dịch vụ. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Gán dịch vụ cho nhân viên
        /// </summary>
        public async Task<bool> AssignServiceToStaffAsync(int staffId, int serviceId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Đang gán dịch vụ ID: {serviceId} cho nhân viên ID: {staffId}");

                // Kiểm tra staff và service có tồn tại không
                var staff = await _context.Staff.FindAsync(staffId);
                if (staff == null || staff.IsActive != true)
                {
                    _logger.LogWarning($"Nhân viên ID: {staffId} không tồn tại hoặc đã bị vô hiệu hóa");
                    throw new Exception("Nhân viên không tồn tại hoặc đã bị vô hiệu hóa");
                }

                var service = await _context.Services.FindAsync(serviceId);
                if (service == null || service.IsActive != true)
                {
                    _logger.LogWarning($"Dịch vụ ID: {serviceId} không tồn tại hoặc đã bị vô hiệu hóa");
                    throw new Exception("Dịch vụ không tồn tại hoặc đã bị vô hiệu hóa");
                }

                // Kiểm tra xem đã có trong StaffServices chưa
                var existingAssignment = await _context.StaffServices
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.ServiceId == serviceId);

                if (existingAssignment != null)
                {
                    _logger.LogInformation($"Nhân viên ID: {staffId} đã được gán dịch vụ ID: {serviceId} từ trước");
                    await transaction.CommitAsync();
                    return true; // Đã tồn tại, không cần thêm mới
                }

                // Thêm mới - sử dụng đúng kiểu dữ liệu từ models auto-generated
                var staffService = new Models.StaffService
                {
                    StaffId = staffId,
                    ServiceId = serviceId
                };

                _context.StaffServices.Add(staffService);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation($"Đã gán dịch vụ ID: {serviceId} cho nhân viên ID: {staffId} thành công");

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Lỗi khi gán dịch vụ ID: {serviceId} cho nhân viên ID: {staffId}");
                throw new Exception($"Không thể gán dịch vụ cho nhân viên. Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa dịch vụ khỏi nhân viên
        /// </summary>
        public async Task<bool> RemoveServiceFromStaffAsync(int staffId, int serviceId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _logger.LogInformation($"Đang xóa dịch vụ ID: {serviceId} khỏi nhân viên ID: {staffId}");

                // Kiểm tra quan hệ có tồn tại không
                var staffService = await _context.StaffServices
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.ServiceId == serviceId);

                if (staffService == null)
                {
                    _logger.LogWarning($"Không tìm thấy dịch vụ ID: {serviceId} được gán cho nhân viên ID: {staffId}");
                    return false;
                }

                // Kiểm tra xem có đang có lịch hẹn nào sử dụng dịch vụ này không
                var hasAppointments = await _context.Appointments
                    .AnyAsync(a => a.StaffId == staffId && a.ServiceId == serviceId &&
                                 (a.Status == "Scheduled" || a.Status == "Confirmed" || a.Status == "Pending"));

                if (hasAppointments)
                {
                    _logger.LogWarning($"Không thể xóa dịch vụ ID: {serviceId} khỏi nhân viên ID: {staffId} vì có lịch hẹn đang hoạt động");
                    throw new Exception("Không thể xóa dịch vụ đang có lịch hẹn hoạt động");
                }

                _context.StaffServices.Remove(staffService);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation($"Đã xóa dịch vụ ID: {serviceId} khỏi nhân viên ID: {staffId} thành công");

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"Lỗi khi xóa dịch vụ ID: {serviceId} khỏi nhân viên ID: {staffId}");
                throw new Exception($"Không thể xóa dịch vụ khỏi nhân viên. Lỗi: {ex.Message}");
            }
        }
    }
}