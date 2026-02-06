using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BE_PetWeb_API.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        [JsonPropertyName("recipientName")]
        public string RecipientName { get; set; }

        [Required]
        [JsonPropertyName("recipientPhone")]
        public string RecipientPhone { get; set; }

        [Required]
        [JsonPropertyName("shippingAddress")]
        public string ShippingAddress { get; set; }

        [Required]
        [JsonPropertyName("paymentMethod")]
        public string PaymentMethod { get; set; }

        [JsonPropertyName("note")]
        public string Note { get; set; }

        [JsonPropertyName("shippingFee")]
        public decimal ShippingFee { get; set; }

        [JsonPropertyName("totalAmount")]
        public decimal TotalAmount { get; set; }

        [Required]
        [JsonPropertyName("orderItems")]
        public List<CreateOrderItemDto> OrderItems { get; set; }
    }

    public class CreateOrderItemDto
    {
        [Required]
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [Required]
        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("productOption")]
        public string? ProductOption { get; set; }
    }
}