using BE_PetWeb_API.DTOs.MedicalRecord;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IMedicalRecordService
    {
        Task<IEnumerable<MedicalRecordDto>> GetAllMedicalRecordsAsync();
        Task<MedicalRecordDto> GetMedicalRecordByIdAsync(int id);
        Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByPetIdAsync(int petId);
        Task<MedicalRecordDto> CreateMedicalRecordAsync(CreateMedicalRecordDto createMedicalRecordDto);
        Task<MedicalRecordDto> UpdateMedicalRecordAsync(int id, UpdateMedicalRecordDto updateMedicalRecordDto);
        Task<bool> DeleteMedicalRecordAsync(int id);
        Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}