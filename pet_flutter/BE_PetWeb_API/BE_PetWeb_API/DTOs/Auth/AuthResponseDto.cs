namespace BE_PetWeb_API.DTOs.Auth
{
    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public string Token { get; set; }
        public int? StaffId { get; set; } // Thêm StaffId cho staff users
    }
}
