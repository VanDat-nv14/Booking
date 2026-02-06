using BE_PetWeb_API.DTOs.Service;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(IServiceService serviceService, ILogger<ServicesController> logger)
        {
            _serviceService = serviceService;
            _logger = logger;
        }

        // GET: api/Services
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices()
        {
            var services = await _serviceService.GetAllServicesAsync();
            return Ok(services);
        }

        // GET: api/Services/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceDto>> GetServiceById(int id)
        {
            var service = await _serviceService.GetServiceByIdAsync(id);
            if (service == null)
            {
                return NotFound("Service not found or has been deleted");
            }
            return Ok(service);
        }

        // GET: api/Services/category/Grooming
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServicesByCategory(string category)
        {
            var services = await _serviceService.GetServicesByCategoryAsync(category);
            return Ok(services);
        }

        // GET: api/Services/filtered?category=Grooming&minPrice=100000&maxPrice=500000&duration=60&sortBy=rating
        [HttpGet("filtered")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetFilteredServices(
            [FromQuery] string? category = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int? duration = null,
            [FromQuery] string sortBy = "popular")
        {
            var services = await _serviceService.GetFilteredServicesAsync(category, minPrice, maxPrice, duration, sortBy);
            return Ok(services);
        }

        // POST: api/Services
        [HttpPost]
        public async Task<ActionResult<ServiceDto>> CreateService([FromForm] CreateServiceDto createServiceDto)
        {
            // Log toàn bộ thông tin nhận được
            _logger.LogInformation("Attempting to create new service");
            _logger.LogInformation($"Name: {createServiceDto.Name}");
            _logger.LogInformation($"Description: {createServiceDto.Description}");
            _logger.LogInformation($"Category: {createServiceDto.Category}");
            _logger.LogInformation($"Price: {createServiceDto.Price}");
            _logger.LogInformation($"Duration: {createServiceDto.Duration}");
            _logger.LogInformation($"Photo is null: {createServiceDto.Photo == null}");

            // Log chi tiết ModelState nếu không hợp lệ
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning("Validation Errors:");
                foreach (var error in errors)
                {
                    _logger.LogWarning(error);
                }

                return BadRequest(new
                {
                    message = "Validation failed",
                    errors = errors
                });
            }

            // Normalize category to ensure it's in English
            var validCategories = new[] { "Grooming", "Healthcare", "Training", "Boarding", "DayCare", "Other" };
            if (!validCategories.Contains(createServiceDto.Category))
            {
                // Attempt to map Vietnamese category to English
                var originalCategory = createServiceDto.Category;
                createServiceDto.Category = MapCategoryToEnglish(createServiceDto.Category);
                _logger.LogInformation($"Mapped category from '{originalCategory}' to '{createServiceDto.Category}'");
            }

            try
            {
                var createdService = await _serviceService.CreateServiceAsync(createServiceDto);

                _logger.LogInformation($"Successfully created service with ID: {createdService.ServiceId}");
                return CreatedAtAction(
                    actionName: nameof(GetServiceById),
                    routeValues: new { id = createdService.ServiceId },
                    value: createdService
                );
            }
            catch (Exception ex)
            {
                // Log chi tiết exception
                _logger.LogError(ex, "Error creating service");

                // Thu thập thông tin chi tiết của exception
                var exceptionDetails = new
                {
                    Message = ex.Message,
                    StackTrace = ex.StackTrace,
                    InnerException = ex.InnerException?.Message
                };

                return BadRequest(new
                {
                    message = "Error creating service",
                    details = exceptionDetails
                });
            }
        }

        // PUT: api/Services/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromForm] UpdateServiceDto updateServiceDto)
        {
            // Log toàn bộ thông tin nhận được
            _logger.LogInformation($"Attempting to update service with ID: {id}");
            _logger.LogInformation($"Name: {updateServiceDto.Name}");
            _logger.LogInformation($"Description: {updateServiceDto.Description}");
            _logger.LogInformation($"Category: {updateServiceDto.Category}");
            _logger.LogInformation($"Price: {updateServiceDto.Price}");
            _logger.LogInformation($"Duration: {updateServiceDto.Duration}");
            _logger.LogInformation($"Photo is null: {updateServiceDto.Photo == null}");

            // Log chi tiết ModelState nếu không hợp lệ
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning("Validation Errors:");
                foreach (var error in errors)
                {
                    _logger.LogWarning(error);
                }

                return BadRequest(new
                {
                    message = "Validation failed",
                    errors = errors
                });
            }

            // Normalize category to ensure it's in English
            var validCategories = new[] { "Grooming", "Healthcare", "Training", "Boarding", "DayCare", "Other" };
            if (!validCategories.Contains(updateServiceDto.Category))
            {
                // Attempt to map Vietnamese category to English
                var originalCategory = updateServiceDto.Category;
                updateServiceDto.Category = MapCategoryToEnglish(updateServiceDto.Category);
                _logger.LogInformation($"Mapped category from '{originalCategory}' to '{updateServiceDto.Category}'");
            }

            try
            {
                var updatedService = await _serviceService.UpdateServiceAsync(id, updateServiceDto);
                if (updatedService == null)
                {
                    _logger.LogWarning($"Service with ID {id} not found or has been deleted");
                    return NotFound("Service not found or has been deleted");
                }

                _logger.LogInformation($"Successfully updated service with ID: {id}");
                return Ok(updatedService);
            }
            catch (Exception ex)
            {
                // Log chi tiết exception
                _logger.LogError(ex, $"Error updating service with ID {id}");

                // Thu thập thông tin chi tiết của exception
                var exceptionDetails = new
                {
                    Message = ex.Message,
                    StackTrace = ex.StackTrace,
                    InnerException = ex.InnerException?.Message
                };

                return BadRequest(new
                {
                    message = "Error updating service",
                    details = exceptionDetails
                });
            }
        }

        // POST: api/Services/{id}/view
        [HttpPost("{id}/view")]
        public async Task<IActionResult> IncrementViewCount(int id)
        {
            try
            {
                var result = await _serviceService.IncrementViewCountAsync(id);
                if (!result)
                {
                    _logger.LogWarning($"Service with ID {id} not found");
                    return NotFound("Service not found");
                }

                _logger.LogInformation($"Successfully incremented view count for service ID: {id}");
                return Ok(new { message = "View count incremented successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error incrementing view count for service ID {id}");
                return BadRequest(new
                {
                    message = "Error incrementing view count",
                    details = ex.Message
                });
            }
        }

        // POST: api/Services/{id}/booking
        [HttpPost("{id}/booking")]
        public async Task<IActionResult> IncrementBookingCount(int id)
        {
            try
            {
                var result = await _serviceService.IncrementBookingCountAsync(id);
                if (!result)
                {
                    _logger.LogWarning($"Service with ID {id} not found");
                    return NotFound("Service not found");
                }

                _logger.LogInformation($"Successfully incremented booking count for service ID: {id}");
                return Ok(new { message = "Booking count incremented successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error incrementing booking count for service ID {id}");
                return BadRequest(new
                {
                    message = "Error incrementing booking count",
                    details = ex.Message
                });
            }
        }

        // DELETE: api/Services/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            try
            {
                var result = await _serviceService.DeleteServiceAsync(id);
                if (!result)
                {
                    _logger.LogWarning($"Service with ID {id} not found or already deleted");
                    return NotFound("Service not found or has been deleted");
                }

                _logger.LogInformation($"Successfully deleted service with ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                // Log chi tiết exception
                _logger.LogError(ex, $"Error deleting service with ID {id}");

                // Thu thập thông tin chi tiết của exception
                var exceptionDetails = new
                {
                    Message = ex.Message,
                    StackTrace = ex.StackTrace,
                    InnerException = ex.InnerException?.Message
                };

                return BadRequest(new
                {
                    message = "Error deleting service",
                    details = exceptionDetails
                });
            }
        }

        // Helper method to map Vietnamese category to English
        private string MapCategoryToEnglish(string category)
        {
            _logger.LogInformation($"Attempting to map category: {category}");

            var mappedCategory = category switch
            {
                "Chăm sóc & Làm đẹp" => "Grooming",
                "Y tế & Sức khỏe" => "Healthcare",
                "Huấn luyện" => "Training",
                "Trông giữ qua đêm" => "Boarding",
                "Trông giữ ban ngày" => "DayCare",
                "Dịch vụ khác" => "Other",
                _ => category // Return original if no match
            };

            _logger.LogInformation($"Mapped category result: {mappedCategory}");
            return mappedCategory;
        }
    }
}