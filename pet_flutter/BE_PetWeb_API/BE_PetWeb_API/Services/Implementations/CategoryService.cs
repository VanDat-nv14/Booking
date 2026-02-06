using BE_PetWeb_API.DTOs.Category;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE_PetWeb_API.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly PetWebContext _context;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(PetWebContext context, ILogger<CategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(bool includeInactive = false)
        {
            var query = _context.Categories.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(c => c.IsActive);
            }

            var categories = await query
                .Include(c => c.Products)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return categories.Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                ProductCount = c.Products?.Count(p => p.IsActive == true) ?? 0
            });
        }

        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.CategoryId == id);

            if (category == null)
                return null;

            return new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ProductCount = category.Products?.Count(p => p.IsActive == true) ?? 0
            };
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            // Kiểm tra tên category đã tồn tại chưa
            if (await CategoryNameExistsAsync(createCategoryDto.Name))
            {
                throw new Exception("Tên danh mục đã tồn tại");
            }

            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                ImageUrl = createCategoryDto.ImageUrl,
                IsActive = createCategoryDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ProductCount = 0
            };
        }

        public async Task<CategoryDto> UpdateCategoryAsync(int id, UpdateCategoryDto updateCategoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return null;

            // Kiểm tra tên category đã tồn tại chưa (trừ chính nó)
            if (await CategoryNameExistsAsync(updateCategoryDto.Name, id))
            {
                throw new Exception("Tên danh mục đã tồn tại");
            }

            category.Name = updateCategoryDto.Name;
            category.Description = updateCategoryDto.Description;
            category.ImageUrl = updateCategoryDto.ImageUrl;
            category.IsActive = updateCategoryDto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var productCount = await _context.Products
                .CountAsync(p => p.Category == category.Name && p.IsActive == true);

            return new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                ProductCount = productCount
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return false;

            // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
            var hasProducts = await _context.Products
                .AnyAsync(p => p.Category == category.Name && p.IsActive == true);

            if (hasProducts)
            {
                // Soft delete - chỉ ẩn category
                _logger.LogWarning($"Category {category.Name} có sản phẩm đang sử dụng, thực hiện soft delete");
                category.IsActive = false;
                category.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Có thể xóa an toàn
                category.IsActive = false;
                category.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HardDeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return false;

            // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
            var hasProducts = await _context.Products
                .AnyAsync(p => p.Category == category.Name);

            if (hasProducts)
            {
                throw new Exception("Không thể xóa danh mục đang có sản phẩm sử dụng");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CategoryDto>> GetActiveCategoriesAsync()
        {
            return await GetAllCategoriesAsync(includeInactive: false);
        }

        public async Task<bool> CategoryExistsAsync(int id)
        {
            return await _context.Categories.AnyAsync(c => c.CategoryId == id);
        }

        public async Task<bool> CategoryNameExistsAsync(string name, int? excludeId = null)
        {
            var query = _context.Categories.Where(c => c.Name.ToLower() == name.ToLower());
            
            if (excludeId.HasValue)
            {
                query = query.Where(c => c.CategoryId != excludeId.Value);
            }
            
            return await query.AnyAsync();
        }
    }
} 