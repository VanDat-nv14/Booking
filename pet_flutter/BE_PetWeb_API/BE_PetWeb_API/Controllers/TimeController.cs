using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BE_PetWeb_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeController : ControllerBase
    {
        private readonly IDateTimeService _dateTimeService;

        public TimeController(IDateTimeService dateTimeService)
        {
            _dateTimeService = dateTimeService;
        }

        [HttpGet("vietnam-time")]
        public IActionResult GetVietnamTime()
        {
            return Ok(new
            {
                VietnamTime = _dateTimeService.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                UtcTime = _dateTimeService.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                TimeZone = _dateTimeService.GetVietnamTimeZoneId(),
                Message = "Thời gian Việt Nam (UTC+7)"
            });
        }
    }
} 