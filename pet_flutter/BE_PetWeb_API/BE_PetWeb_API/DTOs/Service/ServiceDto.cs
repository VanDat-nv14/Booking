namespace BE_PetWeb_API.DTOs.Service
{
    public class ServiceDto
    {
        public int ServiceId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public string Category { get; set; }
        public string Photo { get; set; }
        public bool? IsActive { get; set; }
        
        // Thêm các trường mới cho enhanced services page
        public double Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;
        public int BookingCount { get; set; } = 0;
        public int ViewCount { get; set; } = 0;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
