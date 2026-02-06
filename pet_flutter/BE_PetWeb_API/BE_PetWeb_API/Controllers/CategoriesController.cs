using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BE_PetWeb_API.Services.Interfaces;
using BE_PetWeb_API.DTOs.Category;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        // GET: api/Categories
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories([FromQuery] bool includeInactive = false)
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync(includeInactive);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all categories");
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Categories/active
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetActiveCategories()
        {
            try
            {
                var categories = await _categoryService.GetActiveCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active categories");
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Categories/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound("Category not found");
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting category {id}");
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Categories
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto createCategoryDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var category = await _categoryService.CreateCategoryAsync(createCategoryDto);
                return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Categories/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, UpdateCategoryDto updateCategoryDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var category = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
                if (category == null)
                {
                    return NotFound("Category not found");
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating category {id}");
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Categories/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _categoryService.DeleteCategoryAsync(id);
                if (!result)
                {
                    return NotFound("Category not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting category {id}");
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Categories/{id}/permanent
        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> HardDeleteCategory(int id)
        {
            try
            {
                var result = await _categoryService.HardDeleteCategoryAsync(id);
                if (!result)
                {
                    return NotFound("Category not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error hard deleting category {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Categories/{id}/exists
        [HttpGet("{id}/exists")]
        [AllowAnonymous]
        public async Task<ActionResult<bool>> CategoryExists(int id)
        {
            try
            {
                var exists = await _categoryService.CategoryExistsAsync(id);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if category {id} exists");
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Categories/check-name/{name}
        [HttpGet("check-name/{name}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> CheckCategoryName(string name, [FromQuery] int? excludeId = null)
        {
            try
            {
                var exists = await _categoryService.CategoryNameExistsAsync(name, excludeId);
                return Ok(new { exists = exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking category name {name}");
                return BadRequest(ex.Message);
            }
        }
    }
} 