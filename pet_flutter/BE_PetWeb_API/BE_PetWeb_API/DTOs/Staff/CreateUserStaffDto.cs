using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Staff
{
    public class CreateUserStaffDto
    {
        // Thông tin User
        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [StringLength(15)]
        public string? Phone { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        // Thông tin Staff
        [Required]
        [StringLength(100)]
        public string Specialization { get; set; }

        [StringLength(500)]
        public string? Bio { get; set; }

        [Range(0, 50)]
        public int? Experience { get; set; }

        // Avatar cho User
        public IFormFile? Avatar { get; set; }

        // Danh sách Service IDs để gán cho Staff
        public List<int>? ServiceIds { get; set; }
    }
} 