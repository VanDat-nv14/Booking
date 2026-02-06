using System;

namespace BE_PetWeb_API.DTOs.Review
{
    public class ReviewReplyDto
    {
        public int ReplyId { get; set; }
        public int ReviewId { get; set; }
        public int AdminUserId { get; set; }
        public string AdminUserName { get; set; }
        public string AdminUserAvatar { get; set; }
        public string ReplyContent { get; set; }
        public DateTime? ReplyDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 