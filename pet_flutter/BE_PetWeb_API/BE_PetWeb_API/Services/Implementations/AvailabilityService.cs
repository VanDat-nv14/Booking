using BE_PetWeb_API.DTOs.Appointment;
using BE_PetWeb_API.DTOs.Calendar;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{    public class AvailabilityService : IAvailabilityService
    {
        private readonly PetWebContext _context;
        private readonly IAppointmentService _appointmentService;
        private const int BUFFER_TIME_MINUTES = 10; // Buffer time 10 phút
        private const int DEFAULT_SLOT_INTERVAL_MINUTES = 30; // Display grid interval for UI

        public AvailabilityService(PetWebContext context, IAppointmentService appointmentService)
        {
            _context = context;
            _appointmentService = appointmentService;
        }

        // Update the return type to match the interface
        public async Task<List<BE_PetWeb_API.DTOs.Calendar.TimeSlotDto>> GetAvailableTimeSlotsAsync(int staffId, DateTime date)
        {
            try
            {
                // Lấy thông tin nhân viên
                var staff = await _context.Staff
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.StaffId == staffId && s.IsActive == true);

                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại hoặc đã bị vô hiệu hóa");

                // Lấy lịch làm việc của nhân viên
                var staffSchedule = await _context.StaffSchedules
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.Date.Date == date.Date);

                // Kiểm tra nhân viên có làm việc vào ngày này không
                if (staffSchedule != null && !staffSchedule.IsWorking)
                {
                    return new List<BE_PetWeb_API.DTOs.Calendar.TimeSlotDto>(); // Nhân viên không làm việc vào ngày này
                }

                // Lấy thời gian làm việc tùy chỉnh, hoặc sử dụng mặc định nếu không có
                TimeSpan startWorkHour = staffSchedule?.StartTime ?? new TimeSpan(8, 0, 0); // 8:00 AM mặc định
                TimeSpan endWorkHour = staffSchedule?.EndTime ?? new TimeSpan(21, 30, 0); // 9:30 PM mặc định

                // Lấy tất cả cuộc hẹn của nhân viên trong ngày
                var appointments = await _context.Appointments
                    .Where(a => a.StaffId == staffId && a.AppointmentDate.Date == date.Date)
                    .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                    .ToListAsync();                // Tạo danh sách các slots
                var timeSlots = new List<BE_PetWeb_API.DTOs.Calendar.TimeSlotDto>();
                var slotDuration = TimeSpan.FromMinutes(DEFAULT_SLOT_INTERVAL_MINUTES); // Mỗi slot display interval

                for (var currentTime = startWorkHour; currentTime.Add(slotDuration) <= endWorkHour; currentTime = currentTime.Add(slotDuration))
                {
                    var slotStart = date.Date.Add(currentTime);
                    var slotEnd = slotStart.Add(slotDuration);                    // Kiểm tra có trùng với cuộc hẹn nào không, tính cả buffer time
                    bool isAvailable = true;
                    foreach (var appointment in appointments)
                    {
                        var appointmentEndTimeWithBuffer = appointment.EndTime.GetValueOrDefault().AddMinutes(BUFFER_TIME_MINUTES);

                        if ((slotStart >= appointment.AppointmentDate && slotStart < appointmentEndTimeWithBuffer) ||
                            (slotEnd > appointment.AppointmentDate && slotEnd <= appointmentEndTimeWithBuffer) ||
                            (slotStart <= appointment.AppointmentDate && slotEnd >= appointmentEndTimeWithBuffer))
                        {
                            isAvailable = false;
                            break;
                        }
                    }

                    // Bỏ qua các slot trong quá khứ
                    if (slotStart <= DateTime.Now)
                    {
                        isAvailable = false;
                    }

                    timeSlots.Add(new BE_PetWeb_API.DTOs.Calendar.TimeSlotDto
                    {
                        StartTime = slotStart,
                        EndTime = slotEnd,
                        IsAvailable = isAvailable,
                        IsStaffBusy = !isAvailable, // ✅ SET TRƯỜNG MỚI
                        StaffId = staffId,
                        StaffName = staff.User.FullName
                    });
                }

                return timeSlots;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAvailableTimeSlotsAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<BE_PetWeb_API.DTOs.Calendar.StaffAvailabilityDto> SetStaffAvailabilityAsync(int staffId, SetAvailabilityDto availabilityDto)
        {
            try
            {
                // Kiểm tra nhân viên tồn tại
                var staff = await _context.Staff
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.StaffId == staffId && s.IsActive == true);

                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại hoặc đã bị vô hiệu hóa");

                // Kiểm tra thời gian
                if (availabilityDto.StartTime >= availabilityDto.EndTime)
                    throw new Exception("Thời gian bắt đầu phải trước thời gian kết thúc");

                // Kiểm tra hoặc tạo lịch làm việc cho ngày này
                var staffSchedule = await _context.StaffSchedules
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.Date.Date == availabilityDto.Date.Date);

                if (staffSchedule == null)
                {
                    // Tạo mới nếu chưa có
                    staffSchedule = new StaffSchedule
                    {
                        StaffId = staffId,
                        Date = availabilityDto.Date.Date,
                        IsWorking = availabilityDto.IsWorking,
                        StartTime = availabilityDto.StartTime.TimeOfDay,
                        EndTime = availabilityDto.EndTime.TimeOfDay,
                        Notes = availabilityDto.Notes,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };

                    _context.StaffSchedules.Add(staffSchedule);
                }
                else
                {
                    // Cập nhật nếu đã có
                    staffSchedule.IsWorking = availabilityDto.IsWorking;
                    staffSchedule.StartTime = availabilityDto.StartTime.TimeOfDay;
                    staffSchedule.EndTime = availabilityDto.EndTime.TimeOfDay;
                    staffSchedule.Notes = availabilityDto.Notes;
                    staffSchedule.UpdatedAt = DateTime.Now;

                    _context.StaffSchedules.Update(staffSchedule);
                }

                await _context.SaveChangesAsync();

                // Trả về thông tin mới
                return await GetStaffAvailabilityAsync(staffId, availabilityDto.Date);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SetStaffAvailabilityAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> CheckTimeConflictAsync(int staffId, DateTime startTime, DateTime endTime)
        {
            try
            {
                // Kiểm tra nhân viên tồn tại
                var staff = await _context.Staff
                    .FirstOrDefaultAsync(s => s.StaffId == staffId && s.IsActive == true);

                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại hoặc đã bị vô hiệu hóa");

                var date = startTime.Date;

                // Kiểm tra nhân viên có làm việc vào ngày này không
                var staffSchedule = await _context.StaffSchedules
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.Date.Date == date);

                if (staffSchedule != null && !staffSchedule.IsWorking)
                {
                    return true; // Có xung đột vì nhân viên không làm việc
                }

                // Lấy giờ làm việc
                TimeSpan workStart = staffSchedule?.StartTime ?? new TimeSpan(8, 0, 0);
                TimeSpan workEnd = staffSchedule?.EndTime ?? new TimeSpan(21, 30, 0);

                var workStartTime = date.Add(workStart);
                var workEndTime = date.Add(workEnd);

                // Kiểm tra thời gian nằm trong giờ làm việc
                if (startTime < workStartTime || endTime > workEndTime)
                {
                    return true; // Có xung đột vì nằm ngoài giờ làm việc
                }

                // Kiểm tra không trùng với các cuộc hẹn đã có, tính cả buffer time
                var conflictingAppointments = await _context.Appointments
                    .Where(a => a.StaffId == staffId && a.AppointmentDate.Date == date)
                    .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                    .ToListAsync();                // Kiểm tra xung đột với các cuộc hẹn, tính cả buffer time
                foreach (var appointment in conflictingAppointments)
                {
                    var appointmentEndTimeWithBuffer = appointment.EndTime.GetValueOrDefault().AddMinutes(BUFFER_TIME_MINUTES);

                    if ((startTime >= appointment.AppointmentDate && startTime < appointmentEndTimeWithBuffer) ||
                        (endTime > appointment.AppointmentDate && endTime <= appointmentEndTimeWithBuffer) ||
                        (startTime <= appointment.AppointmentDate && endTime >= appointmentEndTimeWithBuffer))
                    {
                        return true; // Có xung đột
                    }
                }

                return false; // Không có xung đột
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CheckTimeConflictAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>> GetAvailableTimeSlotsAsync(
    DateTime date, int serviceId, int? staffId = null)
        {
            var timeSlots = new List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>();

            try
            {
                // Lấy thông tin dịch vụ
                var service = await _context.Services.FindAsync(serviceId);
                if (service == null)
                    throw new Exception("Không tìm thấy dịch vụ");

                // Giờ làm việc: 8:00 AM - 9:30 PM
                var openingTime = new TimeSpan(8, 0, 0);
                var closingTime = new TimeSpan(21, 30, 0);
                int serviceDuration = service.Duration;

                // Tạo tất cả các khung giờ có thể trong ngày
                var slotsByTime = new Dictionary<string, BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>();

                // Lấy tất cả cuộc hẹn trong ngày
                var appointments = await _context.Appointments
                    .Where(a => a.AppointmentDate.Date == date.Date)
                    .Where(a => a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                    .OrderBy(a => a.AppointmentDate)
                    .ToListAsync();

                // Lấy tất cả nhân viên có thể thực hiện dịch vụ này
                var staffList = new List<Staff>();

                if (staffId.HasValue)
                {
                    // Nếu có yêu cầu nhân viên cụ thể, chỉ lấy nhân viên đó
                    var staff = await _context.Staff
                        .Include(s => s.User)
                        .FirstOrDefaultAsync(s => s.StaffId == staffId.Value && s.IsActive == true);

                    if (staff != null)
                    {
                        // Kiểm tra nhân viên có làm việc ngày này không
                        var staffSchedule = await _context.StaffSchedules
                            .FirstOrDefaultAsync(ss => ss.StaffId == staffId.Value && ss.Date.Date == date.Date);

                        if (staffSchedule == null || staffSchedule.IsWorking)
                        {
                            staffList.Add(staff);
                        }
                    }
                }
                else
                {
                    // Lấy tất cả nhân viên có thể thực hiện dịch vụ này
                    staffList = await _context.StaffServices
                        .Where(ss => ss.ServiceId == serviceId)
                        .Include(ss => ss.Staff)
                        .ThenInclude(s => s.User)
                        .Where(ss => ss.Staff.IsActive == true)
                        .Select(ss => ss.Staff)
                        .ToListAsync();

                    // Lọc ra nhân viên không làm việc ngày này
                    var nonWorkingStaffIds = await _context.StaffSchedules
                        .Where(ss => ss.Date.Date == date.Date && !ss.IsWorking)
                        .Select(ss => ss.StaffId)
                        .ToListAsync();

                    staffList = staffList.Where(s => !nonWorkingStaffIds.Contains(s.StaffId)).ToList();
                }

                // Kiểm tra thời lượng dịch vụ hợp lệ
                if (serviceDuration <= 0)
                {
                    throw new ArgumentException("Không thể tạo khung giờ: Thời lượng dịch vụ không hợp lệ hoặc không tìm thấy thông tin dịch vụ.");
                }
                
                // Tạo các khung giờ theo thời lượng thực tế của dịch vụ + buffer
                int actualSlotInterval = serviceDuration + BUFFER_TIME_MINUTES;
                var possibleStartTimes = new List<DateTime>();

                // Tạo slots đều từ 8:00 với interval dựa trên service duration + buffer
                DateTime currentStartTime = date.Date.Add(openingTime);
                while (currentStartTime.Add(TimeSpan.FromMinutes(serviceDuration)) <= date.Date.Add(closingTime))
                {
                    possibleStartTimes.Add(currentStartTime);
                    currentStartTime = currentStartTime.AddMinutes(actualSlotInterval);
                }

                // Lọc thời điểm, bỏ những thời điểm quá khứ
                var now = DateTime.Now;
                possibleStartTimes = possibleStartTimes.Where(t => t > now.AddMinutes(30)).ToList();

                // Tạo slot cho mỗi thời điểm bắt đầu có thể
                foreach (var startTime in possibleStartTimes)
                {
                    // Nếu thời điểm bắt đầu + thời lượng dịch vụ vượt quá giờ đóng cửa, bỏ qua
                    if (startTime.Add(TimeSpan.FromMinutes(serviceDuration)) > date.Date.Add(closingTime))
                        continue;

                    var timeKey = startTime.ToString("HH:mm");
                    var slotEndTime = startTime.AddMinutes(serviceDuration);
                    var bufferEndTime = startTime.AddMinutes(serviceDuration + BUFFER_TIME_MINUTES);

                    // Kiểm tra xem slot này có bị chồng lấn với cuộc hẹn nào không
                    bool isOverlapping = false;                    foreach (var appointment in appointments)
                    {
                        // Nếu thời điểm bắt đầu slot nằm trong khoảng thời gian cuộc hẹn (đã tính buffer)
                        if (startTime >= appointment.AppointmentDate &&
                            startTime < appointment.EndTime.GetValueOrDefault().AddMinutes(BUFFER_TIME_MINUTES))
                        {
                            isOverlapping = true;
                            break;
                        }
                        
                        // Nếu thời điểm kết thúc slot nằm trong khoảng thời gian cuộc hẹn
                        if (slotEndTime > appointment.AppointmentDate &&
                            slotEndTime <= appointment.EndTime.GetValueOrDefault().AddMinutes(BUFFER_TIME_MINUTES))
                        {
                            isOverlapping = true;
                            break;
                        }

                        // Nếu slot bao trùm cuộc hẹn
                        if (startTime <= appointment.AppointmentDate &&
                            slotEndTime >= appointment.EndTime.GetValueOrDefault().AddMinutes(BUFFER_TIME_MINUTES))
                        {
                            isOverlapping = true;
                            break;
                        }
                    }

                    if (isOverlapping)
                        continue;

                    // Tạo slot mới
                    slotsByTime[timeKey] = new BE_PetWeb_API.DTOs.Appointment.TimeSlotDto
                    {
                        Id = $"slot-{timeKey}",
                        StartTime = startTime,
                        EndTime = slotEndTime,
                        BufferEndTime = bufferEndTime,
                        Available = true,
                        IsAvailable = true,
                        IsStaffBusy = false, // ✅ SET TRƯỜNG MỚI
                        StaffId = null,
                        StaffName = null,
                        Duration = serviceDuration,
                        BufferTime = BUFFER_TIME_MINUTES,
                        IsDefault = false,
                        AvailableStaff = new List<BE_PetWeb_API.DTOs.Appointment.StaffAvailabilityDto>()
                    };
                }

                // Xử lý từng nhân viên để check xem họ có khả dụng trong từng slot không
                foreach (var staff in staffList)
                {
                    // Lấy các cuộc hẹn của nhân viên
                    var staffAppointments = appointments
                        .Where(a => a.StaffId == staff.StaffId)
                        .ToList();

                    // Kiểm tra từng khung giờ cho nhân viên này
                    foreach (var slot in slotsByTime.Values)
                    {
                        bool isOverlapping = false;
                        foreach (var appointment in staffAppointments)
                        {
                            var appointmentEndTimeWithBuffer = appointment.EndTime.GetValueOrDefault().AddMinutes(BUFFER_TIME_MINUTES);

                            if ((slot.StartTime >= appointment.AppointmentDate && slot.StartTime < appointmentEndTimeWithBuffer) ||
                                (slot.EndTime > appointment.AppointmentDate && slot.EndTime <= appointmentEndTimeWithBuffer) ||
                                (slot.StartTime <= appointment.AppointmentDate && slot.EndTime >= appointmentEndTimeWithBuffer))
                            {
                                isOverlapping = true;
                                break;
                            }
                        }

                        if (!isOverlapping)
                        {
                            // Thêm nhân viên vào danh sách nhân viên khả dụng cho slot này
                            slot.AvailableStaff.Add(new BE_PetWeb_API.DTOs.Appointment.StaffAvailabilityDto
                            {
                                StaffId = staff.StaffId,
                                StaffName = staff.User.FullName
                            });

                            // Nếu slot chưa có nhân viên chính, đặt nhân viên này làm chính
                            if (slot.StaffId == null)
                            {
                                slot.StaffId = staff.StaffId;
                                slot.StaffName = staff.User.FullName;
                            }
                        }
                        else
                        {
                            // ✅ NHÂN VIÊN BẬN - đánh dấu slot này là staff busy nếu nhân viên được chỉ định
                            if (staffId.HasValue && staff.StaffId == staffId.Value)
                            {
                                slot.IsStaffBusy = true;
                                slot.Available = false;
                                slot.IsAvailable = false;
                            }
                        }
                    }
                }

                // Chuyển từ dictionary sang list và lọc các slot không khả dụng (trừ khi là staff busy slot)
                var result = slotsByTime.Values
                    .Where(s => s.AvailableStaff.Count > 0 || s.IsStaffBusy) // ✅ BAO GỒM STAFF BUSY SLOTS
                    .OrderBy(s => s.StartTime)
                    .ToList();

                if (staffId.HasValue && !result.Any())
                {
                    // Nếu yêu cầu nhân viên cụ thể nhưng không có slot khả dụng, trả về danh sách trống
                    return new List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>();
                }

                // Log thông tin về các khung giờ đã tạo
                Console.WriteLine($"Tạo {result.Count} khung giờ khả dụng cho dịch vụ {serviceId} vào ngày {date.ToShortDateString()}");
                foreach (var slot in result)
                {
                    Console.WriteLine($"Slot {slot.StartTime.ToString("HH:mm")} - {slot.EndTime.ToString("HH:mm")} (buffer đến {slot.BufferEndTime?.ToString("HH:mm") ?? "không có"})");
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi trong GetAvailableTimeSlotsAsync: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return new List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>();
            }
        }

        public async Task<BE_PetWeb_API.DTOs.Calendar.StaffAvailabilityDto> GetStaffAvailabilityAsync(int staffId, DateTime date)
        {
            try
            {
                // Lấy thông tin nhân viên
                var staff = await _context.Staff
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.StaffId == staffId && s.IsActive == true);

                if (staff == null)
                    throw new Exception("Nhân viên không tồn tại hoặc đã bị vô hiệu hóa");

                // Lấy lịch làm việc của nhân viên trong ngày này
                var staffSchedule = await _context.StaffSchedules
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId && ss.Date.Date == date.Date);

                // Mặc định nhân viên làm việc từ 8h-21h30 nếu không có lịch cụ thể
                bool isWorking = staffSchedule?.IsWorking ?? true;
                TimeSpan startTime = staffSchedule?.StartTime ?? new TimeSpan(8, 0, 0);
                TimeSpan endTime = staffSchedule?.EndTime ?? new TimeSpan(21, 30, 0);

                // Lấy danh sách các dịch vụ mà nhân viên cung cấp
                var services = await _context.StaffServices
                    .Where(ss => ss.StaffId == staffId)
                    .Include(ss => ss.Service)
                    .Select(ss => new {
                        ss.ServiceId,
                        ss.Service.Name,
                        ss.Service.Duration,
                        ss.Service.Price
                    })
                    .ToListAsync();

                // Lấy danh sách các cuộc hẹn trong ngày
                var appointments = await _context.Appointments
                    .Where(a => a.StaffId == staffId && a.AppointmentDate.Date == date.Date)
                    .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                    .Include(a => a.Service)
                    .OrderBy(a => a.AppointmentDate)
                    .ToListAsync();

                // Chuyển đổi sang WorkingHoursDto
                var workingHours = new List<WorkingHoursDto>
                {
                    new WorkingHoursDto
                    {
                        StartTime = startTime,
                        EndTime = endTime,
                        DaysOfWeek = new List<DayOfWeek> { date.DayOfWeek }
                    }
                };

                // Chuyển đổi appointments thành break times
                var breakTimes = appointments.Select(a => new BreakTimeDto
                {
                    StartTime = a.AppointmentDate.TimeOfDay,
                    EndTime = a.EndTime.GetValueOrDefault().TimeOfDay,
                    Reason = $"Appointment: {a.Service.Name}"
                }).ToList();

                // Tạo và trả về đối tượng StaffAvailabilityDto
                return new BE_PetWeb_API.DTOs.Calendar.StaffAvailabilityDto
                {
                    StaffId = staffId,
                    StaffName = staff.User.FullName,
                    Date = date.Date,
                    IsWorking = isWorking,
                    WorkingHours = workingHours,
                    BreakTimes = breakTimes,
                    AppointmentCount = appointments.Count,
                    AvailableServices = services.Select(s => new ServiceAvailabilityDto
                    {
                        ServiceId = s.ServiceId,
                        ServiceName = s.Name,
                        Duration = s.Duration,
                        Price = s.Price
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetStaffAvailabilityAsync: {ex.Message}");
                throw;
            }
        }
    }
}