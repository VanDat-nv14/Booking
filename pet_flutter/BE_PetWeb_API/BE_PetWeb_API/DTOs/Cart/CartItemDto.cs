using BE_PetWeb_API.DTOs.Product;

namespace BE_PetWeb_API.DTOs.Cart;

public class CartItemDto
{
    public int CartItemId { get; set; }
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Option { get; set; }
    public DateTime? CreatedAt { get; set; }
    public ProductDto Product { get; set; }
    public decimal Subtotal { get; set; }
} 