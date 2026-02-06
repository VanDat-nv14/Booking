using BE_PetWeb_API.DTOs.Calendar;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IAvailabilityService
    {
        Task<List<TimeSlotDto>> GetAvailableTimeSlotsAsync(int staffId, DateTime date);
        Task<BE_PetWeb_API.DTOs.Calendar.StaffAvailabilityDto> SetStaffAvailabilityAsync(int staffId, SetAvailabilityDto availabilityDto);
        Task<bool> CheckTimeConflictAsync(int staffId, DateTime startTime, DateTime endTime);
        Task<BE_PetWeb_API.DTOs.Calendar.StaffAvailabilityDto> GetStaffAvailabilityAsync(int staffId, DateTime date);
    }
}