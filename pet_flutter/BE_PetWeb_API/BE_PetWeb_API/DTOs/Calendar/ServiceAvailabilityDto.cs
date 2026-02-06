namespace BE_PetWeb_API.DTOs.Calendar
{
    public class ServiceAvailabilityDto
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public int Duration { get; set; }
        public decimal Price { get; set; }
    }
}
