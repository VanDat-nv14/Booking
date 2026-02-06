using System;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Vaccination
{
    public class CreateVaccinationDto
    {
        [Required]
        public int PetId { get; set; }

        [Required]
        public string VaccineName { get; set; }

        [Required]
        public DateTime VaccineDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int? AdministeredBy { get; set; }

        public string Notes { get; set; }
    }
}