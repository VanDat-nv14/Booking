using System.Security.Claims;
using BE_PetWeb_API.DTOs.Reminder;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RemindersController : ControllerBase
    {
        private readonly IReminderService _reminderService;
        private readonly IPetService _petService;

        public RemindersController(IReminderService reminderService, IPetService petService)
        {
            _reminderService = reminderService;
            _petService = petService;
        }

        // GET: api/Reminders
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<ReminderDto>>> GetAllReminders()
        {
            var reminders = await _reminderService.GetAllRemindersAsync();
            return Ok(reminders);
        }

        // GET: api/Reminders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReminderDto>> GetReminder(int id)
        {
            var reminder = await _reminderService.GetReminderByIdAsync(id);
            if (reminder == null)
            {
                return NotFound("Reminder not found");
            }

            // Kiểm tra quyền truy cập
            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = GetCurrentUserId();
                var pet = await _petService.GetPetByIdAsync(reminder.PetId);
                if (pet == null || pet.UserId != userId)
                {
                    return Forbid("You don't have permission to access this reminder");
                }
            }

            return Ok(reminder);
        }

        // GET: api/Reminders/Pet/5
        [HttpGet("Pet/{petId}")]
        public async Task<ActionResult<IEnumerable<ReminderDto>>> GetRemindersByPet(int petId)
        {
            // Kiểm tra quyền truy cập
            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = GetCurrentUserId();
                var pet = await _petService.GetPetByIdAsync(petId);
                if (pet == null || pet.UserId != userId)
                {
                    return Forbid("You don't have permission to access reminders for this pet");
                }
            }

            var reminders = await _reminderService.GetRemindersByPetIdAsync(petId);
            return Ok(reminders);
        }

        // GET: api/Reminders/User
        [HttpGet("User")]
        public async Task<ActionResult<IEnumerable<ReminderDto>>> GetUserReminders()
        {
            var userId = GetCurrentUserId();
            var reminders = await _reminderService.GetRemindersByUserIdAsync(userId);
            return Ok(reminders);
        }

        // GET: api/Reminders/Upcoming?days=7
        [HttpGet("Upcoming")]
        public async Task<ActionResult<IEnumerable<ReminderDto>>> GetUpcomingReminders([FromQuery] int days = 7)
        {
            var userId = GetCurrentUserId();
            var reminders = await _reminderService.GetUpcomingRemindersAsync(userId, days);
            return Ok(reminders);
        }

        // POST: api/Reminders
        [HttpPost]
        public async Task<ActionResult<ReminderDto>> CreateReminder(CreateReminderDto createReminderDto)
        {
            try
            {
                // Kiểm tra quyền truy cập
                if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
                {
                    var userId = GetCurrentUserId();
                    var pet = await _petService.GetPetByIdAsync(createReminderDto.PetId);
                    if (pet == null || pet.UserId != userId)
                    {
                        return Forbid("You don't have permission to create reminders for this pet");
                    }
                }

                var reminder = await _reminderService.CreateReminderAsync(createReminderDto);
                return CreatedAtAction(nameof(GetReminder), new { id = reminder.ReminderId }, reminder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Reminders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReminder(int id, UpdateReminderDto updateReminderDto)
        {
            try
            {
                // Kiểm tra reminder tồn tại không
                var existingReminder = await _reminderService.GetReminderByIdAsync(id);
                if (existingReminder == null)
                {
                    return NotFound("Reminder not found");
                }

                // Kiểm tra quyền truy cập
                if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
                {
                    var userId = GetCurrentUserId();
                    var pet = await _petService.GetPetByIdAsync(existingReminder.PetId);
                    if (pet == null || pet.UserId != userId)
                    {
                        return Forbid("You don't have permission to update this reminder");
                    }
                }

                var reminder = await _reminderService.UpdateReminderAsync(id, updateReminderDto);
                return Ok(reminder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PATCH: api/Reminders/5/Status
        [HttpPatch("{id}/Status")]
        public async Task<IActionResult> UpdateReminderStatus(int id, [FromBody] string status)
        {
            try
            {
                // Kiểm tra reminder tồn tại không
                var existingReminder = await _reminderService.GetReminderByIdAsync(id);
                if (existingReminder == null)
                {
                    return NotFound("Reminder not found");
                }

                // Kiểm tra quyền truy cập
                if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
                {
                    var userId = GetCurrentUserId();
                    var pet = await _petService.GetPetByIdAsync(existingReminder.PetId);
                    if (pet == null || pet.UserId != userId)
                    {
                        return Forbid("You don't have permission to update this reminder");
                    }
                }

                var reminder = await _reminderService.UpdateReminderStatusAsync(id, status);
                return Ok(reminder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Reminders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReminder(int id)
        {
            try
            {
                // Kiểm tra reminder tồn tại không
                var existingReminder = await _reminderService.GetReminderByIdAsync(id);
                if (existingReminder == null)
                {
                    return NotFound("Reminder not found");
                }

                // Kiểm tra quyền truy cập
                if (!User.IsInRole("Admin"))
                {
                    if (!User.IsInRole("Staff"))
                    {
                        var userId = GetCurrentUserId();
                        var pet = await _petService.GetPetByIdAsync(existingReminder.PetId);
                        if (pet == null || pet.UserId != userId)
                        {
                            return Forbid("You don't have permission to delete this reminder");
                        }
                    }
                }

                var result = await _reminderService.DeleteReminderAsync(id);
                if (!result)
                {
                    return NotFound("Reminder not found");
                }

                return NoContent();
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