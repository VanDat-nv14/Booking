using System;

namespace BE_PetWeb_API.DTOs.MedicalRecord
{
    public class UpdateMedicalRecordDto
    {
        public int? StaffId { get; set; }

        public DateTime? RecordDate { get; set; }

        public string Diagnosis { get; set; }

        public string Treatment { get; set; }

        public string Prescription { get; set; }

        public string Notes { get; set; }

        public DateTime? NextVisit { get; set; }
    }
}