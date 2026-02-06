using Microsoft.AspNetCore.Http;

namespace BE_PetWeb_API.DTOs.Blog
{
    public class UpdateBlogPostDto
    {
        public string Title { get; set; }

        public string Content { get; set; }

        public IFormFile FeaturedImage { get; set; }

        public string Category { get; set; }

        public string Tags { get; set; }

        public string Status { get; set; }

        public bool KeepExistingImage { get; set; } = true;
    }
}