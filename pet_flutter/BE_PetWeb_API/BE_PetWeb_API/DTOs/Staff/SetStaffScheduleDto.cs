namespace BE_PetWeb_API.DTOs.Staff
{
    public class SetStaffScheduleDto
    {
        public int StaffId { get; set; }
        public DateTime Date { get; set; }
        public bool IsWorking { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Notes { get; set; }
    }
}
