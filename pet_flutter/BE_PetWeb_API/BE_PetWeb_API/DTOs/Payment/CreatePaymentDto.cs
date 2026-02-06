using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Payment
{
    public class CreatePaymentDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public string PaymentMethod { get; set; }

        public string PaymentDetails { get; set; }
    }
}