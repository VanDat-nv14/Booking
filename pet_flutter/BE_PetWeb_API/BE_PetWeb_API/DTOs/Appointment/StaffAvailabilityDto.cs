namespace BE_PetWeb_API.DTOs.Appointment
{
    public class StaffAvailabilityDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public int AppointmentCount { get; set; }
        public bool IsFullyBooked { get; set; }
        public bool IsWorking { get; set; }
    }
}
