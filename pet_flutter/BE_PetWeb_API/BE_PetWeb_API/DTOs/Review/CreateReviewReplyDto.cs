using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Review
{
    public class CreateReviewReplyDto
    {
        [Required]
        public int ReviewId { get; set; }

        [Required]
        [StringLength(1000, ErrorMessage = "Nội dung trả lời không được vượt quá 1000 ký tự")]
        public string ReplyContent { get; set; }
    }
} 