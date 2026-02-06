using BE_PetWeb_API.DTOs.Vaccination;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class VaccinationService : IVaccinationService
    {
        private readonly PetWebContext _context;

        public VaccinationService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VaccinationDto>> GetAllVaccinationsAsync()
        {
            var vaccinations = await _context.Vaccinations
                .Include(v => v.Pet)
                .Include(v => v.AdministeredByNavigation)
                    .ThenInclude(s => s.User)
                .OrderByDescending(v => v.VaccineDate)
                .ToListAsync();

            return vaccinations.Select(MapToVaccinationDto);
        }

        public async Task<VaccinationDto> GetVaccinationByIdAsync(int id)
        {
            var vaccination = await _context.Vaccinations
                .Include(v => v.Pet)
                .Include(v => v.AdministeredByNavigation)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(v => v.VaccinationId == id);

            if (vaccination == null)
                return null;

            return MapToVaccinationDto(vaccination);
        }

        public async Task<IEnumerable<VaccinationDto>> GetVaccinationsByPetIdAsync(int petId)
        {
            var vaccinations = await _context.Vaccinations
                .Include(v => v.Pet)
                .Include(v => v.AdministeredByNavigation)
                    .ThenInclude(s => s.User)
                .Where(v => v.PetId == petId)
                .OrderByDescending(v => v.VaccineDate)
                .ToListAsync();

            return vaccinations.Select(MapToVaccinationDto);
        }

        public async Task<VaccinationDto> CreateVaccinationAsync(CreateVaccinationDto createVaccinationDto)
        {
            // Kiểm tra pet có tồn tại không
            var pet = await _context.Pets.FindAsync(createVaccinationDto.PetId);
            if (pet == null)
                throw new Exception("Thú cưng không tồn tại");

            // Kiểm tra nhân viên tiêm nếu có
            if (createVaccinationDto.AdministeredBy.HasValue)
            {
                var staff = await _context.Staff.FindAsync(createVaccinationDto.AdministeredBy.Value);
                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại");
            }

            // Chuyển đổi từ DateTime sang DateOnly
            DateOnly vaccineDate = DateOnly.FromDateTime(createVaccinationDto.VaccineDate);

            DateOnly? expiryDate = null;
            if (createVaccinationDto.ExpiryDate.HasValue)
            {
                expiryDate = DateOnly.FromDateTime(createVaccinationDto.ExpiryDate.Value);
            }

            // Tạo bản ghi tiêm chủng mới
            var vaccination = new Vaccination
            {
                PetId = createVaccinationDto.PetId,
                VaccineName = createVaccinationDto.VaccineName,
                VaccineDate = vaccineDate,
                ExpiryDate = expiryDate,
                AdministeredBy = createVaccinationDto.AdministeredBy,
                Notes = createVaccinationDto.Notes
            };

            _context.Vaccinations.Add(vaccination);
            await _context.SaveChangesAsync();

            // Tạo reminder cho tiêm chủng tiếp theo nếu có ngày hết hạn
            if (expiryDate.HasValue)
            {
                try
                {
                    var reminder = new PetCareReminder
                    {
                        PetId = createVaccinationDto.PetId,
                        ReminderType = "Vaccination",
                        Title = $"Tiêm chủng {createVaccinationDto.VaccineName}",
                        Description = $"Tiêm nhắc lại {createVaccinationDto.VaccineName} đã hết hạn.",
                        ReminderDate = expiryDate.Value.ToDateTime(new TimeOnly(9, 0)),
                        Frequency = "Once",
                        Status = "Active",
                        CreatedAt = DateTime.Now
                    };

                    _context.PetCareReminders.Add(reminder);
                    await _context.SaveChangesAsync();
                }
                catch
                {
                    // Bỏ qua lỗi khi tạo reminder, vẫn cho phép tạo bản ghi tiêm chủng
                }
            }

            return await GetVaccinationByIdAsync(vaccination.VaccinationId);
        }

        public async Task<VaccinationDto> UpdateVaccinationAsync(int id, UpdateVaccinationDto updateVaccinationDto)
        {
            var vaccination = await _context.Vaccinations.FindAsync(id);
            if (vaccination == null)
                throw new Exception("Bản ghi tiêm chủng không tồn tại");

            // Kiểm tra nhân viên tiêm nếu có
            if (updateVaccinationDto.AdministeredBy.HasValue)
            {
                var staff = await _context.Staff.FindAsync(updateVaccinationDto.AdministeredBy.Value);
                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại");

                vaccination.AdministeredBy = updateVaccinationDto.AdministeredBy;
            }

            // Cập nhật thông tin
            if (!string.IsNullOrEmpty(updateVaccinationDto.VaccineName))
                vaccination.VaccineName = updateVaccinationDto.VaccineName;

            if (updateVaccinationDto.VaccineDate.HasValue)
                vaccination.VaccineDate = DateOnly.FromDateTime(updateVaccinationDto.VaccineDate.Value);

            if (updateVaccinationDto.ExpiryDate.HasValue)
                vaccination.ExpiryDate = DateOnly.FromDateTime(updateVaccinationDto.ExpiryDate.Value);
            else if (updateVaccinationDto.ExpiryDate == null)
                vaccination.ExpiryDate = null;

            if (updateVaccinationDto.Notes != null) // Cho phép cập nhật thành chuỗi rỗng
                vaccination.Notes = updateVaccinationDto.Notes;

            _context.Vaccinations.Update(vaccination);
            await _context.SaveChangesAsync();

            return await GetVaccinationByIdAsync(id);
        }

        public async Task<bool> DeleteVaccinationAsync(int id)
        {
            var vaccination = await _context.Vaccinations.FindAsync(id);
            if (vaccination == null)
                return false;

            _context.Vaccinations.Remove(vaccination);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<VaccinationDto>> GetUpcomingExpirationsAsync(int days)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var futureDate = DateOnly.FromDateTime(DateTime.Today.AddDays(days));

            var vaccinations = await _context.Vaccinations
                .Include(v => v.Pet)
                .Include(v => v.AdministeredByNavigation)
                    .ThenInclude(s => s.User)
                .Where(v => v.ExpiryDate.HasValue &&
                            v.ExpiryDate.Value >= today &&
                            v.ExpiryDate.Value <= futureDate)
                .OrderBy(v => v.ExpiryDate)
                .ToListAsync();

            return vaccinations.Select(MapToVaccinationDto);
        }

        public async Task<IEnumerable<VaccinationDto>> GetVaccinationsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var startDateOnly = DateOnly.FromDateTime(startDate);
            var endDateOnly = DateOnly.FromDateTime(endDate);

            var vaccinations = await _context.Vaccinations
                .Include(v => v.Pet)
                .Include(v => v.AdministeredByNavigation)
                    .ThenInclude(s => s.User)
                .Where(v => v.VaccineDate >= startDateOnly && v.VaccineDate <= endDateOnly)
                .OrderByDescending(v => v.VaccineDate)
                .ToListAsync();

            return vaccinations.Select(MapToVaccinationDto);
        }

        private VaccinationDto MapToVaccinationDto(Vaccination vaccination)
        {
            // Chuyển đổi từ DateOnly sang DateTime
            var vaccineDate = vaccination.VaccineDate.ToDateTime(new TimeOnly(0, 0));

            DateTime? expiryDate = null;
            if (vaccination.ExpiryDate.HasValue)
            {
                expiryDate = vaccination.ExpiryDate.Value.ToDateTime(new TimeOnly(0, 0));
            }

            return new VaccinationDto
            {
                VaccinationId = vaccination.VaccinationId,
                PetId = vaccination.PetId,
                PetName = vaccination.Pet?.Name,
                VaccineName = vaccination.VaccineName,
                VaccineDate = vaccineDate,
                ExpiryDate = expiryDate,
                AdministeredBy = vaccination.AdministeredBy,
                AdministeredByName = vaccination.AdministeredByNavigation?.User?.FullName,
                Notes = vaccination.Notes
            };
        }
    }
}