using BE_PetWeb_API.DTOs.Cart;
using BE_PetWeb_API.DTOs.Product;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE_PetWeb_API.Services.Implementations;

public class CartService : ICartService
{
    private readonly PetWebContext _context;

    public CartService(PetWebContext context)
    {
        _context = context;
    }

    public async Task<CartDto> GetUserCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                    .ThenInclude(p => p.ProductImages)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            // Tạo cart mới nếu chưa có
            cart = new Cart
            {
                UserId = userId
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return MapToCartDto(cart);
    }

    public async Task<CartDto> AddToCartAsync(int userId, AddToCartDto addToCartDto)
    {
        // Kiểm tra sản phẩm có tồn tại và còn hàng không
        var product = await _context.Products.FindAsync(addToCartDto.ProductId);
        if (product == null || !product.IsActive.GetValueOrDefault())
        {
            throw new Exception("Sản phẩm không tồn tại hoặc không còn bán");
        }

        if (product.StockQuantity < addToCartDto.Quantity)
        {
            throw new Exception($"Sản phẩm chỉ còn {product.StockQuantity} sản phẩm trong kho");
        }

        // Lấy hoặc tạo cart
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        // Kiểm tra xem sản phẩm đã có trong cart chưa
        var existingCartItem = cart.CartItems.FirstOrDefault(ci => 
            ci.ProductId == addToCartDto.ProductId && ci.Option == addToCartDto.Option);

        if (existingCartItem != null)
        {
            // Cập nhật số lượng
            var newQuantity = existingCartItem.Quantity + addToCartDto.Quantity;
            if (newQuantity > product.StockQuantity)
            {
                throw new Exception($"Tổng số lượng ({newQuantity}) vượt quá số lượng tồn kho ({product.StockQuantity})");
            }
            existingCartItem.Quantity = newQuantity;
        }
        else
        {
            // Thêm sản phẩm mới vào cart
            var cartItem = new CartItem
            {
                CartId = cart.CartId,
                ProductId = addToCartDto.ProductId,
                Quantity = addToCartDto.Quantity,
                Option = addToCartDto.Option
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();

        // Reload cart với đầy đủ thông tin
        cart = await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                    .ThenInclude(p => p.ProductImages)
            .FirstAsync(c => c.CartId == cart.CartId);

        return MapToCartDto(cart);
    }

    public async Task<CartDto> UpdateCartItemAsync(int userId, int cartItemId, UpdateCartItemDto updateCartItemDto)
    {
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.Cart.UserId == userId);

        if (cartItem == null)
        {
            throw new Exception("Sản phẩm không tồn tại trong giỏ hàng");
        }

        if (updateCartItemDto.Quantity > cartItem.Product.StockQuantity)
        {
            throw new Exception($"Sản phẩm chỉ còn {cartItem.Product.StockQuantity} sản phẩm trong kho");
        }

        cartItem.Quantity = updateCartItemDto.Quantity;
        await _context.SaveChangesAsync();

        return await GetUserCartAsync(userId);
    }

    public async Task<bool> RemoveCartItemAsync(int userId, int cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.Cart.UserId == userId);

        if (cartItem == null)
        {
            return false;
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ClearCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            return false;
        }

        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CartDto> SyncCartFromLocalStorageAsync(int userId, List<AddToCartDto> cartItems)
    {
        // Xóa cart hiện tại
        await ClearCartAsync(userId);

        // Thêm từng sản phẩm từ localStorage
        foreach (var item in cartItems)
        {
            try
            {
                await AddToCartAsync(userId, item);
            }
            catch
            {
                // Bỏ qua sản phẩm có lỗi (hết hàng, không tồn tại, etc.)
                continue;
            }
        }

        return await GetUserCartAsync(userId);
    }

    private CartDto MapToCartDto(Cart cart)
    {
        var cartDto = new CartDto
        {
            CartId = cart.CartId,
            UserId = cart.UserId,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            CartItems = cart.CartItems.Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemId,
                CartId = ci.CartId,
                ProductId = ci.ProductId,
                Quantity = ci.Quantity,
                Option = ci.Option,
                CreatedAt = ci.CreatedAt,
                Product = new ProductDto
                {
                    ProductId = ci.Product.ProductId,
                    Name = ci.Product.Name,
                    Description = ci.Product.Description,
                    Price = ci.Product.Price,
                    Category = ci.Product.Category,
                    Brand = ci.Product.Brand,
                    StockQuantity = ci.Product.StockQuantity,
                    Photo = ci.Product.ProductImages?.FirstOrDefault(img => img.IsPrimary)?.ImageUrl 
                           ?? ci.Product.Photo 
                           ?? "/images/no-image.png",
                    IsActive = ci.Product.IsActive,
                    CreatedAt = ci.Product.CreatedAt,
                    UpdatedAt = ci.Product.UpdatedAt,
                    ProductImages = ci.Product.ProductImages?.Select(img => new ProductImageDto
                    {
                        ImageId = img.ImageId,
                        ImageUrl = img.ImageUrl,
                        AltText = img.AltText,
                        DisplayOrder = img.DisplayOrder,
                        IsPrimary = img.IsPrimary
                    }).ToList() ?? new List<ProductImageDto>()
                },
                Subtotal = ci.Product.Price * ci.Quantity
            }).ToList()
        };

        cartDto.TotalAmount = cartDto.CartItems.Sum(ci => ci.Subtotal);
        cartDto.TotalItems = cartDto.CartItems.Sum(ci => ci.Quantity);

        return cartDto;
    }
} 