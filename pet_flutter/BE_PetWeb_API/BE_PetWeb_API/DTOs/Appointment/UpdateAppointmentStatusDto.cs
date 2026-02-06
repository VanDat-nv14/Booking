using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class UpdateAppointmentStatusDto
    {
        [Required]
        public string Status { get; set; }

        public string? Notes { get; set; } // Make nullable to avoid required validation
    }
}