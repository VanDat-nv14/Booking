using BE_PetWeb_API.DTOs.Auth;
using BE_PetWeb_API.Models;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> Register(RegisterDto registerDto);
        Task<AuthResponseDto> Login(LoginDto loginDto);
        Task<AuthResponseDto> ExternalLogin(ExternalAuthDto externalAuth);
        Task<bool> ChangePassword(int userId, string currentPassword, string newPassword);
        // Các phương thức khác nếu có...


    }
}