using BE_PetWeb_API.DTOs.Staff; // Sửa namespace cho đúng
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Controllers
{
    [ApiController]
    [Route("api/staff")]
    public class StaffScheduleController : ControllerBase
    {
        private readonly IStaffScheduleService _staffScheduleService;

        public StaffScheduleController(IStaffScheduleService staffScheduleService)
        {
            _staffScheduleService = staffScheduleService;
        }

        [HttpGet("{staffId}/schedule")]
        public async Task<IActionResult> GetStaffSchedule(
            int staffId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            try
            {
                var schedules = await _staffScheduleService.GetStaffScheduleByMonthYear(staffId, month, year);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{staffId}/schedule")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> SetStaffSchedule(
            int staffId,
            [FromBody] SetStaffScheduleDto scheduleDto)
        {
            try
            {
                if (staffId != scheduleDto.StaffId)
                {
                    return BadRequest(new { message = "StaffId không khớp với đường dẫn" });
                }

                var schedule = await _staffScheduleService.SetStaffSchedule(scheduleDto);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{staffId}/availability")]
        public async Task<IActionResult> CheckStaffAvailability(
            int staffId,
            [FromQuery] DateTime date)
        {
            try
            {
                var availability = await _staffScheduleService.CheckStaffAvailability(staffId, date);
                return Ok(availability);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}