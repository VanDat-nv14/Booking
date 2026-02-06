using System;

namespace BE_PetWeb_API.DTOs.Vaccination
{
    public class VaccinationDto
    {
        public int VaccinationId { get; set; }
        public int PetId { get; set; }
        public string PetName { get; set; }
        public string VaccineName { get; set; }
        public DateTime VaccineDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? AdministeredBy { get; set; }
        public string AdministeredByName { get; set; }
        public string Notes { get; set; }
    }
}