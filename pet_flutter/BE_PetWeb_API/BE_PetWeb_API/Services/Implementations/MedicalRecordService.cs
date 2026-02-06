using BE_PetWeb_API.DTOs.MedicalRecord;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly PetWebContext _context;

        public MedicalRecordService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetAllMedicalRecordsAsync()
        {
            var medicalRecords = await _context.MedicalRecords
                .Include(mr => mr.Pet)
                .Include(mr => mr.Staff)
                    .ThenInclude(s => s.User)
                .OrderByDescending(mr => mr.RecordDate)
                .ToListAsync();

            return medicalRecords.Select(MapToMedicalRecordDto);
        }

        public async Task<MedicalRecordDto> GetMedicalRecordByIdAsync(int id)
        {
            var medicalRecord = await _context.MedicalRecords
                .Include(mr => mr.Pet)
                .Include(mr => mr.Staff)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(mr => mr.RecordId == id);

            if (medicalRecord == null)
                return null;

            return MapToMedicalRecordDto(medicalRecord);
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByPetIdAsync(int petId)
        {
            var medicalRecords = await _context.MedicalRecords
                .Include(mr => mr.Pet)
                .Include(mr => mr.Staff)
                    .ThenInclude(s => s.User)
                .Where(mr => mr.PetId == petId)
                .OrderByDescending(mr => mr.RecordDate)
                .ToListAsync();

            return medicalRecords.Select(MapToMedicalRecordDto);
        }

        public async Task<MedicalRecordDto> CreateMedicalRecordAsync(CreateMedicalRecordDto createMedicalRecordDto)
        {
            // Kiểm tra pet có tồn tại không
            var pet = await _context.Pets.FindAsync(createMedicalRecordDto.PetId);
            if (pet == null)
                throw new Exception("Thú cưng không tồn tại");

            // Kiểm tra nhân viên nếu có
            if (createMedicalRecordDto.StaffId.HasValue)
            {
                var staff = await _context.Staff.FindAsync(createMedicalRecordDto.StaffId.Value);
                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại");
            }

            // Chuyển đổi NextVisit từ DateTime? sang DateOnly?
            DateOnly? nextVisitDate = null;
            if (createMedicalRecordDto.NextVisit.HasValue)
            {
                nextVisitDate = DateOnly.FromDateTime(createMedicalRecordDto.NextVisit.Value);
            }

            // Tạo hồ sơ y tế mới
            var medicalRecord = new MedicalRecord
            {
                PetId = createMedicalRecordDto.PetId,
                StaffId = createMedicalRecordDto.StaffId,
                RecordDate = createMedicalRecordDto.RecordDate,
                Diagnosis = createMedicalRecordDto.Diagnosis,
                Treatment = createMedicalRecordDto.Treatment,
                Prescription = createMedicalRecordDto.Prescription,
                Notes = createMedicalRecordDto.Notes,
                NextVisit = nextVisitDate
            };

            _context.MedicalRecords.Add(medicalRecord);
            await _context.SaveChangesAsync();

            return await GetMedicalRecordByIdAsync(medicalRecord.RecordId);
        }

        public async Task<MedicalRecordDto> UpdateMedicalRecordAsync(int id, UpdateMedicalRecordDto updateMedicalRecordDto)
        {
            var medicalRecord = await _context.MedicalRecords.FindAsync(id);
            if (medicalRecord == null)
                throw new Exception("Hồ sơ y tế không tồn tại");

            // Kiểm tra nhân viên nếu có
            if (updateMedicalRecordDto.StaffId.HasValue)
            {
                var staff = await _context.Staff.FindAsync(updateMedicalRecordDto.StaffId.Value);
                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại");

                medicalRecord.StaffId = updateMedicalRecordDto.StaffId;
            }

            // Cập nhật thông tin
            if (updateMedicalRecordDto.RecordDate.HasValue)
                medicalRecord.RecordDate = updateMedicalRecordDto.RecordDate;

            if (!string.IsNullOrEmpty(updateMedicalRecordDto.Diagnosis))
                medicalRecord.Diagnosis = updateMedicalRecordDto.Diagnosis;

            if (!string.IsNullOrEmpty(updateMedicalRecordDto.Treatment))
                medicalRecord.Treatment = updateMedicalRecordDto.Treatment;

            if (updateMedicalRecordDto.Prescription != null) // Cho phép cập nhật thành chuỗi rỗng
                medicalRecord.Prescription = updateMedicalRecordDto.Prescription;

            if (updateMedicalRecordDto.Notes != null) // Cho phép cập nhật thành chuỗi rỗng
                medicalRecord.Notes = updateMedicalRecordDto.Notes;

            // Chuyển đổi NextVisit từ DateTime? sang DateOnly?
            if (updateMedicalRecordDto.NextVisit.HasValue)
                medicalRecord.NextVisit = DateOnly.FromDateTime(updateMedicalRecordDto.NextVisit.Value);

            _context.MedicalRecords.Update(medicalRecord);
            await _context.SaveChangesAsync();

            return await GetMedicalRecordByIdAsync(id);
        }

        public async Task<bool> DeleteMedicalRecordAsync(int id)
        {
            var medicalRecord = await _context.MedicalRecords.FindAsync(id);
            if (medicalRecord == null)
                return false;

            _context.MedicalRecords.Remove(medicalRecord);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<MedicalRecordDto>> GetMedicalRecordsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var medicalRecords = await _context.MedicalRecords
                .Include(mr => mr.Pet)
                .Include(mr => mr.Staff)
                    .ThenInclude(s => s.User)
                .Where(mr => mr.RecordDate.HasValue && mr.RecordDate >= startDate && mr.RecordDate <= endDate)
                .OrderByDescending(mr => mr.RecordDate)
                .ToListAsync();

            return medicalRecords.Select(MapToMedicalRecordDto);
        }

        private MedicalRecordDto MapToMedicalRecordDto(MedicalRecord medicalRecord)
        {
            // Chuyển đổi DateOnly? sang DateTime? nếu có giá trị
            DateTime? nextVisit = null;
            if (medicalRecord.NextVisit.HasValue)
            {
                nextVisit = new DateTime(
                    medicalRecord.NextVisit.Value.Year,
                    medicalRecord.NextVisit.Value.Month,
                    medicalRecord.NextVisit.Value.Day
                );
            }

            return new MedicalRecordDto
            {
                RecordId = medicalRecord.RecordId,
                PetId = medicalRecord.PetId,
                PetName = medicalRecord.Pet?.Name,
                StaffId = medicalRecord.StaffId,
                StaffName = medicalRecord.Staff?.User?.FullName,
                RecordDate = medicalRecord.RecordDate,
                Diagnosis = medicalRecord.Diagnosis,
                Treatment = medicalRecord.Treatment,
                Prescription = medicalRecord.Prescription,
                Notes = medicalRecord.Notes,
                NextVisit = nextVisit
            };
        }
    }
}