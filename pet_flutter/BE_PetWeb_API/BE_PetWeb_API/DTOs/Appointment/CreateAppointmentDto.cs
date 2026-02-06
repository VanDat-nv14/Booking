using System;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class CreateAppointmentDto
    {
        [Required]
        public int PetId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        public int? StaffId { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        public string? Notes { get; set; }
    }
}