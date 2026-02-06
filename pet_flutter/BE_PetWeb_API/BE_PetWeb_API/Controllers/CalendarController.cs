using BE_PetWeb_API.DTOs.Calendar;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly IStaffService _staffService;
        private readonly IAvailabilityService _availabilityService;

        public CalendarController(
            IAppointmentService appointmentService,
            IStaffService staffService,
            IAvailabilityService availabilityService)
        {
            _appointmentService = appointmentService;
            _staffService = staffService;
            _availabilityService = availabilityService;
        }

        // GET: api/Calendar/Daily/2023-06-15
        [HttpGet("Daily/{date}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult> GetDailyCalendar(DateTime date)
        {
            try
            {
                var appointments = await _appointmentService.GetAppointmentsByDateAsync(date);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Calendar/Weekly?startDate=2023-06-12
        [HttpGet("Weekly")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult> GetWeeklyCalendar([FromQuery] DateTime startDate)
        {
            try
            {
                var endDate = startDate.AddDays(6);
                var appointments = await _appointmentService.GetAppointmentsByDateRangeAsync(startDate, endDate);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Calendar/Monthly?year=2023&month=6
        [HttpGet("Monthly")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult> GetMonthlyCalendar([FromQuery] int year, [FromQuery] int month)
        {
            try
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);
                var appointments = await _appointmentService.GetAppointmentsByDateRangeAsync(startDate, endDate);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Calendar/Staff/5/Availability/2023-06-15
        [HttpGet("Staff/{staffId}/Availability/{date}")]
        public async Task<ActionResult> GetStaffAvailability(int staffId, DateTime date)
        {
            try
            {
                var availableSlots = await _availabilityService.GetAvailableTimeSlotsAsync(staffId, date);
                return Ok(availableSlots);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Calendar/Staff/5/Availability
        [HttpPost("Staff/{staffId}/Availability")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult> SetStaffAvailability(int staffId, [FromBody] SetAvailabilityDto availabilityDto)
        {
            try
            {
                // Kiểm tra quyền - chỉ admin hoặc chính nhân viên đó mới được thiết lập
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");
                var staff = await _staffService.GetStaffByIdAsync(staffId);

                if (staff == null)
                {
                    return NotFound("Staff not found");
                }

                if (!isAdmin && staff.UserId != userId)
                {
                    return Forbid("You are not authorized to set availability for this staff");
                }

                var result = await _availabilityService.SetStaffAvailabilityAsync(staffId, availabilityDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Calendar/CheckConflict?startTime=2023-06-15T10:00:00&duration=60&staffId=5
        [HttpGet("CheckConflict")]
        public async Task<ActionResult> CheckTimeConflict(
            [FromQuery] DateTime startTime,
            [FromQuery] int duration,
            [FromQuery] int staffId)
        {
            try
            {
                var endTime = startTime.AddMinutes(duration);
                var hasConflict = await _availabilityService.CheckTimeConflictAsync(staffId, startTime, endTime);
                return Ok(new { hasConflict });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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