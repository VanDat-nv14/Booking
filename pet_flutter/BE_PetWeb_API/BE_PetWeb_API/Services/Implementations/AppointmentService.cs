using BE_PetWeb_API.DTOs.Appointment;
using BE_PetWeb_API.DTOs.Service;
using BE_PetWeb_API.DTOs.Staff;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Azure.Core.HttpHeader;

namespace BE_PetWeb_API.Services.Implementations
{    public class AppointmentService : IAppointmentService
    {
        private readonly PetWebContext _context;        private const int BUFFER_TIME_MINUTES = 10; // Buffer time cố định 10 phút
        private const int DEFAULT_SERVICE_DURATION_MINUTES = 30; // Fallback when service duration is not available
        private const int DEFAULT_SLOT_INTERVAL_MINUTES = 30; // Display grid interval for UI
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;
        private readonly IDateTimeService _dateTimeService;
        private readonly ILogger<AppointmentService> _logger;
        public AppointmentService(PetWebContext context, IEmailService emailService, IDateTimeService dateTimeService, ILogger<AppointmentService> logger)
        {
            _context = context;
            _emailService = emailService;
            _dateTimeService = dateTimeService;
            _logger = logger;
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .Where(a => a.AppointmentDate >= startDate.Date && a.AppointmentDate < endDate.Date.AddDays(1))
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync();

            return appointments.Select(a => MapToAppointmentDto(a)).ToList();
        }

        public async Task<IEnumerable<AppointmentDto>> GetStaffAppointmentsByDateAsync(int staffId, DateTime date)
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .Where(a => a.StaffId == staffId && a.AppointmentDate.Date == date.Date)
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync();

            return appointments.Select(a => MapToAppointmentDto(a)).ToList();
        }

        private AppointmentDto MapToAppointmentDto(Appointment appointment)
        {
            return new AppointmentDto
            {
                AppointmentId = appointment.AppointmentId,
                UserId = appointment.UserId,
                PetId = appointment.PetId,
                ServiceId = appointment.ServiceId,
                StaffId = appointment.StaffId,
                AppointmentDate = appointment.AppointmentDate,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                Notes = appointment.Notes,
                UserName = appointment.User?.FullName,
                PetName = appointment.Pet?.Name,
                ServiceName = appointment.Service?.Name,
                CancellationReason = appointment.Notes,
                StaffName = appointment.Staff?.User?.FullName


            };
        }

        public async Task<IEnumerable<AppointmentDto>> GetAllAppointmentsAsync()
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .ThenInclude(s => s.User)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    PetId = a.PetId,
                    PetName = a.Pet.Name,
                    ServiceId = a.ServiceId,
                    ServiceName = a.Service.Name,
                    ServicePrice = a.Service.Price,
                    StaffId = a.StaffId,
                    StaffName = a.Staff != null ? a.Staff.User.FullName : null,
                    AppointmentDate = a.AppointmentDate,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<IEnumerable<AppointmentDto>> GetUserAppointmentsAsync(int userId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .ThenInclude(s => s.User)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    PetId = a.PetId,
                    PetName = a.Pet.Name,
                    ServiceId = a.ServiceId,
                    ServiceName = a.Service.Name,
                    ServicePrice = a.Service.Price,
                    StaffId = a.StaffId,
                    StaffName = a.Staff != null ? a.Staff.User.FullName : null,
                    AppointmentDate = a.AppointmentDate,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<IEnumerable<AppointmentDto>> GetStaffAppointmentsAsync(int staffId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .ThenInclude(s => s.User)
                .Where(a => a.StaffId == staffId)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    PetId = a.PetId,
                    PetName = a.Pet.Name,
                    ServiceId = a.ServiceId,
                    ServiceName = a.Service.Name,
                    ServicePrice = a.Service.Price,
                    StaffId = a.StaffId,
                    StaffName = a.Staff != null ? a.Staff.User.FullName : null,
                    AppointmentDate = a.AppointmentDate,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<AppointmentDto> GetAppointmentByIdAsync(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .ThenInclude(s => s.User)
                .Where(a => a.AppointmentId == id)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    PetId = a.PetId,
                    PetName = a.Pet.Name,
                    ServiceId = a.ServiceId,
                    ServiceName = a.Service.Name,
                    ServicePrice = a.Service.Price,
                    StaffId = a.StaffId,
                    StaffName = a.Staff != null ? a.Staff.User.FullName : null,
                    AppointmentDate = a.AppointmentDate,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .FirstOrDefaultAsync();

            return appointment;
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateAsync(DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1);

            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .ThenInclude(s => s.User)
                .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
                .OrderBy(a => a.AppointmentDate)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    PetId = a.PetId,
                    PetName = a.Pet.Name,
                    ServiceId = a.ServiceId,
                    ServiceName = a.Service.Name,
                    ServicePrice = a.Service.Price,
                    StaffId = a.StaffId,
                    StaffName = a.Staff != null ? a.Staff.User.FullName : null,
                    AppointmentDate = a.AppointmentDate,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByStatusAsync(string status)
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .Include(a => a.Staff)
                .ThenInclude(s => s.User)
                .Where(a => a.Status == status)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    UserName = a.User.FullName,
                    PetId = a.PetId,
                    PetName = a.Pet.Name,
                    ServiceId = a.ServiceId,
                    ServiceName = a.Service.Name,
                    ServicePrice = a.Service.Price,
                    StaffId = a.StaffId,
                    StaffName = a.Staff != null ? a.Staff.User.FullName : null,
                    AppointmentDate = a.AppointmentDate,
                    EndTime = a.EndTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<AppointmentDto> CreateAppointmentAsync(int userId, CreateAppointmentDto createAppointmentDto, bool isAdminOrStaff = false)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable))
            {
                try
                {
                    var pet = await _context.Pets.FindAsync(createAppointmentDto.PetId);
                    if (pet == null || pet.IsActive != true)
                        throw new Exception("Pet not found or has been deactivated");

                    // Admin/Staff có thể tạo appointment cho bất kỳ pet nào
                    if (!isAdminOrStaff && pet.UserId != userId)
                        throw new Exception("You are not authorized to create appointments for this pet");

                    var service = await _context.Services.FindAsync(createAppointmentDto.ServiceId);
                    if (service == null || service.IsActive != true)
                        throw new Exception("Service not found or has been deactivated");

                    Staff staff = null;
                    if (createAppointmentDto.StaffId.HasValue)
                    {
                        staff = await _context.Staff
                            .Include(s => s.User)
                            .FirstOrDefaultAsync(s => s.StaffId == createAppointmentDto.StaffId.Value);

                        if (staff == null || staff.IsActive != true)
                            throw new Exception("Staff not found or has been deactivated");

                        bool providesService = await _context.StaffServices
                            .AnyAsync(ss => ss.StaffId == staff.StaffId && ss.ServiceId == service.ServiceId);

                        if (!providesService)
                            throw new Exception("Selected staff does not provide this service");
                    }

                    // Tính toán thời gian kết thúc dịch vụ
                    var serviceEndTime = createAppointmentDto.AppointmentDate.AddMinutes(service.Duration);

                    // Buffer time là 10 phút, nhưng chúng ta không lưu buffer vào cơ sở dữ liệu
                    // Chỉ sử dụng buffer để kiểm tra xung đột
                    var bufferEndTime = serviceEndTime.AddMinutes(BUFFER_TIME_MINUTES);

                    TimeSpan openingTime = new TimeSpan(8, 0, 0);
                    TimeSpan closingTime = new TimeSpan(21, 30, 0);
                    TimeSpan appointmentTimeOfDay = createAppointmentDto.AppointmentDate.TimeOfDay;
                    TimeSpan endTimeOfDay = serviceEndTime.TimeOfDay;

                    if (appointmentTimeOfDay < openingTime || endTimeOfDay > closingTime)
                    {
                        throw new Exception("The selected time is outside working hours (8:00 AM - 9:30 PM)");
                    }

                    if (createAppointmentDto.StaffId.HasValue)
                    {
                        var staffSchedule = await _context.StaffSchedules
                            .FirstOrDefaultAsync(ss => ss.StaffId == createAppointmentDto.StaffId.Value &&
                                                   ss.Date.Date == createAppointmentDto.AppointmentDate.Date);

                        if (staffSchedule != null && !staffSchedule.IsWorking)
                        {
                            throw new Exception($"Staff is not available on {createAppointmentDto.AppointmentDate.Date.ToShortDateString()}");
                        }
                    }

                    var appointmentDate = createAppointmentDto.AppointmentDate;
                    var appointmentDay = appointmentDate.Date;
                    var nextDay = appointmentDay.AddDays(1);

                    // Kiểm tra xem thú cưng đã có lịch hẹn vào thời gian này chưa
                    var petConflicts = await _context.Appointments
                        .Where(a => a.PetId == createAppointmentDto.PetId)
                        .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                        .Where(a => a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                        .Where(a =>
                            // Kiểm tra xem thời gian bắt đầu của lịch hẹn mới nằm trong khoảng thời gian của lịch hẹn cũ
                            (appointmentDate >= a.AppointmentDate && appointmentDate < a.EndTime) ||
                            // Kiểm tra xem thời gian kết thúc (bao gồm buffer) của lịch hẹn mới có xung đột với lịch hẹn cũ
                            (bufferEndTime > a.AppointmentDate && bufferEndTime <= a.EndTime) ||
                            // Kiểm tra xem lịch hẹn mới bao trùm lịch hẹn cũ
                            (appointmentDate <= a.AppointmentDate && bufferEndTime >= a.EndTime)
                        )
                        .ToListAsync();

                    if (petConflicts.Count > 0)
                    {
                        throw new Exception("Your pet already has an appointment at this time");
                    }

                    // Chỉ kiểm tra xung đột staff khi có staff được chỉ định
                    if (createAppointmentDto.StaffId.HasValue)
                    {
                        var staffQuery = _context.Appointments
                            .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                            .Where(a => a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                            .Where(a => a.StaffId == createAppointmentDto.StaffId.Value);

                        // Kiểm tra xung đột với staff được chỉ định
                        var staffConflictingAppointments = await staffQuery
                            .Where(a =>
                                // Kiểm tra xem thời gian bắt đầu của lịch hẹn mới nằm trong khoảng thời gian của lịch hẹn cũ
                                (appointmentDate >= a.AppointmentDate && appointmentDate < a.EndTime) ||
                                // Kiểm tra xem thời gian kết thúc (bao gồm buffer) của lịch hẹn mới có xung đột với lịch hẹn cũ
                                (bufferEndTime > a.AppointmentDate && bufferEndTime <= a.EndTime) ||
                                // Kiểm tra xem lịch hẹn mới bao trùm lịch hẹn cũ
                                (appointmentDate <= a.AppointmentDate && bufferEndTime >= a.EndTime)
                            )
                            .ToListAsync();

                        if (staffConflictingAppointments.Count > 0)
                        {
                            throw new Exception("The selected time slot is already booked for this staff member. Please choose another time.");
                        }
                    }
                    // Khi không có staff được chỉ định, cho phép multiple pets đặt cùng khung giờ
                    // Không cần kiểm tra staff conflicts

                    var appointment = new Appointment
                    {
                        UserId = userId,
                        PetId = createAppointmentDto.PetId,
                        ServiceId = createAppointmentDto.ServiceId,
                        StaffId = createAppointmentDto.StaffId,
                        AppointmentDate = createAppointmentDto.AppointmentDate,
                        EndTime = serviceEndTime, // Chỉ lưu thời gian kết thúc dịch vụ, không lưu buffer
                        Status = "Scheduled",
                        Notes = createAppointmentDto.Notes,
                                        CreatedAt = _dateTimeService.Now,
                UpdatedAt = _dateTimeService.Now
                    };

                    _context.Appointments.Add(appointment);
                    await _context.SaveChangesAsync();

                    // Gửi email xác nhận đặt lịch hẹn
                    var user = await _context.Users.FindAsync(userId);
                    if (user != null && !string.IsNullOrEmpty(user.Email))
                    {
                        await _emailService.SendAppointmentConfirmationEmail(
                            user.Email,
                            user.FullName,
                            appointment.AppointmentDate,
                            service.Name,
                            staff?.User?.FullName,
                            appointment.AppointmentId);
                    }

                    await transaction.CommitAsync();

                    return new AppointmentDto
                    {
                        AppointmentId = appointment.AppointmentId,
                        UserId = appointment.UserId,
                        UserName = user.FullName,
                        PetId = appointment.PetId,
                        PetName = pet.Name,
                        ServiceId = appointment.ServiceId,
                        ServiceName = service.Name,
                        ServicePrice = service.Price,
                        StaffId = appointment.StaffId,
                        StaffName = staff?.User?.FullName,
                        AppointmentDate = appointment.AppointmentDate,
                        EndTime = appointment.EndTime,
                        Status = appointment.Status,
                        Notes = appointment.Notes
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Error in CreateAppointmentAsync: {ex.Message}");
                    throw;
                }
            }
        }

        public async Task<AppointmentDto> UpdateAppointmentAsync(int id, int userId, UpdateAppointmentDto updateAppointmentDto)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable))
            {
                try
                {
                    var appointment = await _context.Appointments
                        .Include(a => a.User)
                        .Include(a => a.Pet)
                        .Include(a => a.Service)
                        .Include(a => a.Staff)
                        .ThenInclude(s => s.User)
                        .FirstOrDefaultAsync(a => a.AppointmentId == id);

                    if (appointment == null)
                        return null;

                    bool isAdminOrStaff = await IsUserAdminOrStaff(userId);
                    bool isOwner = appointment.UserId == userId;
                    bool isAssignedStaff = appointment.StaffId.HasValue && await IsUserStaff(userId, appointment.StaffId.Value);

                    if (!isAdminOrStaff && !isOwner && !isAssignedStaff)
                        throw new Exception("You are not authorized to update this appointment");

                    if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
                        throw new Exception("Cannot update completed or cancelled appointments");                    if (isOwner && !isAdminOrStaff && !isAssignedStaff)
                    {
                        var editCount = await _context.Appointments
                            .Where(a => a.AppointmentId == id)
                            .Select(a => a.UpdatedAt != null && a.UpdatedAt != a.CreatedAt ? 1 : 0)
                            .FirstOrDefaultAsync();

                        if (editCount >= 2)
                        {
                            throw new Exception("You cannot edit an appointment more than 2 times");
                        }
                    }

                    int? oldStaffId = appointment.StaffId;
                    DateTime oldAppointmentDate = appointment.AppointmentDate;
                    DateTime? oldEndTime = appointment.EndTime;

                    DateTime appointmentDate = appointment.AppointmentDate;
                    int serviceId = appointment.ServiceId;
                    int? staffId = appointment.StaffId;
                    DateTime? endTime = appointment.EndTime;
                    bool needToCheckConflict = false;

                    if (updateAppointmentDto.PetId.HasValue)
                    {
                        var pet = await _context.Pets.FindAsync(updateAppointmentDto.PetId.Value);
                        if (pet == null || pet.IsActive != true)
                            throw new Exception("Pet not found or has been deactivated");

                        if (pet.UserId != appointment.UserId)
                            throw new Exception("The selected pet does not belong to the appointment owner");

                        appointment.PetId = updateAppointmentDto.PetId.Value;
                    }

                    if (updateAppointmentDto.ServiceId.HasValue)
                    {
                        var service = await _context.Services.FindAsync(updateAppointmentDto.ServiceId.Value);
                        if (service == null || service.IsActive != true)
                            throw new Exception("Service not found or has been deactivated");

                        serviceId = service.ServiceId;
                        appointment.ServiceId = service.ServiceId;

                        needToCheckConflict = true;

                        endTime = appointment.AppointmentDate.AddMinutes(service.Duration);
                        appointment.EndTime = endTime;
                    }

                    if (updateAppointmentDto.StaffId.HasValue && updateAppointmentDto.StaffId != appointment.StaffId)
                    {
                        var staff = await _context.Staff.FindAsync(updateAppointmentDto.StaffId.Value);
                        if (staff == null || staff.IsActive != true)
                            throw new Exception("Staff not found or has been deactivated");

                        bool providesService = await _context.StaffServices
                            .AnyAsync(ss => ss.StaffId == staff.StaffId && ss.ServiceId == serviceId);

                        if (!providesService)
                            throw new Exception("Selected staff does not provide this service");

                        staffId = updateAppointmentDto.StaffId;
                        appointment.StaffId = staffId;

                        needToCheckConflict = true;
                    }

                    if (updateAppointmentDto.AppointmentDate.HasValue && updateAppointmentDto.AppointmentDate != appointment.AppointmentDate)
                    {
                        appointmentDate = updateAppointmentDto.AppointmentDate.Value;

                        needToCheckConflict = true;

                        appointment.AppointmentDate = appointmentDate;

                        var service = await _context.Services.FindAsync(serviceId);
                        endTime = appointmentDate.AddMinutes(service.Duration);
                        appointment.EndTime = endTime;
                    }

                    if (needToCheckConflict)
                    {
                        TimeSpan openingTime = new TimeSpan(8, 0, 0);
                        TimeSpan closingTime = new TimeSpan(21, 30, 0);
                        TimeSpan appointmentTimeOfDay = appointmentDate.TimeOfDay;
                        TimeSpan endTimeOfDay = endTime.Value.TimeOfDay;

                        if (appointmentTimeOfDay < openingTime || endTimeOfDay > closingTime)
                        {
                            throw new Exception("The selected time is outside working hours (8:00 AM - 9:30 PM)");
                        }

                        if (staffId.HasValue)
                        {
                            var staffSchedule = await _context.StaffSchedules
                                .FirstOrDefaultAsync(ss => ss.StaffId == staffId.Value &&
                                                           ss.Date.Date == appointmentDate.Date);

                            if (staffSchedule != null && !staffSchedule.IsWorking)
                            {
                                throw new Exception($"Staff is not available on {appointmentDate.Date.ToShortDateString()}");
                            }
                        }

                        var appointmentDay = appointmentDate.Date;
                        var nextDay = appointmentDay.AddDays(1);

                        // Kiểm tra xem thú cưng đã có lịch hẹn khác vào thời gian này chưa (ngoại trừ lịch hẹn hiện tại)
                        var bufferEndTime = endTime.Value.AddMinutes(BUFFER_TIME_MINUTES);
                        var petConflicts = await _context.Appointments
                            .Where(a => a.AppointmentId != id) // Loại trừ lịch hẹn hiện tại
                            .Where(a => a.PetId == appointment.PetId)
                            .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                            .Where(a => a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                            .Where(a =>
                                // Kiểm tra xem thời gian bắt đầu của lịch hẹn mới nằm trong khoảng thời gian của lịch hẹn cũ
                                (appointmentDate >= a.AppointmentDate && appointmentDate < a.EndTime) ||
                                // Kiểm tra xem thời gian kết thúc (bao gồm buffer) của lịch hẹn mới có xung đột với lịch hẹn cũ
                                (bufferEndTime > a.AppointmentDate && bufferEndTime <= a.EndTime) ||
                                // Kiểm tra xem lịch hẹn mới bao trùm lịch hẹn cũ
                                (appointmentDate <= a.AppointmentDate && bufferEndTime >= a.EndTime)
                            )
                            .ToListAsync();

                        if (petConflicts.Count > 0)
                        {
                            throw new Exception("Your pet already has an appointment at this time");
                        }

                        // Chỉ kiểm tra xung đột staff khi có staff được chỉ định
                        if (staffId.HasValue)
                        {
                            var staffQuery = _context.Appointments
                                .Where(a => a.AppointmentId != id)
                                .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                                .Where(a => a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                                .Where(a => a.StaffId == staffId.Value);

                            // Tính buffer time vào việc kiểm tra xung đột
                            var staffConflictingAppointments = await staffQuery
                                .Where(a =>
                                    // Kiểm tra xem thời gian bắt đầu của lịch hẹn mới nằm trong khoảng thời gian của lịch hẹn cũ
                                    (appointmentDate >= a.AppointmentDate && appointmentDate < a.EndTime) ||
                                    // Kiểm tra xem thời gian kết thúc (bao gồm buffer) của lịch hẹn mới có xung đột với lịch hẹn cũ
                                    (bufferEndTime > a.AppointmentDate && bufferEndTime <= a.EndTime) ||
                                    // Kiểm tra xem lịch hẹn mới bao trùm lịch hẹn cũ
                                    (appointmentDate <= a.AppointmentDate && bufferEndTime >= a.EndTime)
                                )
                                .ToListAsync();

                            if (staffConflictingAppointments.Count > 0)
                            {
                                throw new Exception("The selected time slot is already booked for this staff member. Please choose another time.");
                            }
                        }
                        // Khi không có staff được chỉ định, cho phép multiple pets đặt cùng khung giờ
                    }

                    // SỬA ĐỔI Ở ĐÂY - Phần xử lý Status
                    if (updateAppointmentDto.Status != null)  // Sử dụng null thay vì string.IsNullOrEmpty
                    {
                        if (!isAdminOrStaff && !isAssignedStaff)
                        {
                            // Nếu người dùng không phải nhân viên/admin
                            // Chỉ cho phép người dùng hủy lịch hẹn, không cho phép cập nhật status khác
                            if (updateAppointmentDto.Status == "Cancelled")
                            {
                                appointment.Status = "Cancelled";
                                appointment.Notes = updateAppointmentDto.Notes; // Lưu lý do hủy vào trường Notes
                            }
                            else
                            {
                                throw new Exception("Users can only cancel appointments, not change to other statuses");
                            }
                        }
                        else
                        {
                            // Nhân viên và admin được phép thay đổi status
                            appointment.Status = updateAppointmentDto.Status;
                        }
                    }

                    if (updateAppointmentDto.Notes != null)
                    {
                        appointment.Notes = updateAppointmentDto.Notes;
                    }

                    appointment.UpdatedAt = _dateTimeService.Now;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Gửi email thông báo cập nhật lịch hẹn
                    if (needToCheckConflict &&
                        (oldAppointmentDate != appointment.AppointmentDate ||
                        oldStaffId != appointment.StaffId))
                    {
                        var user = await _context.Users.FindAsync(appointment.UserId);
                        var service = await _context.Services.FindAsync(appointment.ServiceId);
                        var staff = appointment.StaffId.HasValue
                            ? await _context.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.StaffId == appointment.StaffId.Value)
                            : null;

                        if (user != null && !string.IsNullOrEmpty(user.Email))
                        {
                            await _emailService.SendAppointmentUpdateEmail(
                                user.Email,
                                user.FullName,
                                appointment.AppointmentDate,
                                service.Name,
                                staff?.User?.FullName,
                                appointment.AppointmentId,
                                appointment.Status);
                        }
                    }

                    return await GetAppointmentByIdAsync(id);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Error in UpdateAppointmentAsync: {ex.Message}");
                    throw;
                }
            }
        }

        public async Task<AppointmentDto> UpdateAppointmentStatusAsync(int id, int userId, UpdateAppointmentStatusDto updateStatusDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return null;

            bool isAdminOrStaff = await IsUserAdminOrStaff(userId);
            bool isAssignedStaff = appointment.StaffId.HasValue && await IsUserStaff(userId, appointment.StaffId.Value);

            if (!isAdminOrStaff && !isAssignedStaff)
                throw new Exception("You are not authorized to update this appointment status");

            if (updateStatusDto.Status == "Completed" && !isAdminOrStaff && !isAssignedStaff)
                throw new Exception("Only staff or admin can mark appointments as completed");

            appointment.Status = updateStatusDto.Status;
            
            // Set Notes - if cancelling and no notes provided, use default message
            if (!string.IsNullOrEmpty(updateStatusDto.Notes))
            {
                appointment.Notes = updateStatusDto.Notes;
            }
            else if (updateStatusDto.Status == "Cancelled")
            {
                appointment.Notes = "Cancelled by user";
            }
            
            appointment.UpdatedAt = _dateTimeService.Now;

            await _context.SaveChangesAsync();
            return await GetAppointmentByIdAsync(id);
        }

        public async Task<bool> CancelAppointmentAsync(int id, int userId)
        {
            return await CancelAppointmentAsync(id, userId, null);
        }

        public async Task<bool> CancelAppointmentAsync(int id, int userId, string reason)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return false;

            // Kiểm tra quyền hủy lịch hẹn
            bool isOwner = appointment.UserId == userId;
            bool isAdminOrStaff = await IsUserAdminOrStaff(userId);

            if (!isOwner && !isAdminOrStaff)
                throw new Exception("You are not authorized to cancel this appointment");            // Nếu là người dùng (không phải admin hoặc nhân viên), kiểm tra thêm điều kiện
            if (isOwner && !isAdminOrStaff)
            {
                // Kiểm tra số lần hủy trong vòng 1 tháng
                var oneMonthAgo = _dateTimeService.Now.AddMonths(-1);
                var cancelCount = await _context.Appointments
                    .Where(a => a.UserId == userId)
                    .Where(a => a.Status == "Cancelled")
                    .Where(a => a.UpdatedAt >= oneMonthAgo)
                    .CountAsync();

                if (cancelCount >= 3)
                {
                    throw new Exception("You have reached the maximum number of cancellations (3) in the last 1 month");
                }
            }

            // Cập nhật trạng thái
            appointment.Status = "Cancelled";
            appointment.Notes = reason; // Lưu lý do hủy vào trường Notes
            appointment.UpdatedAt = _dateTimeService.Now;
            await _context.SaveChangesAsync();

            // Gửi email thông báo hủy lịch hẹn
            var user = await _context.Users.FindAsync(appointment.UserId);
            var service = await _context.Services.FindAsync(appointment.ServiceId);

            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                await _emailService.SendAppointmentCancellationEmail(
                    user.Email,
                    user.FullName,
                    appointment.AppointmentDate,
                    service.Name,
                    appointment.AppointmentId,
                    reason);
            }

            return true;
        }

        public async Task<bool> IsUserAppointment(int appointmentId, int userId)
        {
            return await _context.Appointments
                .AnyAsync(a => a.AppointmentId == appointmentId && a.UserId == userId);
        }

        public async Task<bool> IsStaffAppointment(int appointmentId, int staffId)
        {
            return await _context.Appointments
                .AnyAsync(a => a.AppointmentId == appointmentId && a.StaffId == staffId);
        }

        public async Task<bool> IsTimeSlotAvailable(DateTime appointmentDate, int serviceId, int? staffId)
        {
            return await IsTimeSlotAvailableAsync(appointmentDate, serviceId, staffId);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(DateTime appointmentDate, int serviceId, int? staffId)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null)
                throw new Exception("Service not found");

            var appointmentDay = appointmentDate.Date;
            var nextDay = appointmentDay.AddDays(1);

            // Kiểm tra thời gian hẹn trong giờ làm việc
            TimeSpan openingTime = new TimeSpan(8, 0, 0);
            TimeSpan closingTime = new TimeSpan(21, 30, 0);
            TimeSpan appointmentTimeOfDay = appointmentDate.TimeOfDay;

            if (appointmentTimeOfDay < openingTime || appointmentTimeOfDay > closingTime)
            {
                return false;
            }            // Tính thời gian kết thúc dịch vụ
            var serviceEndTime = appointmentDate.AddMinutes(service.Duration);
            var bufferEndTime = serviceEndTime.AddMinutes(BUFFER_TIME_MINUTES);

            if (serviceEndTime.TimeOfDay > closingTime)
            {
                return false;
            }

            // Nếu có staffId, kiểm tra lịch làm việc của nhân viên
            if (staffId.HasValue)
            {
                var staffSchedule = await _context.StaffSchedules
                    .FirstOrDefaultAsync(ss => ss.StaffId == staffId.Value &&
                                        ss.Date.Date == appointmentDay);

                if (staffSchedule != null && !staffSchedule.IsWorking)
                {
                    return false;
                }

                // Kiểm tra xem nhân viên có cung cấp dịch vụ này không
                bool providesService = await _context.StaffServices
                    .AnyAsync(ss => ss.StaffId == staffId.Value && ss.ServiceId == serviceId);

                if (!providesService)
                {
                    return false;
                }
            }

            // Kiểm tra các lịch hẹn đã tồn tại
            // Chỉ kiểm tra xung đột khi có staff được chỉ định
            if (staffId.HasValue)
            {
                var staffQuery = _context.Appointments
                    .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                    .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                    .Where(a => a.StaffId == staffId.Value);

                var conflictingAppointments = await staffQuery
                    .Where(a =>
                        // Kiểm tra xem thời gian bắt đầu của lịch hẹn mới nằm trong khoảng thời gian của lịch hẹn cũ
                        (appointmentDate >= a.AppointmentDate && appointmentDate < a.EndTime) ||
                        // Kiểm tra xem thời gian kết thúc (bao gồm buffer) của lịch hẹn mới có xung đột với lịch hẹn cũ
                        (bufferEndTime > a.AppointmentDate && bufferEndTime <= a.EndTime) ||
                        // Kiểm tra xem lịch hẹn mới bao trùm lịch hẹn cũ
                        (appointmentDate <= a.AppointmentDate && bufferEndTime >= a.EndTime)
                    )
                    .ToListAsync();

                return conflictingAppointments.Count == 0;
            }

            // Khi không có staff được chỉ định, luôn cho phép đặt lịch (không kiểm tra xung đột)
            return true;
        }

        public async Task<ServiceDto> GetServiceById(int serviceId)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null)
                return null;

            return new ServiceDto
            {
                ServiceId = service.ServiceId,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                Duration = service.Duration,
                Photo = service.Photo,
                IsActive = service.IsActive
            };
        }

        public async Task<AppointmentDto> UpdateCompletionTimeAsync(int id, DateTime actualCompletionTime, string notes = null)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return null;

            appointment.EndTime = actualCompletionTime;
            appointment.Status = "Completed";
            if (!string.IsNullOrEmpty(notes))
            {
                appointment.Notes = notes;
            }
            appointment.UpdatedAt = _dateTimeService.Now;

            await _context.SaveChangesAsync();
            return await GetAppointmentByIdAsync(id);
        }

        public async Task<List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>> GetAvailableTimeSlotsAsync(DateTime date, int serviceId, int? staffId, bool includeUnavailable = true, int? petId = null)
        {
            var timeSlots = new List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>();

            // Tìm service và kiểm tra thời lượng
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null || service.Duration <= 0)
            {
                return timeSlots;
            }

            // Lấy tất cả appointments trong ngày để check conflicts (KHÔNG phụ thuộc vào staffId)
            var appointmentDay = date.Date;
            var nextDay = appointmentDay.AddDays(1);

            // ✅ FIXED: Lấy TẤT CẢ appointments trong ngày để check staff busy chính xác
            var allAppointments = await _context.Appointments
                .Include(a => a.Service)
                .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                .Select(a => new
                {
                    a.AppointmentId,
                    a.AppointmentDate,
                    a.EndTime,
                    a.StaffId,
                    a.PetId,
                    a.Status,
                    ServiceDuration = a.Service.Duration
                })
                .ToListAsync();

            // ✅ NEW: Lấy staff appointments nếu có staffId được chỉ định
            var staffAppointments = staffId.HasValue 
                ? allAppointments.Where(a => a.StaffId == staffId.Value).ToArray()
                : new dynamic[0];

            // ✅ DEBUG: Log staff appointments for debugging
            if (staffId.HasValue)
            {
                Console.WriteLine($"DEBUG: Staff {staffId} appointments filter - Found {staffAppointments.Length} appointments");
                foreach (var apt in staffAppointments)
                {
                    var endTimeStr = apt.EndTime?.ToString("HH:mm") ?? "No end time";
                    Console.WriteLine($"DEBUG: Staff {staffId} appointment: {apt.AppointmentDate:HH:mm} - {endTimeStr} (Status: {apt.Status})");
                }
            }

            // Lấy thông tin nhân viên khả dụng
            var availableStaffQuery = _context.Staff
                .Include(s => s.User)
                .Include(s => s.StaffServices)
                .ThenInclude(ss => ss.Service)
                .Where(s => s.IsActive == true && s.StaffServices.Any(ss => ss.ServiceId == serviceId));

            if (staffId.HasValue)
            {
                availableStaffQuery = availableStaffQuery.Where(s => s.StaffId == staffId.Value);
            }

            var staffInfo = await availableStaffQuery
                .ToDictionaryAsync(s => s.StaffId, s => new
                {
                    StaffId = s.StaffId,
                    StaffName = s.User != null ? s.User.FullName : "Unknown Staff",
                    IsActive = s.IsActive
                });

            // Kiểm tra lịch làm việc của nhân viên
            var workingStaffIds = staffInfo.Keys.ToList();
            if (workingStaffIds.Any())
            {
                var staffSchedules = await _context.StaffSchedules
                    .Where(ss => workingStaffIds.Contains(ss.StaffId) && ss.Date.Date == appointmentDay)
                    .ToListAsync();

                // Loại bỏ nhân viên không làm việc trong ngày
                foreach (var schedule in staffSchedules.Where(s => s.IsWorking == false))
                {
                    staffInfo.Remove(schedule.StaffId);
                }
            }

            // Tạo các time slots dựa trên service duration + buffer
            TimeSpan openingTime = new TimeSpan(8, 0, 0);
            TimeSpan closingTime = new TimeSpan(21, 30, 0);
            
            // ✅ FIXED: Tính toán slot interval dựa trên service duration + buffer
            int slotIntervalMinutes = service.Duration + BUFFER_TIME_MINUTES; // Service duration + 10 min buffer
            
            Console.WriteLine($"🔧 [BACKEND SLOTS] Creating slots with service duration: {service.Duration}min, interval: {slotIntervalMinutes}min");

            for (TimeSpan currentTime = openingTime; currentTime <= closingTime; currentTime = currentTime.Add(TimeSpan.FromMinutes(slotIntervalMinutes)))
            {
                var slotStartTime = appointmentDay.Add(currentTime);
                var slotEndTime = slotStartTime.AddMinutes(service.Duration);
                var bufferEndTime = slotEndTime.AddMinutes(BUFFER_TIME_MINUTES);

                // Kiểm tra xem slot có nằm trong giờ làm việc không
                if (slotEndTime.TimeOfDay > closingTime)
                {
                    continue;
                }

                // ✅ FIXED: Tìm nhân viên khả dụng cho slot này - CHỈ kiểm tra theo staffId
                var availableStaffForThisSlot = new List<dynamic>();

                foreach (var staff in staffInfo.Values)
                {
                    bool staffBusy = false;

                    // ✅ QUAN TRỌNG: CHỈ kiểm tra busy khi có staffId cụ thể
                    if (staffId.HasValue && staffId.Value == staff.StaffId)
                    {
                        // Nếu đang check slot cho staff cụ thể, check appointments của staff đó
                        foreach (var appointment in staffAppointments)
                        {
                            var appointmentEndTime = appointment.EndTime ?? appointment.AppointmentDate.AddMinutes(appointment.ServiceDuration);
                            var appointmentBufferEndTime = appointmentEndTime.AddMinutes(BUFFER_TIME_MINUTES);

                            // Kiểm tra xung đột
                            if ((slotStartTime >= appointment.AppointmentDate && slotStartTime < appointmentEndTime) ||
                                (slotEndTime > appointment.AppointmentDate && slotEndTime <= appointmentBufferEndTime) ||
                                (slotStartTime <= appointment.AppointmentDate && slotEndTime >= appointmentBufferEndTime))
                            {
                                staffBusy = true;
                                break;
                            }
                        }
                    }
                    else if (!staffId.HasValue)
                    {
                        // ✅ QUAN TRỌNG: Khi không có staffId, coi tất cả staff là khả dụng (không check busy)
                        // Điều này đảm bảo không hiển thị lịch bận của bất kỳ staff nào khi chưa chọn staff
                        staffBusy = false;
                    }
                    else
                    {
                        // Nếu staffId được chỉ định nhưng không phải staff hiện tại, bỏ qua
                        continue;
                    }

                    if (!staffBusy)
                    {
                        availableStaffForThisSlot.Add(staff);
                    }
                }

                // Kiểm tra xem thời điểm hiện tại có phải là quá khứ không
                bool isPast = _dateTimeService.Now > slotStartTime;

                // ✅ KIỂM TRA STAFF BUSY - CHỈ kiểm tra nếu có staffId cụ thể
                bool isStaffBusy = false;
                
                // ✅ FIXED: CHỈ kiểm tra staff busy khi có staffId được chỉ định cụ thể
                if (staffId.HasValue)
                {
                    // Trường hợp có staff cụ thể: kiểm tra appointments của staff đó
                    foreach (var appointment in staffAppointments)
                    {
                        var appointmentEndTime = appointment.EndTime ?? appointment.AppointmentDate.AddMinutes(appointment.ServiceDuration);
                        var appointmentBufferEndTime = appointmentEndTime.AddMinutes(BUFFER_TIME_MINUTES);

                        // Kiểm tra xung đột
                        if ((slotStartTime >= appointment.AppointmentDate && slotStartTime < appointmentEndTime) ||
                            (slotEndTime > appointment.AppointmentDate && slotEndTime <= appointmentBufferEndTime) ||
                            (slotStartTime <= appointment.AppointmentDate && slotEndTime >= appointmentBufferEndTime))
                        {
                            isStaffBusy = true;
                            break;
                        }
                    }
                }
                // ✅ QUAN TRỌNG: Khi không có staffId, KHÔNG kiểm tra staff busy để tránh hiển thị lịch bận của các staff khác

                // ✅ DEBUG: Log slot analysis for specific problematic times
                if (staffId.HasValue && ((slotStartTime.Hour == 17 && slotStartTime.Minute == 20) || (slotStartTime.Hour == 19 && slotStartTime.Minute == 40)))
                {
                    Console.WriteLine($"🔍 DEBUG SLOT {slotStartTime:HH:mm}: Staff {staffId} busy analysis");
                    Console.WriteLine($"   - Staff appointments count: {staffAppointments.Length}");
                    Console.WriteLine($"   - Checking slot: {slotStartTime:HH:mm} - {slotEndTime:HH:mm}");
                    
                    foreach (var appointment in staffAppointments)
                    {
                        var appointmentEndTime = appointment.EndTime ?? appointment.AppointmentDate.AddMinutes(appointment.ServiceDuration);
                        var appointmentBufferEndTime = appointmentEndTime.AddMinutes(BUFFER_TIME_MINUTES);
                        
                        var conflict1 = slotStartTime >= appointment.AppointmentDate && slotStartTime < appointmentEndTime;
                        var conflict2 = slotEndTime > appointment.AppointmentDate && slotEndTime <= appointmentBufferEndTime;
                        var conflict3 = slotStartTime <= appointment.AppointmentDate && slotEndTime >= appointmentBufferEndTime;
                        var hasConflict = conflict1 || conflict2 || conflict3;
                        
                        Console.WriteLine($"   - Appointment {appointment.AppointmentDate:HH:mm}-{appointmentEndTime:HH:mm}(+{BUFFER_TIME_MINUTES}min) Status:{appointment.Status} => Conflict: {hasConflict}");
                        Console.WriteLine($"     Checks: C1={conflict1}, C2={conflict2}, C3={conflict3}");
                    }
                    
                    Console.WriteLine($"   - Final isStaffBusy: {isStaffBusy}");
                }

                // ✅ KIỂM TRA PET BUSY - Kiểm tra có conflict với lịch hẹn của thú cưng không
                bool isPetBusy = false;
                if (petId.HasValue)
                {
                    var petAppointments = await _context.Appointments
                        .Where(a => a.AppointmentDate.Date == appointmentDay)
                        .Where(a => a.PetId == petId.Value)
                        .Where(a => a.Status != "Cancelled" && a.Status != "No-Show")
                        .Select(a => new
                        {
                            a.AppointmentDate,
                            a.EndTime,
                            a.ServiceId
                        })
                        .ToListAsync();

                    foreach (var appointment in petAppointments)
                    {
                        var appointmentEndTime = appointment.EndTime ?? appointment.AppointmentDate.AddMinutes(service.Duration);
                        var appointmentBufferEndTime = appointmentEndTime.AddMinutes(BUFFER_TIME_MINUTES);

                        // Kiểm tra xung đột
                        if ((slotStartTime >= appointment.AppointmentDate && slotStartTime < appointmentEndTime) ||
                            (slotEndTime > appointment.AppointmentDate && slotEndTime <= appointmentBufferEndTime) ||
                            (slotStartTime <= appointment.AppointmentDate && slotEndTime >= appointmentBufferEndTime))
                        {
                            isPetBusy = true;
                            break;
                        }
                    }
                }

                // ✅ FIXED: Tạo reason nếu slot không khả dụng - chỉ hiển thị lý do phù hợp
                string unavailableReason = null;
                if (isPetBusy)
                {
                    unavailableReason = "Thú cưng đã có lịch hẹn vào thời gian này";
                }
                else if (staffId.HasValue && isStaffBusy)
                {
                    // Chỉ hiển thị "nhân viên bận" khi có staffId cụ thể
                    unavailableReason = "Nhân viên đã có lịch hẹn vào thời gian này";
                }
                else if (staffId.HasValue && !availableStaffForThisSlot.Any())
                {
                    // Khi có staffId nhưng staff không available (có thể do không làm việc, không cung cấp dịch vụ, v.v.)
                    unavailableReason = "Nhân viên không khả dụng vào thời gian này";
                }
                else if (isPast)
                {
                    unavailableReason = "Đã qua thời gian này";
                }
                // ✅ QUAN TRỌNG: Không hiển thị "Không có nhân viên khả dụng" khi chưa chọn staff

                // ✅ FIXED: Logic khả dụng mới - chỉ check staff busy khi có staffId
                bool isSlotAvailable;
                if (staffId.HasValue)
                {
                    // Khi có staffId cụ thể: kiểm tra staff busy, pet busy, past time
                    isSlotAvailable = availableStaffForThisSlot.Any() && !isPast && !isStaffBusy && !isPetBusy;
                }
                else
                {
                    // Khi không có staffId: chỉ kiểm tra pet busy và past time (KHÔNG kiểm tra staff busy)
                    isSlotAvailable = !isPast && !isPetBusy;
                }

                var timeSlotDto = new BE_PetWeb_API.DTOs.Appointment.TimeSlotDto
                {
                    Id = $"slot-{slotStartTime.ToString("yyyy-MM-dd-HH-mm")}",
                    StartTime = slotStartTime,
                    EndTime = slotEndTime,
                    BufferEndTime = bufferEndTime,
                    Available = isSlotAvailable,
                    IsAvailable = isSlotAvailable,
                    IsPetBusy = isPetBusy, // ✅ SET TRƯỜNG MỚI
                    IsStaffBusy = isStaffBusy, // ✅ SET TRƯỜNG MỚI
                    IsPast = isPast,
                    IsPastTime = isPast,
                    IsWithinWorkingHours = true, // Đã được lọc khi tạo slot
                    UnavailableReason = unavailableReason,
                    SelectedDate = date.Date.ToString("yyyy-MM-dd"),
                    Duration = service.Duration,
                    BufferTime = BUFFER_TIME_MINUTES,
                    StaffId = staffId,
                    StaffName = staffId.HasValue && staffInfo.ContainsKey(staffId.Value) ? staffInfo[staffId.Value].StaffName : null,
                    // KHÔNG gán giá trị cho TimeDisplayString - nó sẽ tự động tính toán
                    AvailableStaff = availableStaffForThisSlot.Select(s => new StaffAvailabilityDto
                    {
                        StaffId = s.StaffId,
                        StaffName = s.StaffName,
                        AppointmentCount = 0,
                        IsFullyBooked = false,
                        IsWorking = true
                    }).ToList()
                };

                // ✅ FIXED: Logic bao gồm slots chính xác
                // - Luôn bao gồm available slots
                // - Bao gồm busy slots dựa trên staffId và includeUnavailable
                bool shouldIncludeSlot = false;
                
                if (timeSlotDto.Available)
                {
                    // Luôn bao gồm available slots
                    shouldIncludeSlot = true;
                }
                else if (includeUnavailable)
                {
                    if (staffId.HasValue)
                    {
                        // Khi có staffId: bao gồm staff busy slots và pet busy slots
                        shouldIncludeSlot = timeSlotDto.IsStaffBusy || timeSlotDto.IsPetBusy || isPast;
                    }
                    else
                    {
                        // Khi không có staffId: chỉ bao gồm pet busy slots (không bao gồm staff busy)
                        shouldIncludeSlot = timeSlotDto.IsPetBusy || isPast;
                    }
                }

                // ✅ DEBUG: Log để kiểm tra logic
                if ((slotStartTime.Hour == 17 && slotStartTime.Minute == 20) || 
                    (slotStartTime.Hour == 19 && slotStartTime.Minute == 40) ||
                    (slotStartTime.Hour == 9 && slotStartTime.Minute == 0) ||
                    (slotStartTime.Hour == 13 && slotStartTime.Minute == 0))
                {
                    Console.WriteLine($"🔍 SLOT {slotStartTime:HH:mm} Decision:");
                    Console.WriteLine($"   - Available: {timeSlotDto.Available}");
                    Console.WriteLine($"   - IsStaffBusy: {timeSlotDto.IsStaffBusy}");
                    Console.WriteLine($"   - IsPetBusy: {timeSlotDto.IsPetBusy}");
                    Console.WriteLine($"   - IsPast: {isPast}");
                    Console.WriteLine($"   - IncludeUnavailable: {includeUnavailable}");
                    Console.WriteLine($"   - StaffId: {staffId?.ToString() ?? "null"}");
                    Console.WriteLine($"   - ShouldInclude: {shouldIncludeSlot}");
                }

                if (shouldIncludeSlot)
                {
                    timeSlots.Add(timeSlotDto);
                }
            }

            return timeSlots;
        }

        // Thêm phương thức debug để kiểm tra khả dụng của khung giờ
        public async Task<Dictionary<string, object>> DebugTimeSlotAvailability(DateTime date, int serviceId, int? staffId)
        {
            var result = new Dictionary<string, object>();

            try
            {
                // Thêm thông tin cơ bản
                result["requestDate"] = date;
                result["serviceId"] = serviceId;
                result["staffId"] = staffId;

                var service = await _context.Services.FindAsync(serviceId);
                if (service == null)
                {
                    result["error"] = "Service not found";
                    return result;
                }

                result["serviceName"] = service.Name;
                result["serviceDuration"] = service.Duration;

                // Kiểm tra thời gian làm việc
                TimeSpan openingTime = new TimeSpan(8, 0, 0);
                TimeSpan closingTime = new TimeSpan(21, 30, 0);
                TimeSpan requestedTime = date.TimeOfDay;

                result["openingTime"] = openingTime.ToString();
                result["closingTime"] = closingTime.ToString();
                result["requestedTime"] = requestedTime.ToString();
                result["isWithinWorkingHours"] = (requestedTime >= openingTime && requestedTime <= closingTime);                // Tính toán các thời gian
                var serviceEndTime = date.AddMinutes(service.Duration);
                var bufferEndTime = serviceEndTime.AddMinutes(BUFFER_TIME_MINUTES);

                result["serviceEndTime"] = serviceEndTime;
                result["bufferTime"] = BUFFER_TIME_MINUTES;
                result["bufferEndTime"] = bufferEndTime;

                // Lấy thông tin nhân viên nếu có
                if (staffId.HasValue)
                {
                    var staff = await _context.Staff
                        .Include(s => s.User)
                        .FirstOrDefaultAsync(s => s.StaffId == staffId.Value);

                    if (staff != null)
                    {
                        result["staffName"] = staff.User?.FullName;
                        result["staffIsActive"] = staff.IsActive;

                        // Kiểm tra lịch làm việc
                        var staffSchedule = await _context.StaffSchedules
                            .FirstOrDefaultAsync(ss => ss.StaffId == staffId.Value && ss.Date.Date == date.Date);

                        result["staffScheduleFound"] = staffSchedule != null;
                        result["staffIsWorking"] = staffSchedule?.IsWorking ?? false;

                        // Kiểm tra dịch vụ
                        bool providesService = await _context.StaffServices
                            .AnyAsync(ss => ss.StaffId == staffId.Value && ss.ServiceId == serviceId);

                        result["staffProvidesService"] = providesService;
                    }
                    else
                    {
                        result["staffFound"] = false;
                    }
                }

                // Lấy các lịch hẹn trong ngày
                var appointmentDay = date.Date;
                var nextDay = appointmentDay.AddDays(1);

                var appointmentsQuery = _context.Appointments
                    .Where(a => a.AppointmentDate >= appointmentDay && a.AppointmentDate < nextDay)
                    .Where(a => a.Status != "Cancelled" && a.Status != "No-Show");

                if (staffId.HasValue)
                {
                    appointmentsQuery = appointmentsQuery.Where(a => a.StaffId == staffId.Value);
                }

                var appointments = await appointmentsQuery
                    .Select(a => new
                    {
                        a.AppointmentId,
                        a.AppointmentDate,
                        EndTime = a.EndTime ?? a.AppointmentDate.AddMinutes(a.Service != null ? a.Service.Duration : DEFAULT_SERVICE_DURATION_MINUTES),
                        a.PetId,
                        a.ServiceId,
                        a.StaffId,
                        a.Status
                    })
                    .ToListAsync();

                result["totalAppointmentsOnDay"] = appointments.Count;

                // Tìm các lịch hẹn xung đột
                var conflictingAppointments = appointments
                    .Where(a =>
                        // Kiểm tra xem thời gian bắt đầu của lịch hẹn mới nằm trong khoảng thời gian của lịch hẹn cũ
                        (date >= a.AppointmentDate && date < a.EndTime) ||
                        // Kiểm tra xem thời gian kết thúc (bao gồm buffer) của lịch hẹn mới có xung đột với lịch hẹn cũ
                        (bufferEndTime > a.AppointmentDate && bufferEndTime <= a.EndTime) ||
                        // Kiểm tra xem lịch hẹn mới bao trùm lịch hẹn cũ
                        (date <= a.AppointmentDate && bufferEndTime >= a.EndTime)
                    )
                    .ToList();

                result["conflictingAppointments"] = conflictingAppointments;
                result["isTimeSlotAvailable"] = conflictingAppointments.Count == 0 &&
                    (requestedTime >= openingTime && serviceEndTime.TimeOfDay <= closingTime);

                return result;
            }
            catch (Exception ex)
            {
                result["error"] = ex.Message;
                result["stackTrace"] = ex.StackTrace;
                return result;
            }
        }

        // Thêm phương thức lấy các khung giờ bận của pet
        public async Task<List<string>> GetPetBusyTimeSlotsAsync(int petId, DateTime date)
        {
            var appointments = await _context.Appointments
                .Where(a => a.PetId == petId &&
                       a.AppointmentDate.Date == date.Date &&
                       a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                .OrderBy(a => a.AppointmentDate)
                .ToListAsync();

            // Chuyển đổi danh sách các cuộc hẹn thành danh sách các khung giờ bận
            var busyTimeSlots = new List<string>();
            foreach (var appointment in appointments)
            {
                var startTime = appointment.AppointmentDate;
                var endTime = appointment.EndTime ?? startTime.AddMinutes(DEFAULT_SERVICE_DURATION_MINUTES);
                var duration = (int)(endTime - startTime).TotalMinutes;                // Thêm tất cả các khung giờ display (30 phút) bị ảnh hưởng
                for (DateTime time = startTime; time < endTime; time = time.AddMinutes(DEFAULT_SLOT_INTERVAL_MINUTES))
                {
                    busyTimeSlots.Add(time.ToString("HH:mm"));
                }
            }

            return busyTimeSlots.Distinct().ToList();
        }

        // Thêm phương thức kiểm tra xung đột cho pet
        public async Task<List<object>> CheckPetConflicts(int petId, DateTime date)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Where(a => a.PetId == petId &&
                       a.AppointmentDate.Date == date.Date &&
                       a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                .Select(a => new
                {
                    a.AppointmentId,
                    a.AppointmentDate,
                    EndTime = a.EndTime ?? a.AppointmentDate.AddMinutes(a.Service.Duration),
                    a.ServiceId,
                    ServiceName = a.Service.Name,
                    a.StaffId,
                    StaffName = a.Staff.User.FullName
                })
                .ToListAsync();

            return appointments.Cast<object>().ToList();
        }

        // Thêm phương thức kiểm tra xung đột cho staff
        public async Task<List<object>> CheckStaffConflicts(int staffId, DateTime date, int duration)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Pet)
                .Where(a => a.StaffId == staffId &&
                       a.AppointmentDate.Date == date.Date &&
                       a.Status != "Cancelled" && a.Status != "No-Show" && a.Status != "Completed")
                .Select(a => new
                {
                    a.AppointmentId,
                    a.AppointmentDate,
                    EndTime = a.EndTime ?? a.AppointmentDate.AddMinutes(a.Service.Duration),
                    a.ServiceId,
                    ServiceName = a.Service.Name,
                    PetName = a.Pet.Name,
                    OwnerName = a.User.FullName
                })
                .ToListAsync();

            return appointments.Cast<object>().ToList();
        }

        private async Task<bool> IsUserAdminOrStaff(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            return user.Role == "Admin" || user.Role == "Staff";
        }

        private async Task<bool> IsUserAdmin(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            return user.Role == "Admin";
        }

        private async Task<bool> IsUserStaff(int userId, int staffId)
        {
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.StaffId == staffId);
            if (staff == null)
                return false;

            return staff.UserId == userId;
        }

        // ✅ NEW: Add method to get staff busy slots specifically for debugging
        public async Task<List<string>> GetStaffBusyTimeSlotsAsync(int staffId, DateTime date)
        {
            try
            {
                var busyTimeSlots = new List<string>();
                
                var appointments = await _context.Appointments
                    .Include(a => a.Service)
                    .Where(a => a.StaffId == staffId &&
                           a.AppointmentDate.Date == date.Date &&
                           a.Status != "Cancelled" && 
                           a.Status != "No-Show" && 
                           a.Status != "Completed")
                    .OrderBy(a => a.AppointmentDate)
                    .ToListAsync();

                foreach (var appointment in appointments)
                {
                    var startTime = appointment.AppointmentDate;
                    var serviceDuration = appointment.Service?.Duration ?? DEFAULT_SERVICE_DURATION_MINUTES;
                    var endTime = appointment.EndTime ?? startTime.AddMinutes(serviceDuration);
                    
                    // Thêm buffer time
                    endTime = endTime.AddMinutes(BUFFER_TIME_MINUTES);

                    // Thêm tất cả các khung giờ 30 phút bị ảnh hưởng
                    for (DateTime time = new DateTime(date.Year, date.Month, date.Day, 8, 0, 0);
                         time <= new DateTime(date.Year, date.Month, date.Day, 21, 30, 0);
                         time = time.AddMinutes(DEFAULT_SLOT_INTERVAL_MINUTES))
                    {
                        DateTime slotEnd = time.AddMinutes(DEFAULT_SLOT_INTERVAL_MINUTES);
                        
                        if ((time >= startTime && time < endTime) ||
                            (slotEnd > startTime && slotEnd <= endTime) ||
                            (time <= startTime && slotEnd >= endTime))
                        {
                            busyTimeSlots.Add(time.ToString("HH:mm"));
                        }
                    }
                }

                return busyTimeSlots.Distinct().ToList();
            }
            catch (Exception ex)
            {
                // Log error and return empty list
                return new List<string>();
            }
        }
    }
}