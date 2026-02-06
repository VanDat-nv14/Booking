using System.Security.Claims;
using BE_PetWeb_API.DTOs.Pet;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetsController : ControllerBase
    {
        private readonly IPetService _petService;

        public PetsController(IPetService petService)
        {
            _petService = petService;
        }

        // GET: api/Pets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PetDto>>> GetAllPets()
        {
            var pets = await _petService.GetAllPetsAsync();
            return Ok(pets);
        }

        // GET: api/Pets/User
        [HttpGet("User")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PetDto>>> GetUserPets()
        {
            var userId = GetCurrentUserId();
            var pets = await _petService.GetUserPetsAsync(userId);
            return Ok(pets);
        }

        // GET: api/Pets/User/{userId}
        [HttpGet("User/{userId}")]
        [Authorize(Roles = "Admin,Staff")] // Chỉ admin/staff mới có thể xem pets của user khác
        public async Task<ActionResult<IEnumerable<PetDto>>> GetPetsByUserId(int userId)
        {
            var pets = await _petService.GetUserPetsAsync(userId);
            return Ok(pets);
        }

        // GET: api/Pets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PetDto>> GetPet(int id)
        {
            var pet = await _petService.GetPetByIdAsync(id);

            if (pet == null)
            {
                return NotFound("Pet not found or has been deleted");
            }

            return Ok(pet);
        }

        // POST: api/Pets
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PetDto>> CreatePet([FromForm] CreatePetDto createPetDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var createdPet = await _petService.CreatePetAsync(userId, createPetDto);
                return CreatedAtAction(nameof(GetPet), new { id = createdPet.PetId }, createdPet);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Pets/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdatePet(int id, [FromForm] UpdatePetDto updatePetDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if user owns the pet
                if (!await _petService.IsPetOwner(id, userId))
                {
                    return Forbid("You are not authorized to update this pet");
                }

                var updatedPet = await _petService.UpdatePetAsync(id, userId, updatePetDto);

                if (updatedPet == null)
                {
                    return NotFound("Pet not found or has been deleted");
                }

                return Ok(updatedPet);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Pets/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePet(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if user owns the pet
                if (!await _petService.IsPetOwner(id, userId))
                {
                    return Forbid("You are not authorized to delete this pet");
                }

                var result = await _petService.DeletePetAsync(id, userId);

                if (!result)
                {
                    return NotFound("Pet not found or has been deleted");
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