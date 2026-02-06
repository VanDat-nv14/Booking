using System.Security.Claims;
using BE_PetWeb_API.DTOs.Staff;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE_PetWeb_API.Models;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        // GET: api/Staff
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDto>>> GetAllStaff()
        {
            var staff = await _staffService.GetAllStaffAsync();
            return Ok(staff);
        }

        // GET: api/Staff/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDto>> GetStaff(int id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);

            if (staff == null)
            {
                return NotFound("Staff not found");
            }

            return Ok(staff);
        }

        // GET: api/Staff/5/statistics
        [HttpGet("{id}/statistics")]
        [AllowAnonymous]
        public async Task<ActionResult> GetStaffStatistics(int id)
        {
            try
            {
                using (var scope = HttpContext.RequestServices.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<PetWebContext>();
                    
                    // Kiểm tra staff có tồn tại không
                    var staff = await context.Staff
                        .Include(s => s.User)
                        .FirstOrDefaultAsync(s => s.StaffId == id);

                    if (staff == null)
                    {
                        return NotFound(new { message = "Nhân viên không tồn tại" });
                    }

                    // Đếm số lịch hẹn đã hoàn thành
                    var completedAppointments = await context.Appointments
                        .Where(a => a.StaffId == id && a.Status == "Completed")
                        .CountAsync();

                    // Lấy đánh giá trung bình và tổng số reviews
                    // Lọc reviews từ appointments của staff này
                    var reviews = await context.Reviews
                        .Include(r => r.Appointment)
                        .Where(r => r.AppointmentId != null && 
                                    r.Appointment.StaffId == id)
                        .ToListAsync();

                    var averageRating = reviews.Any() 
                        ? Math.Round(reviews.Average(r => r.Rating), 1) 
                        : 0.0;

                    var totalReviews = reviews.Count;

                    // Tính rating breakdown (số lượng mỗi loại sao)
                    var ratingBreakdown = new
                    {
                        fiveStar = reviews.Count(r => r.Rating == 5),
                        fourStar = reviews.Count(r => r.Rating == 4),
                        threeStar = reviews.Count(r => r.Rating == 3),
                        twoStar = reviews.Count(r => r.Rating == 2),
                        oneStar = reviews.Count(r => r.Rating == 1)
                    };

                    // Lấy thông tin nhân viên
                    var staffInfo = new
                    {
                        staffId = staff.StaffId,
                        fullName = staff.User.FullName,
                        email = staff.User.Email,
                        phone = staff.User.Phone,
                        specialization = staff.Specialization,
                        avatarUrl = staff.User.Avatar,
                        isActive = staff.IsActive,
                        statistics = new
                        {
                            completedServices = completedAppointments,
                            averageRating = averageRating,
                            totalReviews = totalReviews,
                            ratingBreakdown = ratingBreakdown
                        }
                    };

                    return Ok(staffInfo);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê nhân viên: " + ex.Message });
            }
        }

        // GET: api/Staff/User/5
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<StaffDto>> GetStaffByUserId(int userId)
        {
            var staff = await _staffService.GetStaffByUserIdAsync(userId);

            if (staff == null)
            {
                return NotFound("Staff not found for this user");
            }

            return Ok(staff);
        }

        // GET: api/Staff/CurrentUser
        [HttpGet("CurrentUser")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<StaffDto>> GetCurrentUserStaff()
        {
            var userId = GetCurrentUserId();
            var staff = await _staffService.GetStaffByUserIdAsync(userId);

            if (staff == null)
            {
                return NotFound("Staff profile not found for current user");
            }

            return Ok(staff);
        }

        // GET: api/Staff/Specialization/Grooming
        [HttpGet("Specialization/{specialization}")]
        public async Task<ActionResult<IEnumerable<StaffDto>>> GetStaffBySpecialization(string specialization)
        {
            var staff = await _staffService.GetStaffBySpecializationAsync(specialization);
            return Ok(staff);
        }

        // GET: api/Staff/Service/5
        [HttpGet("Service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<StaffDto>>> GetStaffByServiceId(int serviceId)
        {
            var staff = await _staffService.GetStaffByServiceIdAsync(serviceId);
            return Ok(staff);
        }

        // POST: api/Staff
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StaffDto>> CreateStaff([FromForm] CreateStaffDto createStaffDto)
        {
            try
            {
                var createdStaff = await _staffService.CreateStaffAsync(createStaffDto);
                return CreatedAtAction(nameof(GetStaff), new { id = createdStaff.StaffId }, createdStaff);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Staff/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStaff(int id, [FromForm] UpdateStaffDto updateStaffDto)
        {
            try
            {
                // Kiểm tra quyền: Admin hoặc chính nhân viên đó
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");
                var staff = await _staffService.GetStaffByIdAsync(id);

                if (!isAdmin && staff.UserId != userId)
                {
                    return Forbid("You are not authorized to update this staff profile");
                }

                var updatedStaff = await _staffService.UpdateStaffAsync(id, updateStaffDto);
                return Ok(updatedStaff);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Staff/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var result = await _staffService.DeleteStaffAsync(id);

                if (!result)
                {
                    return NotFound("Staff not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Staff/5/Services/6
        [HttpPost("{staffId}/Services/{serviceId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignServiceToStaff(int staffId, int serviceId)
        {
            try
            {
                var result = await _staffService.AssignServiceToStaffAsync(staffId, serviceId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Staff/5/Services/6
        [HttpDelete("{staffId}/Services/{serviceId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveServiceFromStaff(int staffId, int serviceId)
        {
            try
            {
                var result = await _staffService.RemoveServiceFromStaffAsync(staffId, serviceId);

                if (!result)
                {
                    return NotFound("Staff-Service relationship not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Staff/create-user-staff
        [HttpPost("create-user-staff")]
        // [Authorize(Roles = "Admin")] // Tạm thời bỏ để test
        public async Task<ActionResult<StaffDto>> CreateUserStaff([FromForm] CreateUserStaffDto createUserStaffDto)
        {
            try
            {
                var createdStaff = await _staffService.CreateUserStaffAsync(createUserStaffDto);
                return CreatedAtAction(nameof(GetStaff), new { id = createdStaff.StaffId }, createdStaff);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Staff/{staffId}/busy-slots
        [HttpGet("{staffId}/busy-slots")]
        [AllowAnonymous] // Cho phép truy cập để debug CORS
        public async Task<ActionResult<IEnumerable<string>>> GetStaffBusyTimeSlots(int staffId, [FromQuery] DateTime date)
        {
            try
            {
                var busyTimeSlots = await GetStaffBusyTimeSlotsInternal(staffId, date);
                return Ok(busyTimeSlots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/Staff/{staffId}/busy-slots/range
        [HttpGet("{staffId}/busy-slots/range")]
        [AllowAnonymous] // Cho phép truy cập để debug CORS
        public async Task<ActionResult<IEnumerable<object>>> GetStaffBusyTimeSlotsRange(
            int staffId, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var endDateToUse = endDate ?? startDate;
                var busySlots = new List<object>();

                for (var date = startDate.Date; date <= endDateToUse.Date; date = date.AddDays(1))
                {
                    var dailyBusySlots = await GetStaffBusyTimeSlotsInternal(staffId, date);
                    foreach (var timeSlot in dailyBusySlots)
                    {
                        busySlots.Add(new
                        {
                            date = date.ToString("yyyy-MM-dd"),
                            time = timeSlot,
                            staffId = staffId
                        });
                    }
                }

                return Ok(busySlots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Phương thức nội bộ để lấy danh sách khung giờ bận của nhân viên
        private async Task<List<string>> GetStaffBusyTimeSlotsInternal(int staffId, DateTime date)
        {
            var busyTimeSlots = new List<string>();

            try
            {
                // Sử dụng DI để lấy context
                using (var scope = HttpContext.RequestServices.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<PetWebContext>();
                    
                    var appointments = await context.Appointments
                        .Include(a => a.Service)
                        .Where(a => a.StaffId == staffId &&
                               a.AppointmentDate.Date == date.Date &&
                               a.Status != "Cancelled" && 
                               a.Status != "No-Show" && 
                               a.Status != "Completed")
                        .OrderBy(a => a.AppointmentDate)
                        .ToListAsync();

                    foreach (var appointment in appointments)
                    {
                        var startTime = appointment.AppointmentDate;
                        var serviceDuration = appointment.Service?.Duration ?? 30;
                        var endTime = appointment.EndTime ?? startTime.AddMinutes(serviceDuration);
                        
                        // KHÔNG thêm buffer time vì frontend đã tính
                        // endTime từ frontend = startTime + 30 phút (không bao gồm buffer)
                        // Slots frontend: 8:00-8:30, 8:40-9:10, 9:20-9:50 (interval 40 phút)
                        
                        // Thêm tất cả các khung giờ 40 phút bị ảnh hưởng (giống frontend)
                        const int slotInterval = 40; // serviceDuration (30) + bufferTime (10)
                        
                        for (DateTime time = new DateTime(date.Year, date.Month, date.Day, 8, 0, 0);
                             time <= new DateTime(date.Year, date.Month, date.Day, 21, 30, 0);
                             time = time.AddMinutes(slotInterval)) // Interval 40 phút giống frontend
                        {
                            DateTime slotEnd = time.AddMinutes(serviceDuration); // Slot end = start + 30 phút
                            
                            // Check overlap: slot có giao nhau với appointment không?
                            if ((time >= startTime && time < endTime) ||
                                (slotEnd > startTime && slotEnd <= endTime) ||
                                (time <= startTime && slotEnd >= endTime))
                            {
                                busyTimeSlots.Add(time.ToString("HH:mm"));
                            }
                        }
                    }
                }

                return busyTimeSlots.Distinct().ToList();
            }
            catch (Exception ex)
            {
                // Log error and return empty list
                return new List<string>();
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new Exception("User ID claim not found");

            return int.Parse(userIdClaim.Value);
        }
    }
}