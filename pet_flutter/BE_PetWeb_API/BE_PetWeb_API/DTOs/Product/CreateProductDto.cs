using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Product
{
    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        [Required]
        public string Category { get; set; }
        public string Brand { get; set; }
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
        public string Photo { get; set; }
        public List<CreateProductImageDto> ProductImages { get; set; } = new List<CreateProductImageDto>();
    }
}
