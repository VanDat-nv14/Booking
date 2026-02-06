using System.Security.Claims;
using BE_PetWeb_API.DTOs.MedicalRecord;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly IPetService _petService;
        private readonly IStaffService _staffService;

        public MedicalRecordsController(IMedicalRecordService medicalRecordService, IPetService petService, IStaffService staffService)
        {
            _medicalRecordService = medicalRecordService;
            _petService = petService;
            _staffService = staffService;
            _staffService = staffService;
        }

        // GET: api/MedicalRecords
        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetAllMedicalRecords()
        {
            var medicalRecords = await _medicalRecordService.GetAllMedicalRecordsAsync();
            return Ok(medicalRecords);
        }

        // GET: api/MedicalRecords/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalRecordDto>> GetMedicalRecord(int id)
        {
            var medicalRecord = await _medicalRecordService.GetMedicalRecordByIdAsync(id);
            if (medicalRecord == null)
            {
                return NotFound("Medical record not found");
            }

            // Kiểm tra quyền truy cập
            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = GetCurrentUserId();
                var pet = await _petService.GetPetByIdAsync(medicalRecord.PetId);
                if (pet == null || pet.UserId != userId)
                {
                    return Forbid("You don't have permission to access this medical record");
                }
            }

            return Ok(medicalRecord);
        }

        // GET: api/MedicalRecords/Pet/5
        [HttpGet("Pet/{petId}")]
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetMedicalRecordsByPet(int petId)
        {
            // Kiểm tra quyền truy cập
            if (!User.IsInRole("Admin") && !User.IsInRole("Staff"))
            {
                var userId = GetCurrentUserId();
                var pet = await _petService.GetPetByIdAsync(petId);
                if (pet == null || pet.UserId != userId)
                {
                    return Forbid("You don't have permission to access medical records for this pet");
                }
            }

            var medicalRecords = await _medicalRecordService.GetMedicalRecordsByPetIdAsync(petId);
            return Ok(medicalRecords);
        }

        // GET: api/MedicalRecords/Date?startDate=2023-06-01&endDate=2023-06-30
        [HttpGet("Date")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<IEnumerable<MedicalRecordDto>>> GetMedicalRecordsByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var medicalRecords = await _medicalRecordService.GetMedicalRecordsByDateRangeAsync(startDate, endDate);
            return Ok(medicalRecords);
        }

        // POST: api/MedicalRecords
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<MedicalRecordDto>> CreateMedicalRecord(CreateMedicalRecordDto createMedicalRecordDto)
        {
            try
            {
                // Nếu không có StaffId, lấy thông tin staff từ user hiện tại (nếu là Staff)
                if (!createMedicalRecordDto.StaffId.HasValue && User.IsInRole("Staff"))
                {
                    var userId = GetCurrentUserId();
                    var staff = await _staffService.GetStaffByUserIdAsync(userId);
                    if (staff != null)
                    {
                        createMedicalRecordDto.StaffId = staff.StaffId;
                    }
                }

                var medicalRecord = await _medicalRecordService.CreateMedicalRecordAsync(createMedicalRecordDto);
                return CreatedAtAction(nameof(GetMedicalRecord), new { id = medicalRecord.RecordId }, medicalRecord);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/MedicalRecords/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateMedicalRecord(int id, UpdateMedicalRecordDto updateMedicalRecordDto)
        {
            try
            {
                var medicalRecord = await _medicalRecordService.UpdateMedicalRecordAsync(id, updateMedicalRecordDto);
                return Ok(medicalRecord);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/MedicalRecords/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMedicalRecord(int id)
        {
            try
            {
                var result = await _medicalRecordService.DeleteMedicalRecordAsync(id);
                if (!result)
                {
                    return NotFound("Medical record not found");
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