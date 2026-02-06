using System.Security.Claims;
using BE_PetWeb_API.DTOs.Cart;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace BE_PetWeb_API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _logger = logger;
    }

    // GET: api/Cart
    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetUserCartAsync(userId);
            
            // Debug logging
            Console.WriteLine($"GetCart for user {userId}:");
            Console.WriteLine($"Cart structure: {JsonSerializer.Serialize(cart)}");
            
            return Ok(cart);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetCart: {ex.Message}");
            return BadRequest(ex.Message);
        }
    }

    // POST: api/Cart/add
    [HttpPost("add")]
    public async Task<ActionResult<CartDto>> AddToCart(AddToCartDto addToCartDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.AddToCartAsync(userId, addToCartDto);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error adding product {addToCartDto.ProductId} to cart");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Cart/items/{cartItemId}
    [HttpPut("items/{cartItemId}")]
    public async Task<ActionResult<CartDto>> UpdateCartItem(int cartItemId, UpdateCartItemDto updateCartItemDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.UpdateCartItemAsync(userId, cartItemId, updateCartItemDto);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating cart item {cartItemId}");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Cart/items/{cartItemId}
    [HttpDelete("items/{cartItemId}")]
    public async Task<IActionResult> RemoveCartItem(int cartItemId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _cartService.RemoveCartItemAsync(userId, cartItemId);
            if (!result)
            {
                return NotFound("Cart item not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error removing cart item {cartItemId}");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Cart/clear
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _cartService.ClearCartAsync(userId);
            if (!result)
            {
                return NotFound("Cart not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart");
            return BadRequest(ex.Message);
        }
    }

    // POST: api/Cart/sync
    [HttpPost("sync")]
    public async Task<ActionResult<CartDto>> SyncCartFromLocalStorage(List<AddToCartDto> cartItems)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.SyncCartFromLocalStorageAsync(userId, cartItems);
            return Ok(cart);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing cart from localStorage");
            return BadRequest(ex.Message);
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new Exception("User ID claim not found");

        return int.Parse(userIdClaim.Value);
    }
} 