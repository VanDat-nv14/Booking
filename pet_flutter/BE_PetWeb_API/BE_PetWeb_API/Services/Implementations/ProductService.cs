using BE_PetWeb_API.DTOs.Product;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly PetWebContext _context;

        public ProductService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync(
            string category = null,
            string brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            bool includeInactive = false)
        {
            var query = _context.Products.AsQueryable();

            // Lọc theo trạng thái hoạt động
            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive == true);
            }

            // Lọc theo danh mục nếu có
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            // Lọc theo thương hiệu nếu có  
            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(p => p.Brand == brand);
            }

            // Lọc theo giá tối thiểu
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            // Lọc theo giá tối đa
            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return products.Select(MapToProductDto);
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return null;

            return MapToProductDto(product);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            // Kiểm tra tính hợp lệ của danh mục từ database
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == createProductDto.Category && c.IsActive);
            
            if (category == null)
                throw new Exception("Danh mục sản phẩm không tồn tại hoặc đã bị vô hiệu hóa");

            // Tạo sản phẩm mới
            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                Category = createProductDto.Category,
                CategoryId = category.CategoryId, // Thêm CategoryId
                Brand = createProductDto.Brand,
                StockQuantity = createProductDto.StockQuantity,
                Photo = createProductDto.Photo,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return MapToProductDto(product);
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                throw new Exception("Sản phẩm không tồn tại");

            // Cập nhật thông tin sản phẩm
            if (!string.IsNullOrEmpty(updateProductDto.Name))
                product.Name = updateProductDto.Name;

            if (!string.IsNullOrEmpty(updateProductDto.Description))
                product.Description = updateProductDto.Description;

            if (updateProductDto.Price.HasValue)
                product.Price = updateProductDto.Price.Value;

            if (!string.IsNullOrEmpty(updateProductDto.Category))
            {
                // Kiểm tra tính hợp lệ của danh mục từ database
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == updateProductDto.Category && c.IsActive);
                
                if (category == null)
                    throw new Exception("Danh mục sản phẩm không tồn tại hoặc đã bị vô hiệu hóa");
                    
                product.Category = updateProductDto.Category;
                product.CategoryId = category.CategoryId; // Cập nhật CategoryId
            }

            if (!string.IsNullOrEmpty(updateProductDto.Brand))
                product.Brand = updateProductDto.Brand;

            if (updateProductDto.StockQuantity.HasValue)
                product.StockQuantity = updateProductDto.StockQuantity.Value;

            if (!string.IsNullOrEmpty(updateProductDto.Photo))
                product.Photo = updateProductDto.Photo;

            if (updateProductDto.IsActive.HasValue)
                product.IsActive = updateProductDto.IsActive.Value;

            product.UpdatedAt = DateTime.Now;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return MapToProductDto(product);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            // Kiểm tra xem sản phẩm có trong đơn hàng chưa hoàn thành không
            var inActiveOrder = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi => oi.ProductId == id &&
                    oi.Order.Status != "Completed" &&
                    oi.Order.Status != "Cancelled");

            // Nếu có đơn hàng chưa hoàn thành, chỉ ẩn sản phẩm (soft delete)
            // Không chặn admin, chỉ log thông tin
            if (inActiveOrder)
            {
                // Log cảnh báo nhưng vẫn cho phép ẩn sản phẩm
                Console.WriteLine($"Warning: Product {id} is being deactivated while having active orders");
            }

            // Chuyển trạng thái thành không hoạt động thay vì xóa hoàn toàn
            product.IsActive = false;
            product.UpdatedAt = DateTime.Now;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return true;
        }

        // Phương thức để xóa hoàn toàn sản phẩm (chỉ khi không có ràng buộc)
        public async Task<bool> HardDeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            // Kiểm tra xem sản phẩm có trong bất kỳ đơn hàng nào không
            var hasAnyOrder = await _context.OrderItems
                .AnyAsync(oi => oi.ProductId == id);

            if (hasAnyOrder)
                throw new Exception("Không thể xóa hoàn toàn sản phẩm đã có trong đơn hàng. Chỉ có thể ẩn sản phẩm.");

            // Xóa tất cả ảnh của sản phẩm trước
            var productImages = await _context.ProductImages
                .Where(pi => pi.ProductId == id)
                .ToListAsync();
            
            if (productImages.Any())
            {
                _context.ProductImages.RemoveRange(productImages);
            }

            // Xóa sản phẩm hoàn toàn
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(int threshold = 10)
        {
            var lowStockProducts = await _context.Products
                .Where(p => p.StockQuantity <= threshold && p.IsActive == true)
                .OrderBy(p => p.StockQuantity)
                .ToListAsync();

            return lowStockProducts.Select(MapToProductDto);
        }

        private ProductDto MapToProductDto(Product product)
        {
            return new ProductDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,                Price = product.Price,
                Category = product.Category,
                Brand = product.Brand,
                StockQuantity = product.StockQuantity,
                Photo = product.Photo,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                IsActive = product.IsActive
            };
        }

        // ===== PRODUCT IMAGES MANAGEMENT =====

        public async Task<ProductImageDto> AddProductImageAsync(int productId, CreateProductImageDto createImageDto)
        {
            // Kiểm tra product có tồn tại không
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                throw new Exception("Sản phẩm không tồn tại");
            }

            // Nếu đây là ảnh primary, set tất cả ảnh khác thành non-primary
            if (createImageDto.IsPrimary)
            {
                var existingImages = await _context.ProductImages
                    .Where(pi => pi.ProductId == productId)
                    .ToListAsync();

                foreach (var img in existingImages)
                {
                    img.IsPrimary = false;
                }
            }

            // Tạo ProductImage mới
            var productImage = new ProductImage
            {
                ProductId = productId,
                ImageUrl = createImageDto.ImageUrl,
                AltText = createImageDto.AltText,
                DisplayOrder = createImageDto.DisplayOrder,
                IsPrimary = createImageDto.IsPrimary,
                CreatedAt = DateTime.Now
            };

            _context.ProductImages.Add(productImage);
            await _context.SaveChangesAsync();

            return new ProductImageDto
            {
                ImageId = productImage.ImageId,
                ImageUrl = productImage.ImageUrl,
                AltText = productImage.AltText,
                DisplayOrder = productImage.DisplayOrder,
                IsPrimary = productImage.IsPrimary
            };
        }

        public async Task<List<ProductImageDto>> GetProductImagesAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            var images = await _context.ProductImages
                .Where(pi => pi.ProductId == productId)
                .OrderBy(pi => pi.DisplayOrder)
                .ToListAsync();

            var result = new List<ProductImageDto>();

            // Thêm ảnh chính từ trường Photo nếu có
            if (product != null && !string.IsNullOrEmpty(product.Photo))
            {
                result.Add(new ProductImageDto
                {
                    ImageId = null, // Đánh dấu đây là ảnh chính từ Product.Photo
                    ImageUrl = product.Photo,
                    AltText = "Ảnh chính",
                    DisplayOrder = -1, // Ưu tiên hiển thị đầu tiên
                    IsPrimary = true // Luôn là ảnh chính
                });
            }

            // Thêm các ảnh từ ProductImages
            // Nếu đã có ảnh chính từ Photo, thì tất cả ảnh khác đều không phải primary
            bool hasMainPhoto = !string.IsNullOrEmpty(product?.Photo);
            
            result.AddRange(images.Select(img => new ProductImageDto
            {
                ImageId = img.ImageId,
                ImageUrl = img.ImageUrl,
                AltText = img.AltText,
                DisplayOrder = img.DisplayOrder,
                IsPrimary = hasMainPhoto ? false : img.IsPrimary // Nếu có ảnh chính từ Photo thì các ảnh khác không primary
            }));

            return result.OrderBy(img => img.DisplayOrder).ToList();
        }

        public async Task<bool> DeleteProductImageAsync(int productId, int imageId)
        {
            var productImage = await _context.ProductImages
                .FirstOrDefaultAsync(pi => pi.ProductId == productId && pi.ImageId == imageId);

            if (productImage == null)
            {
                return false;
            }

            var wasPrimary = productImage.IsPrimary;

            _context.ProductImages.Remove(productImage);
            await _context.SaveChangesAsync();

            // If deleted image was primary, set another image as primary
            if (wasPrimary)
            {
                var product = await _context.Products.FindAsync(productId);
                
                // Nếu có ảnh chính từ trường Photo, không cần làm gì
                if (product != null && !string.IsNullOrEmpty(product.Photo))
                {
                    // Ảnh chính từ Photo sẽ tự động thay thế
                    return true;
                }

                // Nếu không có ảnh từ Photo, set ảnh khác làm primary
                var remainingImages = await _context.ProductImages
                    .Where(pi => pi.ProductId == productId)
                    .OrderBy(pi => pi.DisplayOrder)
                    .ToListAsync();

                if (remainingImages.Any())
                {
                    remainingImages.First().IsPrimary = true;
                    await _context.SaveChangesAsync();
                }
            }

            return true;
        }

        public async Task<bool> SetPrimaryImageAsync(int productId, int imageId)
        {
            // Kiểm tra ảnh có tồn tại không
            var targetImage = await _context.ProductImages
                .FirstOrDefaultAsync(pi => pi.ProductId == productId && pi.ImageId == imageId);

            if (targetImage == null)
            {
                return false;
            }

            // Lấy thông tin sản phẩm
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return false;
            }

            // Xóa ảnh chính từ trường Photo (vì giờ sẽ dùng ảnh từ ProductImages)
            product.Photo = null;

            // Set tất cả ảnh khác thành non-primary
            var allImages = await _context.ProductImages
                .Where(pi => pi.ProductId == productId)
                .ToListAsync();

            foreach (var img in allImages)
            {
                img.IsPrimary = (img.ImageId == imageId);
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}