using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Review
{
    public class UpdateReviewDto
    {
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int? Rating { get; set; }

        public string Comment { get; set; }

        // Thêm trường Images để cập nhật ảnh kèm theo review (optional)
        public List<string> Images { get; set; } = new List<string>();
    }
}