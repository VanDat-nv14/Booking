using System;
using System.Collections.Generic;

namespace BE_PetWeb_API.DTOs.Calendar
{
    public class StaffAvailabilityDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public DateTime Date { get; set; }
        public bool IsWorking { get; set; }
        public List<WorkingHoursDto> WorkingHours { get; set; } = new List<WorkingHoursDto>();
        public List<BreakTimeDto> BreakTimes { get; set; } = new List<BreakTimeDto>();
        public int AppointmentCount { get; set; }
        public List<ServiceAvailabilityDto> AvailableServices { get; set; } = new List<ServiceAvailabilityDto>();
    }
}