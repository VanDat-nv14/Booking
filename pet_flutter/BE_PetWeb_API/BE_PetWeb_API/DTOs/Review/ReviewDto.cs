using System;
using System.Collections.Generic;

namespace BE_PetWeb_API.DTOs.Review
{
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public int? ServiceId { get; set; }
        public string ServiceName { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public int? AppointmentId { get; set; }
        public int? OrderId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime? ReviewDate { get; set; }
        public bool HasPurchased { get; set; } = false;
        public List<ReviewReplyDto> Replies { get; set; } = new List<ReviewReplyDto>();
        public bool HasAdminReply => Replies?.Count > 0;
        
        // Thêm trường Images để hiển thị ảnh kèm theo review
        public List<string> Images { get; set; } = new List<string>();
    }
}