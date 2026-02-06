using System;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.MedicalRecord
{
    public class CreateMedicalRecordDto
    {
        [Required]
        public int PetId { get; set; }

        public int? StaffId { get; set; }

        public DateTime? RecordDate { get; set; } = DateTime.Now;

        [Required]
        public string Diagnosis { get; set; }

        public string Treatment { get; set; }

        public string Prescription { get; set; }

        public string Notes { get; set; }

        public DateTime? NextVisit { get; set; }
    }
}