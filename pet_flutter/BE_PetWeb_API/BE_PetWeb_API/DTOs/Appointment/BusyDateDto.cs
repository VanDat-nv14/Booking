namespace BE_PetWeb_API.DTOs.Appointment
{
    public class BusyDateDto
    {
        public DateTime Date { get; set; }
        public List<string> BusySlots { get; set; }
        public List<BusyTimeSlotDto> BusyTimeSlots { get; set; }
    }
}
