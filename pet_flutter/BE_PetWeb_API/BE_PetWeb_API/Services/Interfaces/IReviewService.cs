using BE_PetWeb_API.DTOs.Review;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetAllReviewsAsync();
        Task<ReviewDto> GetReviewByIdAsync(int id);
        Task<IEnumerable<ReviewDto>> GetReviewsByUserIdAsync(int userId);
        Task<IEnumerable<ReviewDto>> GetReviewsByServiceIdAsync(int serviceId);
        Task<IEnumerable<ReviewDto>> GetReviewsByProductIdAsync(int productId);
        Task<IEnumerable<ReviewDto>> GetReviewsByProductIdWithFilterAsync(int productId, string sortBy = "newest");
        Task<IEnumerable<ReviewDto>> GetReviewsByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<ReviewDto>> GetReviewsByOrderIdAsync(int orderId);
        Task<ReviewDto> CreateReviewAsync(int userId, CreateReviewDto createReviewDto);
        Task<ReviewDto> UpdateReviewAsync(int id, int userId, UpdateReviewDto updateReviewDto);
        Task<bool> DeleteReviewAsync(int id, int userId);
        Task<double> GetAverageRatingForServiceAsync(int serviceId);
        Task<double> GetAverageRatingForProductAsync(int productId);
        Task<UserProductPurchaseStatusDto> GetUserProductPurchaseStatusAsync(int userId, int productId);
        Task<PublicPurchaseStatusDto> GetPublicUserProductPurchaseStatusAsync(int userId, int productId);
    }

    // DTO cho trạng thái mua hàng của user (private - có đầy đủ thông tin)
    public class UserProductPurchaseStatusDto
    {
        public bool HasPurchased { get; set; }
        public string? OrderStatus { get; set; }
        public string? OrderStatusDisplay { get; set; }
        public int? OrderId { get; set; }
        public DateTime? OrderDate { get; set; }
        public string Message { get; set; }
    }

    // DTO cho trạng thái mua hàng public (chỉ thông tin cơ bản)
    public class PublicPurchaseStatusDto
    {
        public bool HasPurchased { get; set; }
        public string? OrderStatusDisplay { get; set; }
        public DateTime? OrderDate { get; set; }
        public string Message { get; set; }
    }
}