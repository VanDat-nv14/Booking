using BE_PetWeb_API.DTOs.Staff;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class StaffScheduleService : IStaffScheduleService
    {
        private readonly PetWebContext _context;

        public StaffScheduleService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<List<StaffScheduleDto>> GetStaffScheduleByMonthYear(int staffId, int month, int year)
        {
            // Kiểm tra nhân viên tồn tại
            var staff = await _context.Staff
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StaffId == staffId);

            if (staff == null)
                throw new Exception("Nhân viên không tồn tại");

            // Lấy ngày đầu và cuối tháng
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            // Lấy tất cả lịch làm việc trong tháng
            var schedules = await _context.StaffSchedules
                .Where(ss => ss.StaffId == staffId && ss.Date >= startDate && ss.Date <= endDate)
                .ToListAsync();

            // Chuyển đổi sang DTO
            var result = schedules.Select(ss => new StaffScheduleDto
            {
                // Sử dụng đúng tên trường từ mô hình
                StaffScheduleId = ss.ScheduleId,
                StaffId = ss.StaffId,
                StaffName = staff.User.FullName,
                Date = ss.Date,
                IsWorking = ss.IsWorking,
                // Xử lý trường nullable
                StartTime = ss.StartTime.HasValue ? FormatTimeSpan(ss.StartTime.Value) : "08:00",
                EndTime = ss.EndTime.HasValue ? FormatTimeSpan(ss.EndTime.Value) : "21:30",
                Notes = ss.Notes ?? ""
            }).ToList();

            return result;
        }

        public async Task<StaffScheduleDto> SetStaffSchedule(SetStaffScheduleDto scheduleDto)
        {
            // Kiểm tra nhân viên tồn tại
            var staff = await _context.Staff
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StaffId == scheduleDto.StaffId);

            if (staff == null)
                throw new Exception("Nhân viên không tồn tại");

            // Tìm lịch làm việc cho ngày này nếu đã tồn tại
            var existingSchedule = await _context.StaffSchedules
                .FirstOrDefaultAsync(ss => ss.StaffId == scheduleDto.StaffId && ss.Date.Date == scheduleDto.Date.Date);

            // Parse giờ làm việc
            var startTime = TimeSpan.Parse(scheduleDto.StartTime);
            var endTime = TimeSpan.Parse(scheduleDto.EndTime);

            // Kiểm tra hợp lệ
            if (startTime >= endTime)
                throw new Exception("Thời gian bắt đầu phải trước thời gian kết thúc");

            if (existingSchedule == null)
            {
                // Tạo mới nếu chưa có
                existingSchedule = new StaffSchedule
                {
                    StaffId = scheduleDto.StaffId,
                    Date = scheduleDto.Date.Date,
                    IsWorking = scheduleDto.IsWorking,
                    StartTime = scheduleDto.IsWorking ? startTime : (TimeSpan?)null,
                    EndTime = scheduleDto.IsWorking ? endTime : (TimeSpan?)null,
                    Notes = scheduleDto.Notes,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.StaffSchedules.Add(existingSchedule);
            }
            else
            {
                // Cập nhật nếu đã có
                existingSchedule.IsWorking = scheduleDto.IsWorking;
                existingSchedule.StartTime = scheduleDto.IsWorking ? startTime : (TimeSpan?)null;
                existingSchedule.EndTime = scheduleDto.IsWorking ? endTime : (TimeSpan?)null;
                existingSchedule.Notes = scheduleDto.Notes;
                existingSchedule.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            // Trả về DTO với thông tin đã cập nhật
            return new StaffScheduleDto
            {
                StaffScheduleId = existingSchedule.ScheduleId,
                StaffId = existingSchedule.StaffId,
                StaffName = staff.User.FullName,
                Date = existingSchedule.Date,
                IsWorking = existingSchedule.IsWorking,
                StartTime = existingSchedule.StartTime.HasValue ? FormatTimeSpan(existingSchedule.StartTime.Value) : "08:00",
                EndTime = existingSchedule.EndTime.HasValue ? FormatTimeSpan(existingSchedule.EndTime.Value) : "21:30",
                Notes = existingSchedule.Notes ?? ""
            };
        }

        public async Task<StaffAvailabilityResponseDto> CheckStaffAvailability(int staffId, DateTime date)
        {
            // Kiểm tra nhân viên tồn tại
            var staff = await _context.Staff
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StaffId == staffId);

            if (staff == null)
                throw new Exception("Nhân viên không tồn tại");

            // Lấy lịch làm việc cho ngày này
            var schedule = await _context.StaffSchedules
                .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.Date.Date == date.Date);

            // Mặc định làm việc từ 8:00-21:30 nếu chưa có lịch cụ thể
            bool isWorking = schedule?.IsWorking ?? true;
            TimeSpan startTime = schedule?.StartTime ?? new TimeSpan(8, 0, 0);
            TimeSpan endTime = schedule?.EndTime ?? new TimeSpan(21, 30, 0);

            // Lấy danh sách các cuộc hẹn trong ngày
            var appointments = await _context.Appointments
                .Where(a => a.StaffId == staffId && a.AppointmentDate.Date == date.Date)
                .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                .Include(a => a.Service)
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync();

            // Chuyển đổi sang DTO
            var bookedSlots = appointments.Select(a => new BookedSlotDto
            {
                AppointmentId = a.AppointmentId,
                StartTime = a.AppointmentDate,
                EndTime = a.EndTime ?? a.AppointmentDate.AddMinutes(a.Service.Duration),
                ServiceName = a.Service.Name
            }).ToList();

            return new StaffAvailabilityResponseDto
            {
                StaffId = staffId,
                StaffName = staff.User.FullName,
                Date = date.Date,
                IsWorking = isWorking,
                StartTime = FormatTimeSpan(startTime),
                EndTime = FormatTimeSpan(endTime),
                IsAvailable = isWorking && bookedSlots.Count < ((endTime - startTime).TotalHours * 2), // Giả định mỗi slot 30 phút
                BookedSlots = bookedSlots
            };
        }

        // Helper method để định dạng TimeSpan thành chuỗi "HH:mm"
        private string FormatTimeSpan(TimeSpan time)
        {
            return $"{time.Hours:D2}:{time.Minutes:D2}";
        }
    }
}