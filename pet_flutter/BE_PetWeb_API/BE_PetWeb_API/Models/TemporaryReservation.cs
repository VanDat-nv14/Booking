using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_PetWeb_API.Models
{
    [Table("TemporaryReservations")]
    public class TemporaryReservation
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string SessionId { get; set; } // Session ID của user đang giữ chỗ
        
        [Required]
        public int ServiceId { get; set; }
        
        public int? StaffId { get; set; } // Có thể null nếu chưa chọn staff
        
        [Required]
        public DateTime SlotStartTime { get; set; }
        
        [Required]
        public DateTime SlotEndTime { get; set; }
        
        [Required]
        public DateTime ReservedAt { get; set; } // Thời gian bắt đầu giữ chỗ
        
        [Required]
        public DateTime ExpiresAt { get; set; } // Thời gian hết hạn (thường là 5-10 phút)
        
        public string UserName { get; set; } // Tên người dùng để hiển thị
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        [ForeignKey("ServiceId")]
        public virtual Service Service { get; set; }
        
        [ForeignKey("StaffId")]
        public virtual Staff Staff { get; set; }
    }
} 
