using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Order
{
    public class UpdateOrderDto
    {
        public string ShippingAddress { get; set; }
        public string Status { get; set; }
    }
}