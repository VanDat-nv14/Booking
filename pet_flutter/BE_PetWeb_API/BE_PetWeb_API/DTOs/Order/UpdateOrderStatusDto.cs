using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Order
{
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; }
    }
}