using BE_PetWeb_API.DTOs.Auth;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            try
            {
                var result = await _authService.Register(registerDto);
                return Ok(result);
            }
            catch (DbUpdateException ex)
            {
                // Xử lý lỗi cơ sở dữ liệu
                string errorMessage = ex.InnerException?.Message ?? ex.Message;

                // Kiểm tra lỗi trùng lặp username hoặc email
                if (errorMessage.Contains("UQ__Users__536C85E4") || errorMessage.Contains("Username"))
                {
                    return BadRequest("Username đã tồn tại trong hệ thống");
                }
                else if (errorMessage.Contains("UQ__Users__A9D10534") || errorMessage.Contains("Email"))
                {
                    return BadRequest("Email đã tồn tại trong hệ thống");
                }

                return BadRequest($"Lỗi cơ sở dữ liệu: {errorMessage}");
            }
            catch (Exception ex)
            {
                // Xử lý các lỗi khác
                return BadRequest($"Lỗi: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            try
            {
                // Log thông tin đăng nhập
                Console.WriteLine($"Thông tin đăng nhập - UsernameOrEmail: {loginDto.UsernameOrEmail}");

                var result = await _authService.Login(loginDto);

                // Log để kiểm tra
                Console.WriteLine($"Login Result - Role: {result.Role}");

                return Ok(new
                {
                    token = result.Token,
                    user = new
                    {
                        userId = result.UserId,
                        username = result.Username,
                        fullName = result.FullName,
                        email = result.Email,
                        role = result.Role, // Quan trọng: trả về role
                        isActive = true,
                        staffId = result.StaffId // Thêm staffId
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("external-login")]
        public async Task<ActionResult<AuthResponseDto>> ExternalLogin(ExternalAuthDto externalAuth)
        {
            try
            {
                // Log thông tin đăng nhập từ bên ngoài
                Console.WriteLine($"External Login - Provider: {externalAuth.Provider}, Email: {externalAuth.Email}");

                var result = await _authService.ExternalLogin(externalAuth);

                // Log để kiểm tra
                Console.WriteLine($"External Login Result - Role: {result.Role}");

                return Ok(new
                {
                    token = result.Token,
                    user = new
                    {
                        userId = result.UserId,
                        username = result.Username,
                        fullName = result.FullName,
                        email = result.Email,
                        role = result.Role,
                        isActive = true
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"External Login Error: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }
    }
}