using BE_PetWeb_API.DTOs.Auth;  // Sử dụng namespace Auth
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/password")]
    [ApiController]
    public class PasswordController : ControllerBase
    {
        private readonly IPasswordResetService _passwordResetService;

        public PasswordController(IPasswordResetService passwordResetService)
        {
            _passwordResetService = passwordResetService;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            try
            {
                // Tạo token đặt lại mật khẩu
                var resetToken = await _passwordResetService.GeneratePasswordResetToken(request.Email);

                // Gửi email với token
                await _passwordResetService.SendPasswordResetEmail(request.Email, resetToken);

                return Ok(new { message = "Email đặt lại mật khẩu đã được gửi." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
            try
            {
                bool result = await _passwordResetService.ResetPassword(
                    request.Email,
                    request.Token,
                    request.NewPassword);

                if (result)
                {
                    return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
                }

                return BadRequest(new { message = "Không thể đặt lại mật khẩu." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] ForgotPasswordDto request)
        {
            try
            {
                bool result = await _passwordResetService.GenerateAndSendOtp(request.Email);

                if (result)
                {
                    return Ok(new { message = "Mã OTP đã được gửi đến email của bạn." });
                }

                return BadRequest(new { message = "Không thể gửi mã OTP." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto request)
        {
            try
            {
                bool result = await _passwordResetService.VerifyOtp(request.Email, request.Otp);

                if (result)
                {
                    return Ok(new { message = "Mã OTP hợp lệ." });
                }

                return BadRequest(new { message = "Mã OTP không hợp lệ." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password-with-otp")]
        public async Task<IActionResult> ResetPasswordWithOtp([FromBody] SetNewPasswordDto request)
        {
            try
            {
                bool result = await _passwordResetService.ResetPasswordWithOtp(
                    request.Email,
                    request.Otp,
                    request.NewPassword);

                if (result)
                {
                    return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
                }

                return BadRequest(new { message = "Không thể đặt lại mật khẩu." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}