using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Review
{
    public class CreateReviewDto
    {
        public int? ServiceId { get; set; }
        public int? ProductId { get; set; }
        public int? AppointmentId { get; set; }
        public int? OrderId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; }

        // Thêm trường Images để gửi ảnh kèm theo review (optional)
        public List<string> Images { get; set; } = new List<string>();
    }
}