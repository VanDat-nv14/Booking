using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Product
{
    public class UpdateProductDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }
        public string Category { get; set; }
        public string Brand { get; set; }
        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }
        public string Photo { get; set; }
        public bool? IsActive { get; set; }
    }
}
