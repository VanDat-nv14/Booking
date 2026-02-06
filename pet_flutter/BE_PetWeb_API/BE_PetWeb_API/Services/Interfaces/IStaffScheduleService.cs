using BE_PetWeb_API.DTOs;
using BE_PetWeb_API.DTOs.Staff;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IStaffScheduleService
    {
        Task<List<StaffScheduleDto>> GetStaffScheduleByMonthYear(int staffId, int month, int year);
        Task<StaffScheduleDto> SetStaffSchedule(SetStaffScheduleDto scheduleDto);
        Task<StaffAvailabilityResponseDto> CheckStaffAvailability(int staffId, DateTime date);
    }
}