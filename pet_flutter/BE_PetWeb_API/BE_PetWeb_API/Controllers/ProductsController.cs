using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using BE_PetWeb_API.Services.Interfaces;
using BE_PetWeb_API.DTOs.Product;
using Microsoft.Extensions.Logging;
using System.Linq;
using BE_PetWeb_API.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IFileService _fileService;
        private readonly ILogger<ProductsController> _logger;
        private readonly PetWebContext _context;

        public ProductsController(
            IProductService productService,
            IFileService fileService,
            ILogger<ProductsController> logger,
            PetWebContext context)
        {
            _productService = productService;
            _fileService = fileService;
            _logger = logger;
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts(
            [FromQuery] string category = null,
            [FromQuery] string brand = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] bool includeInactive = false)
        {
            var products = await _productService.GetAllProductsAsync(category, brand, minPrice, maxPrice, includeInactive);
            return Ok(products);
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        // POST: api/Products
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
        {
            try
            {
                var product = await _productService.CreateProductAsync(createProductDto);
                return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating product: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto updateProductDto)
        {
            try
            {
                var product = await _productService.UpdateProductAsync(id, updateProductDto);
                if (product == null)
                {
                    return NotFound();
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating product {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Products/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                if (!result)
                {
                    return NotFound("Product not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Products/{id}/permanent
        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> HardDeleteProduct(int id)
        {
            try
            {
                var result = await _productService.HardDeleteProductAsync(id);
                if (!result)
                {
                    return NotFound("Product not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error permanently deleting product {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Products/{id}/upload-image
        [HttpPost("{id}/upload-image")]
        [AllowAnonymous] // Tạm thời bỏ xác thực để kiểm tra
        public async Task<IActionResult> UploadProductImage(int id, IFormFile file)
        {
            try
            {
                _logger.LogInformation($"Uploading image for product {id}");
                _logger.LogInformation($"Request content type: {Request.ContentType}");
                _logger.LogInformation($"Form file count: {Request.Form.Files.Count}");

                if (file == null)
                {
                    _logger.LogWarning("File parameter is null");

                    // Kiểm tra xem có file nào trong Request.Form.Files không
                    if (Request.Form.Files.Count > 0)
                    {
                        file = Request.Form.Files[0];
                        _logger.LogInformation($"Using first file from form: {file.FileName}, Size: {file.Length}");
                    }
                    else
                    {
                        return BadRequest("Không có file nào được tải lên");
                    }
                }
                else if (file.Length == 0)
                {
                    _logger.LogWarning("File is empty (zero length)");
                    return BadRequest("File rỗng");
                }
                else
                {
                    _logger.LogInformation($"File info: Name={file.FileName}, Size={file.Length}, ContentType={file.ContentType}");
                }

                // Kiểm tra sản phẩm có tồn tại không
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    _logger.LogWarning($"Product {id} not found for image upload");
                    return NotFound("Sản phẩm không tồn tại");
                }

                // Xóa ảnh cũ nếu có
                if (!string.IsNullOrEmpty(product.Photo))
                {
                    bool deleted = _fileService.DeleteImage(product.Photo);
                    _logger.LogInformation($"Deleted old image: {deleted}, Path: {product.Photo}");
                }

                // Upload ảnh mới vào thư mục products
                _logger.LogInformation("Calling FileService.UploadImageAsync");
                string photoPath = await _fileService.UploadImageAsync(file, "products");
                _logger.LogInformation($"UploadImageAsync result: {photoPath ?? "null"}");

                if (string.IsNullOrEmpty(photoPath))
                {
                    _logger.LogWarning("Failed to upload image, returned path was null or empty");
                    return BadRequest("Không thể tải lên hình ảnh");
                }

                _logger.LogInformation($"Image uploaded successfully: {photoPath}");

                // Cập nhật đường dẫn ảnh trong database
                var updateDto = new UpdateProductDto
                {
                    Photo = photoPath
                };

                _logger.LogInformation($"Updating product with new photo path: {photoPath}");
                var updatedProduct = await _productService.UpdateProductAsync(id, updateDto);
                _logger.LogInformation("Product updated successfully with new photo path");

                return Ok(updatedProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image for product {id}: {ex.Message}");

                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }

                return BadRequest($"Lỗi khi tải lên hình ảnh: {ex.Message}");
            }
        }

        // GET: api/Products/Categories
        [HttpGet("Categories")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetProductCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new { id = c.CategoryId, name = c.Name })
                .ToListAsync();
            
            return Ok(categories);
        }

        // GET: api/Products/LowStock
        [HttpGet("LowStock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetLowStockProducts(
            [FromQuery] int threshold = 10)
        {
            var lowStockProducts = await _productService.GetLowStockProductsAsync(threshold);
            return Ok(lowStockProducts);
        }

        // ===== PRODUCT IMAGES MANAGEMENT =====

        // POST: api/Products/{id}/images
        [HttpPost("{id}/images")]
        [AllowAnonymous]
        public async Task<IActionResult> UploadProductImages(int id, List<IFormFile> files)
        {
            try
            {
                _logger.LogInformation($"Uploading {files?.Count ?? 0} images for product {id}");

                if (files == null || !files.Any())
                {
                    return BadRequest("Không có file nào được tải lên");
                }

                // Kiểm tra sản phẩm có tồn tại không
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound("Sản phẩm không tồn tại");
                }

                var uploadedImages = new List<ProductImageDto>();

                // Kiểm tra xem đã có ảnh chính nào chưa
                var existingImages = await _productService.GetProductImagesAsync(id);
                var hasPrimaryImage = existingImages.Any(img => img.IsPrimary);

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        // Upload ảnh vào thư mục products
                        string photoPath = await _fileService.UploadImageAsync(file, "products");
                        
                        if (!string.IsNullOrEmpty(photoPath))
                        {
                            var imageDto = new CreateProductImageDto
                            {
                                ImageUrl = photoPath,
                                AltText = file.FileName,
                                DisplayOrder = existingImages.Count + uploadedImages.Count,
                                // Chỉ đặt ảnh đầu tiên là primary nếu chưa có ảnh chính nào
                                IsPrimary = !hasPrimaryImage && uploadedImages.Count == 0
                            };

                            var createdImage = await _productService.AddProductImageAsync(id, imageDto);
                            uploadedImages.Add(createdImage);
                        }
                    }
                }

                return Ok(new { message = $"Đã tải lên {uploadedImages.Count} ảnh thành công", images = uploadedImages });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading images for product {id}: {ex.Message}");
                return BadRequest($"Lỗi khi tải lên hình ảnh: {ex.Message}");
            }
        }

        // GET: api/Products/{id}/images
        [HttpGet("{id}/images")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ProductImageDto>>> GetProductImages(int id)
        {
            try
            {
                var images = await _productService.GetProductImagesAsync(id);
                return Ok(images);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting images for product {id}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Products/{productId}/images/{imageId}
        [HttpDelete("{productId}/images/{imageId}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteProductImage(int productId, int imageId)
        {
            try
            {
                var result = await _productService.DeleteProductImageAsync(productId, imageId);
                if (!result)
                {
                    return NotFound("Ảnh không tồn tại");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting image {imageId} for product {productId}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Products/{productId}/images/{imageId}/primary
        [HttpPut("{productId}/images/{imageId}/primary")]
        [AllowAnonymous]
        public async Task<IActionResult> SetPrimaryImage(int productId, int imageId)
        {
            try
            {
                var result = await _productService.SetPrimaryImageAsync(productId, imageId);
                if (!result)
                {
                    return NotFound("Ảnh không tồn tại");
                }
                return Ok(new { message = "Đã đặt làm ảnh chính" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error setting primary image {imageId} for product {productId}: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }
    }
}