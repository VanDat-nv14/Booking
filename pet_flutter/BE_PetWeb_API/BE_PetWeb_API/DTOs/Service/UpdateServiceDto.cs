using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Service
{
    public class UpdateServiceDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        [Required]
        [Range(1, 1440)]
        public int Duration { get; set; }

        [Required]
        public string Category { get; set; }

        public IFormFile? Photo { get; set; }
    }
}