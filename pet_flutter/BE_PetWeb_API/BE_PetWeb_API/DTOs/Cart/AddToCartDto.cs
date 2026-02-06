using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Cart;

public class AddToCartDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }

    public string? Option { get; set; }
} 