namespace BE_PetWeb_API.DTOs.Appointment
{
    public class TimeSlotAvailabilityResultDto
    {
        public bool Available { get; set; }
        public string Reason { get; set; }
        public int? ServiceId { get; set; }
        public string ServiceName { get; set; }
        public int? ServiceDuration { get; set; }
        public DateTime Date { get; set; }
        public int? StaffId { get; set; }
        public string StaffName { get; set; }
        public int? PetId { get; set; }
        public List<string> PetBusySlots { get; set; }
        public bool IsPetBusy { get; set; }
        public bool IsWithinWorkingHours { get; set; }
        public bool IsPastTime { get; set; }
    }
}
