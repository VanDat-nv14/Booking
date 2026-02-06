using System;

namespace BE_PetWeb_API.DTOs.Calendar
{
    public class BreakTimeDto
    {
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string Reason { get; set; }
    }
}