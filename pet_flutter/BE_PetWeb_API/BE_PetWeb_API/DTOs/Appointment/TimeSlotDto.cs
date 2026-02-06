namespace BE_PetWeb_API.DTOs.Appointment
{
    public class TimeSlotDto
    {
        public string Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime? BufferEndTime { get; set; }
        public bool Available { get; set; }
        public bool IsAvailable { get; set; }
        public int? StaffId { get; set; }
        public string StaffName { get; set; }
        public int Duration { get; set; }
        public int? BufferTime { get; set; }
        public bool IsDefault { get; set; }
        public List<StaffAvailabilityDto> AvailableStaff { get; set; } = new List<StaffAvailabilityDto>();

        // Các trường mới thêm để hỗ trợ TimeSlotGrid
        public bool IsPetBusy { get; set; }
        public bool IsStaffBusy { get; set; }
        public string UnavailableReason { get; set; }
        public bool IsWithinWorkingHours { get; set; }
        public bool IsPast { get; set; }
        public bool IsPastTime { get; set; }
        public bool IsSelected { get; set; }
        public bool IsVisible { get; set; } = true;
        public bool IsBookable => IsAvailable && !IsPast && !IsPetBusy && !IsStaffBusy;
        public string TimeDisplayString => StartTime.ToString("HH:mm");
        public string SelectedDate { get; set; }
    }
}