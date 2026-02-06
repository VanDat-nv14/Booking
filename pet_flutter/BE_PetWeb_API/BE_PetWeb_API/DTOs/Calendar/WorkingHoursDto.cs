using System;
using System.Collections.Generic;

namespace BE_PetWeb_API.DTOs.Calendar
{
    public class WorkingHoursDto
    {
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public List<DayOfWeek> DaysOfWeek { get; set; } = new List<DayOfWeek>();
    }
}