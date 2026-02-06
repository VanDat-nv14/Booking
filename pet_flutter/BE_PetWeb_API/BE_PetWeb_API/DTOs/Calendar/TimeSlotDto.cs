using System;

namespace BE_PetWeb_API.DTOs.Calendar
{
    public class TimeSlotDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsPetBusy { get; set; }
        public bool IsStaffBusy { get; set; }
        public int? StaffId { get; set; }
        public string StaffName { get; set; }
    }
}