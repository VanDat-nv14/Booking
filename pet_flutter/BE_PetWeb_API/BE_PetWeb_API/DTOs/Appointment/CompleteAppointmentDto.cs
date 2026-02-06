using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class CompleteAppointmentDto
    {
        [Required]
        public DateTime ActualCompletionTime { get; set; }

        public string Notes { get; set; }
    }
}
