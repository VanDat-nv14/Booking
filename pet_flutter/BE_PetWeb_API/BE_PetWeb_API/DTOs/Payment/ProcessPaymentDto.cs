using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Payment
{
    public class ProcessPaymentDto
    {
        [Required]
        public string PaymentMethod { get; set; }

        [Required]
        public int OrderId { get; set; }

        // Thông tin thẻ tín dụng (chỉ sử dụng trong môi trường test)
        public string CardNumber { get; set; }
        public string CardHolderName { get; set; }
        public string ExpiryMonth { get; set; }
        public string ExpiryYear { get; set; }
        public string CVV { get; set; }

        // Thông tin ví điện tử
        public string WalletType { get; set; }
        public string WalletAccount { get; set; }
    }
}