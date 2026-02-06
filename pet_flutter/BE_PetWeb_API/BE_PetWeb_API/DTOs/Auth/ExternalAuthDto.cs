using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Auth
{
    public class ExternalAuthDto
    {
        [Required]
        public string Provider { get; set; }  // "Google", "Facebook", etc.

        [Required]
        public string IdToken { get; set; }   // Token từ provider

        [Required]
        public string Email { get; set; }     // Email từ provider  

        public string Name { get; set; }      // Tên từ provider

        public string Picture { get; set; }   // URL ảnh đại diện (nếu có)
    }
}
