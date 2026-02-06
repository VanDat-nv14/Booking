using BE_PetWeb_API.DTOs.Cart;

namespace BE_PetWeb_API.Services.Interfaces;

public interface ICartService
{
    Task<CartDto> GetUserCartAsync(int userId);
    Task<CartDto> AddToCartAsync(int userId, AddToCartDto addToCartDto);
    Task<CartDto> UpdateCartItemAsync(int userId, int cartItemId, UpdateCartItemDto updateCartItemDto);
    Task<bool> RemoveCartItemAsync(int userId, int cartItemId);
    Task<bool> ClearCartAsync(int userId);
    Task<CartDto> SyncCartFromLocalStorageAsync(int userId, List<AddToCartDto> cartItems);
} 