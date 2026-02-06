using BE_PetWeb_API.DTOs.Reminder;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ReminderService : IReminderService
    {
        private readonly PetWebContext _context;

        public ReminderService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReminderDto>> GetAllRemindersAsync()
        {
            var reminders = await _context.PetCareReminders
                .Include(r => r.Pet)
                .OrderBy(r => r.ReminderDate)
                .ToListAsync();

            return reminders.Select(MapToReminderDto);
        }

        public async Task<ReminderDto> GetReminderByIdAsync(int id)
        {
            var reminder = await _context.PetCareReminders
                .Include(r => r.Pet)
                .FirstOrDefaultAsync(r => r.ReminderId == id);

            if (reminder == null)
                return null;

            return MapToReminderDto(reminder);
        }

        public async Task<IEnumerable<ReminderDto>> GetRemindersByPetIdAsync(int petId)
        {
            var reminders = await _context.PetCareReminders
                .Include(r => r.Pet)
                .Where(r => r.PetId == petId)
                .OrderBy(r => r.ReminderDate)
                .ToListAsync();

            return reminders.Select(MapToReminderDto);
        }

        public async Task<IEnumerable<ReminderDto>> GetRemindersByUserIdAsync(int userId)
        {
            var reminders = await _context.PetCareReminders
                .Include(r => r.Pet)
                .Where(r => r.Pet.UserId == userId)
                .OrderBy(r => r.ReminderDate)
                .ToListAsync();

            return reminders.Select(MapToReminderDto);
        }

        public async Task<IEnumerable<ReminderDto>> GetUpcomingRemindersAsync(int userId, int days)
        {
            var maxDate = DateTime.Now.AddDays(days);

            var reminders = await _context.PetCareReminders
                .Include(r => r.Pet)
                .Where(r => r.Pet.UserId == userId &&
                            r.Status == "Active" &&
                            r.ReminderDate >= DateTime.Now &&
                            r.ReminderDate <= maxDate)
                .OrderBy(r => r.ReminderDate)
                .ToListAsync();

            return reminders.Select(MapToReminderDto);
        }

        public async Task<ReminderDto> CreateReminderAsync(CreateReminderDto createReminderDto)
        {
            // Kiểm tra pet có tồn tại không
            var pet = await _context.Pets.FindAsync(createReminderDto.PetId);
            if (pet == null)
                throw new Exception("Thú cưng không tồn tại");

            // Tạo nhắc nhở mới
            var reminder = new PetCareReminder
            {
                PetId = createReminderDto.PetId,
                ReminderType = createReminderDto.ReminderType,
                Title = createReminderDto.Title,
                Description = createReminderDto.Description,
                ReminderDate = createReminderDto.ReminderDate,
                Frequency = createReminderDto.Frequency,
                Status = createReminderDto.Status,
                CreatedAt = DateTime.Now
            };

            _context.PetCareReminders.Add(reminder);
            await _context.SaveChangesAsync();

            return await GetReminderByIdAsync(reminder.ReminderId);
        }

        public async Task<ReminderDto> UpdateReminderAsync(int id, UpdateReminderDto updateReminderDto)
        {
            var reminder = await _context.PetCareReminders.FindAsync(id);
            if (reminder == null)
                throw new Exception("Nhắc nhở không tồn tại");

            // Cập nhật thông tin
            if (!string.IsNullOrEmpty(updateReminderDto.ReminderType))
                reminder.ReminderType = updateReminderDto.ReminderType;

            if (!string.IsNullOrEmpty(updateReminderDto.Title))
                reminder.Title = updateReminderDto.Title;

            if (updateReminderDto.Description != null) // Cho phép cập nhật thành chuỗi rỗng
                reminder.Description = updateReminderDto.Description;

            if (updateReminderDto.ReminderDate.HasValue)
                reminder.ReminderDate = updateReminderDto.ReminderDate.Value;

            if (!string.IsNullOrEmpty(updateReminderDto.Frequency))
                reminder.Frequency = updateReminderDto.Frequency;

            if (!string.IsNullOrEmpty(updateReminderDto.Status))
                reminder.Status = updateReminderDto.Status;

            _context.PetCareReminders.Update(reminder);
            await _context.SaveChangesAsync();

            return await GetReminderByIdAsync(id);
        }

        public async Task<bool> DeleteReminderAsync(int id)
        {
            var reminder = await _context.PetCareReminders.FindAsync(id);
            if (reminder == null)
                return false;

            _context.PetCareReminders.Remove(reminder);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<ReminderDto> UpdateReminderStatusAsync(int id, string status)
        {
            var reminder = await _context.PetCareReminders.FindAsync(id);
            if (reminder == null)
                throw new Exception("Nhắc nhở không tồn tại");

            // Kiểm tra trạng thái hợp lệ
            var validStatuses = new[] { "Active", "Completed", "Cancelled" };
            if (!validStatuses.Contains(status))
                throw new Exception("Trạng thái không hợp lệ");

            reminder.Status = status;
            _context.PetCareReminders.Update(reminder);
            await _context.SaveChangesAsync();

            return await GetReminderByIdAsync(id);
        }

        private ReminderDto MapToReminderDto(PetCareReminder reminder)
        {
            return new ReminderDto
            {
                ReminderId = reminder.ReminderId,
                PetId = reminder.PetId,
                PetName = reminder.Pet?.Name,
                ReminderType = reminder.ReminderType,
                Title = reminder.Title,
                Description = reminder.Description,
                ReminderDate = reminder.ReminderDate,
                Frequency = reminder.Frequency,
                Status = reminder.Status,
                CreatedAt = reminder.CreatedAt
            };
        }
    }
}