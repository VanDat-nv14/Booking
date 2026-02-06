namespace BE_PetWeb_API.DTOs.Staff
{
    public class StaffAvailabilityResponseDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public DateTime Date { get; set; }
        public bool IsWorking { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public List<BookedSlotDto> BookedSlots { get; set; } = new List<BookedSlotDto>();
    }
}
