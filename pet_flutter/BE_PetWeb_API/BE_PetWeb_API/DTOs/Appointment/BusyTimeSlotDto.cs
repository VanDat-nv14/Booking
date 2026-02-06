namespace BE_PetWeb_API.DTOs.Appointment
{
    public class BusyTimeSlotDto
    {
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public int AppointmentId { get; set; }
    }
}
