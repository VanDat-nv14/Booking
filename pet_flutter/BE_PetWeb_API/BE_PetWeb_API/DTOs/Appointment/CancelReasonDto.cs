using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Appointment
{
    public class CancelReasonDto
    {
        [Required]
        public string Reason { get; set; }
    }
}
