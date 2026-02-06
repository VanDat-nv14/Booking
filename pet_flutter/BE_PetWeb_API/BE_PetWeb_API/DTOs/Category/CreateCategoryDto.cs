using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Category
{
    public class CreateCategoryDto
    {
        [Required]
        [StringLength(100, ErrorMessage = "Tên danh mục không được vượt quá 100 ký tự")]
        public string Name { get; set; }

        [StringLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự")]
        public string Description { get; set; }

        [StringLength(255, ErrorMessage = "URL hình ảnh không được vượt quá 255 ký tự")]
        public string ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;
    }
} 