using System.Security.Claims;
using BE_PetWeb_API.DTOs.Vaccination;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VaccinationsController : ControllerBase
    {
        private readonly IVaccinationService _vaccinationService;
        private readonly IPetService _petService;
        private readonly IStaffService _staffService;

        public VaccinationsController(IVaccinationService vaccinationService, IPetService petService, IStaffService staffService)
        {
            _vaccinationService = vaccinationService;
            _petService = petService;
            _staffService = staffService;
        }

        // GET: api/Vaccinations
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<VaccinationDto>>> GetAllVaccinations()
        {
            var vaccinations = await _vaccinationService.GetAllVaccinationsAsync();
            return Ok(vaccinations);
        }

        // GET: api/Vaccinations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VaccinationDto>> GetVaccination(int id)
        {
            var vaccination = await _vaccinationService.GetVaccinationByIdAsync(id);
            if (vaccination == null)
            {
                return NotFound("Vaccination record not found");
            }

            // Kiểm tra quyền truy cập
            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = GetCurrentUserId();
                var pet = await _petService.GetPetByIdAsync(vaccination.PetId);
                if (pet == null || pet.UserId != userId)
                {
                    return Forbid("You don't have permission to access this vaccination record");
                }
            }

            return Ok(vaccination);
        }

        // GET: api/Vaccinations/Pet/5
        [HttpGet("Pet/{petId}")]
        public async Task<ActionResult<IEnumerable<VaccinationDto>>> GetVaccinationsByPet(int petId)
        {
            // Kiểm tra quyền truy cập
            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = GetCurrentUserId();
                var pet = await _petService.GetPetByIdAsync(petId);
                if (pet == null || pet.UserId != userId)
                {
                    return Forbid("You don't have permission to access vaccination records for this pet");
                }
            }

            var vaccinations = await _vaccinationService.GetVaccinationsByPetIdAsync(petId);
            return Ok(vaccinations);
        }

        // GET: api/Vaccinations/Upcoming/30
        [HttpGet("Upcoming/{days}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<VaccinationDto>>> GetUpcomingExpirations(int days = 30)
        {
            var vaccinations = await _vaccinationService.GetUpcomingExpirationsAsync(days);
            return Ok(vaccinations);
        }

        // GET: api/Vaccinations/Date?startDate=2023-06-01&endDate=2023-06-30
        [HttpGet("Date")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<VaccinationDto>>> GetVaccinationsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var vaccinations = await _vaccinationService.GetVaccinationsByDateRangeAsync(startDate, endDate);
            return Ok(vaccinations);
        }

        // POST: api/Vaccinations
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<VaccinationDto>> CreateVaccination(CreateVaccinationDto createVaccinationDto)
        {
            try
            {
                // Nếu không có AdministeredBy, lấy thông tin staff từ user hiện tại (nếu là Staff)
                if (!createVaccinationDto.AdministeredBy.HasValue && User.IsInRole("Staff"))
                {
                    var userId = GetCurrentUserId();
                    var staff = await _staffService.GetStaffByUserIdAsync(userId);
                    if (staff != null)
                    {
                        createVaccinationDto.AdministeredBy = staff.StaffId;
                    }
                }

                var vaccination = await _vaccinationService.CreateVaccinationAsync(createVaccinationDto);
                return CreatedAtAction(nameof(GetVaccination), new { id = vaccination.VaccinationId }, vaccination);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Vaccinations/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateVaccination(int id, UpdateVaccinationDto updateVaccinationDto)
        {
            try
            {
                var vaccination = await _vaccinationService.UpdateVaccinationAsync(id, updateVaccinationDto);
                return Ok(vaccination);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Vaccinations/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVaccination(int id)
        {
            try
            {
                var result = await _vaccinationService.DeleteVaccinationAsync(id);
                if (!result)
                {
                    return NotFound("Vaccination record not found");
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