using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Staff
{
    public class UpdateStaffDto
    {
        [StringLength(100)]
        public string Specialization { get; set; }

        public string Bio { get; set; }

        public int? Experience { get; set; }

        public IFormFile Avatar { get; set; }

    }
}