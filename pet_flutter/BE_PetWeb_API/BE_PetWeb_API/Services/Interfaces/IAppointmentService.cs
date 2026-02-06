using BE_PetWeb_API.DTOs.Appointment;
using BE_PetWeb_API.DTOs.Service;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateRangeAsync(DateTime startDate, DateTime endDate);

        Task<IEnumerable<AppointmentDto>> GetStaffAppointmentsByDateAsync(int staffId, DateTime date);

        Task<IEnumerable<AppointmentDto>> GetAllAppointmentsAsync();

        Task<IEnumerable<AppointmentDto>> GetUserAppointmentsAsync(int userId);

        Task<IEnumerable<AppointmentDto>> GetStaffAppointmentsAsync(int staffId);

        Task<AppointmentDto> GetAppointmentByIdAsync(int id);

        Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateAsync(DateTime date);

        Task<IEnumerable<AppointmentDto>> GetAppointmentsByStatusAsync(string status);

        Task<AppointmentDto> CreateAppointmentAsync(int userId, CreateAppointmentDto createAppointmentDto, bool isAdminOrStaff = false);

        Task<AppointmentDto> UpdateAppointmentAsync(int id, int userId, UpdateAppointmentDto updateAppointmentDto);

        Task<AppointmentDto> UpdateAppointmentStatusAsync(int id, int userId, UpdateAppointmentStatusDto updateStatusDto);

        Task<bool> CancelAppointmentAsync(int id, int userId);

        Task<bool> IsUserAppointment(int appointmentId, int userId);

        Task<bool> IsStaffAppointment(int appointmentId, int staffId);

        Task<bool> IsTimeSlotAvailable(DateTime appointmentDate, int serviceId, int? staffId);

        // Thêm vào interface IAppointmentService
        Task<ServiceDto> GetServiceById(int serviceId);

        // Thay đổi signature của phương thức để không yêu cầu userId
        Task<AppointmentDto> UpdateCompletionTimeAsync(int id, DateTime actualCompletionTime, string notes = null);

        Task<List<BE_PetWeb_API.DTOs.Appointment.TimeSlotDto>> GetAvailableTimeSlotsAsync(
     DateTime date, int serviceId, int? staffId, bool includeUnavailable = true, int? petId = null);
       
        Task<bool> CancelAppointmentAsync(int id, int userId, string reason);

        // Thêm phương thức mới
        Task<bool> IsTimeSlotAvailableAsync(DateTime date, int serviceId, int? staffId);

        // Thêm phương thức debug
        Task<Dictionary<string, object>> DebugTimeSlotAvailability(DateTime date, int serviceId, int? staffId);
        // Thêm phương thức lấy busy slots của pet
        Task<List<string>> GetPetBusyTimeSlotsAsync(int petId, DateTime date);
        // Thêm vào interface IAppointmentService
        Task<List<object>> CheckPetConflicts(int petId, DateTime date);
        Task<List<object>> CheckStaffConflicts(int staffId, DateTime date, int duration);

        // Thêm phương thức mới để lấy staff busy slots
        Task<List<string>> GetStaffBusyTimeSlotsAsync(int staffId, DateTime date);
    }
}