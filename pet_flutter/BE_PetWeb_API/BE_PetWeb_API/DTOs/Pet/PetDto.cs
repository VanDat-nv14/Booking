using System;

namespace BE_PetWeb_API.DTOs.Pet
{
    public class PetDto
    {
        public int PetId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Species { get; set; }
        public string Breed { get; set; }
        public string Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }  // Đảm bảo là nullable
        public decimal? Weight { get; set; }        // Đảm bảo là nullable
        public string Color { get; set; }
        public string Description { get; set; }
        public string Photo { get; set; }
        public string OwnerName { get; set; }
    }
}