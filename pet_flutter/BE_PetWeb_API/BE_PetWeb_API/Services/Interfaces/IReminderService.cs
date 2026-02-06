using BE_PetWeb_API.DTOs.Reminder;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IReminderService
    {
        Task<IEnumerable<ReminderDto>> GetAllRemindersAsync();
        Task<ReminderDto> GetReminderByIdAsync(int id);
        Task<IEnumerable<ReminderDto>> GetRemindersByPetIdAsync(int petId);
        Task<IEnumerable<ReminderDto>> GetRemindersByUserIdAsync(int userId);
        Task<IEnumerable<ReminderDto>> GetUpcomingRemindersAsync(int userId, int days);
        Task<ReminderDto> CreateReminderAsync(CreateReminderDto createReminderDto);
        Task<ReminderDto> UpdateReminderAsync(int id, UpdateReminderDto updateReminderDto);
        Task<bool> DeleteReminderAsync(int id);
        Task<ReminderDto> UpdateReminderStatusAsync(int id, string status);
    }
}