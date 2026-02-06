using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Blog
{
    public class CreateCommentDto
    {
        [Required]
        public int PostId { get; set; }

        [Required]
        public string Content { get; set; }
    }
}