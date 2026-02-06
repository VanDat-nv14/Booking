using System.Collections.Generic;

namespace BE_PetWeb_API.DTOs.Staff
{
    public class StaffDto
    {
        public int StaffId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Specialization { get; set; }
        public string Bio { get; set; }
        public int? Experience { get; set; }
        public decimal? Rating { get; set; }
        public string Avatar { get; set; }
        public List<StaffServiceDto> Services { get; set; }
    }
}