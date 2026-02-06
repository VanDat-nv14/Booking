using BE_PetWeb_API.DTOs.Staff;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IStaffService
    {
        Task<IEnumerable<StaffDto>> GetAllStaffAsync();
        Task<StaffDto> GetStaffByIdAsync(int id);
        Task<StaffDto> GetStaffByUserIdAsync(int userId);
        Task<StaffDto> CreateStaffAsync(CreateStaffDto createStaffDto);
        Task<StaffDto> CreateUserStaffAsync(CreateUserStaffDto createUserStaffDto);
        Task<StaffDto> UpdateStaffAsync(int id, UpdateStaffDto updateStaffDto);
        Task<bool> DeleteStaffAsync(int id);
        Task<IEnumerable<StaffDto>> GetStaffBySpecializationAsync(string specialization);
        Task<IEnumerable<StaffDto>> GetStaffByServiceIdAsync(int serviceId);
        Task<bool> AssignServiceToStaffAsync(int staffId, int serviceId);
        Task<bool> RemoveServiceFromStaffAsync(int staffId, int serviceId);
    }
}