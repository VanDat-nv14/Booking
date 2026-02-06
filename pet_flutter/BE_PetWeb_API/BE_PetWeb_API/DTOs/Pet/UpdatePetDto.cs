using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Pet
{
    public class UpdatePetDto
    {
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string Name { get; set; }

        [Required]
        public string Species { get; set; }

        public string? Breed { get; set; }

        [Required]
        public string Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public decimal? Weight { get; set; }

        public string? Color { get; set; }

        public string? Description { get; set; }

        public IFormFile? Photo { get; set; }
    }
}