namespace BE_PetWeb_API.DTOs.Staff
{
    public class BookedSlotDto
    {
        public int AppointmentId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string ServiceName { get; set; }
    }
}
