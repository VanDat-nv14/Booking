using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IPasswordResetService
    {
        /// <summary>
        /// Tạo token đặt lại mật khẩu
        /// </summary>
        /// <param name="email">Email người dùng</param>
        /// <returns>Token đặt lại mật khẩu</returns>
        Task<string> GeneratePasswordResetToken(string email);

        /// <summary>
        /// Xác thực và đặt lại mật khẩu
        /// </summary>
        /// <param name="email">Email người dùng</param>
        /// <param name="token">Token đặt lại mật khẩu</param>
        /// <param name="newPassword">Mật khẩu mới</param>
        /// <returns>Kết quả đặt lại mật khẩu</returns>
        Task<bool> ResetPassword(string email, string token, string newPassword);

        /// <summary>
        /// Gửi email đặt lại mật khẩu
        /// </summary>
        /// <param name="email">Email người dùng</param>
        /// <param name="resetToken">Token đặt lại mật khẩu</param>
        Task SendPasswordResetEmail(string email, string resetToken);

        /// <summary>
        /// Tạo và gửi mã OTP đến email người dùng
        /// </summary>
        /// <param name="email">Email người dùng</param>
        /// <returns>Kết quả gửi OTP</returns>
        Task<bool> GenerateAndSendOtp(string email);

        /// <summary>
        /// Xác thực mã OTP
        /// </summary>
        /// <param name="email">Email người dùng</param>
        /// <param name="otp">Mã OTP</param>
        /// <returns>Kết quả xác thực</returns>
        Task<bool> VerifyOtp(string email, string otp);

        /// <summary>
        /// Đặt lại mật khẩu sau khi xác thực OTP
        /// </summary>
        /// <param name="email">Email người dùng</param>
        /// <param name="otp">Mã OTP</param>
        /// <param name="newPassword">Mật khẩu mới</param>
        /// <returns>Kết quả đặt lại mật khẩu</returns>
        Task<bool> ResetPasswordWithOtp(string email, string otp, string newPassword);
    }
}