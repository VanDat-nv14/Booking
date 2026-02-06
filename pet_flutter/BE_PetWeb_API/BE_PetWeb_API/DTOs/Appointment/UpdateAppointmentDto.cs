using System;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class UpdateAppointmentDto
    {
        public int? PetId { get; set; }

        public int? ServiceId { get; set; }

        public int? StaffId { get; set; }

        public DateTime? AppointmentDate { get; set; }

        public string Status { get; set; }

        public string Notes { get; set; }
    }
}