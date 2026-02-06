using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Blog
{
    public class CreateBlogPostDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public IFormFile FeaturedImage { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; }

        public string Tags { get; set; }

        public string Status { get; set; } = "Draft";
    }
}