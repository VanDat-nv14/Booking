using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Auth
{
    public class LoginDto
    {
        [Required]
        public string UsernameOrEmail { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
