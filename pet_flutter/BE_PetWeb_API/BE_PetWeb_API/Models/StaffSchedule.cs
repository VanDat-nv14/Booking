using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.Models
{
    public class StaffSchedule
    {
        [Key]
        public int ScheduleId { get; set; }

        [Required]
        public int StaffId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public bool IsWorking { get; set; } = true;

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }

        public string Notes { get; set; }

        [ForeignKey("StaffId")]
        public virtual Staff Staff { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
