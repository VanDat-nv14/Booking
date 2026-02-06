using BE_PetWeb_API.DTOs.Vaccination;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IVaccinationService
    {
        Task<IEnumerable<VaccinationDto>> GetAllVaccinationsAsync();
        Task<VaccinationDto> GetVaccinationByIdAsync(int id);
        Task<IEnumerable<VaccinationDto>> GetVaccinationsByPetIdAsync(int petId);
        Task<VaccinationDto> CreateVaccinationAsync(CreateVaccinationDto createVaccinationDto);
        Task<VaccinationDto> UpdateVaccinationAsync(int id, UpdateVaccinationDto updateVaccinationDto);
        Task<bool> DeleteVaccinationAsync(int id);
        Task<IEnumerable<VaccinationDto>> GetUpcomingExpirationsAsync(int days);
        Task<IEnumerable<VaccinationDto>> GetVaccinationsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}