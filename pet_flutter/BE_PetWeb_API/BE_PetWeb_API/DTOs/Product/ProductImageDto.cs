namespace BE_PetWeb_API.DTOs.Product
{
    public class ProductImageDto
    {
        public int? ImageId { get; set; }
        public string ImageUrl { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
    }

    public class CreateProductImageDto
    {
        public string ImageUrl { get; set; }
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
    }
}
