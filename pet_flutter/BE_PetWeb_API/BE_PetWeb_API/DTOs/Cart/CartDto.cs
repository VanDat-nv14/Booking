using BE_PetWeb_API.DTOs.Product;

namespace BE_PetWeb_API.DTOs.Cart;

public class CartDto
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<CartItemDto> CartItems { get; set; } = new List<CartItemDto>();
    public decimal TotalAmount { get; set; }
    public int TotalItems { get; set; }
} 