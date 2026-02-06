using System.Collections.Generic;
using System.Threading.Tasks;
using BE_PetWeb_API.DTOs.Product;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync(
            string category = null,
            string brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            bool includeInactive = false);
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto);
        Task<bool> DeleteProductAsync(int id);
        Task<bool> HardDeleteProductAsync(int id);
        Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(int threshold);

        // Product Images Management
        Task<ProductImageDto> AddProductImageAsync(int productId, CreateProductImageDto createImageDto);
        Task<List<ProductImageDto>> GetProductImagesAsync(int productId);
        Task<bool> DeleteProductImageAsync(int productId, int imageId);
        Task<bool> SetPrimaryImageAsync(int productId, int imageId);
    }
}