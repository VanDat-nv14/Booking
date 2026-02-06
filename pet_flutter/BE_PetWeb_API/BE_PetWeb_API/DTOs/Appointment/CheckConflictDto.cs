using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class CheckConflictDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int Duration { get; set; }

        public int? StaffId { get; set; }

        public int? PetId { get; set; }
    }
}
