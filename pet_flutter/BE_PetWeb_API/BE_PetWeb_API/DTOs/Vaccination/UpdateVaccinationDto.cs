using System;

namespace BE_PetWeb_API.DTOs.Vaccination
{
    public class UpdateVaccinationDto
    {
        public string VaccineName { get; set; }

        public DateTime? VaccineDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int? AdministeredBy { get; set; }

        public string Notes { get; set; }
    }
}