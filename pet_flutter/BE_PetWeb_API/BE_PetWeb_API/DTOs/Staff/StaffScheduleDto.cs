namespace BE_PetWeb_API.DTOs.Staff
{
    public class StaffScheduleDto
    {
        public int StaffScheduleId { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public DateTime Date { get; set; }
        public bool IsWorking { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Notes { get; set; }
    }
}
