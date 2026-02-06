using BE_PetWeb_API.DTOs.Review;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IReviewReplyService
    {
        Task<IEnumerable<ReviewReplyDto>> GetAllRepliesAsync();
        Task<ReviewReplyDto> GetReplyByIdAsync(int replyId);
        Task<IEnumerable<ReviewReplyDto>> GetRepliesByReviewIdAsync(int reviewId);
        Task<IEnumerable<ReviewReplyDto>> GetRepliesByAdminIdAsync(int adminUserId);
        Task<ReviewReplyDto> CreateReplyAsync(int adminUserId, CreateReviewReplyDto createReplyDto);
        Task<ReviewReplyDto> UpdateReplyAsync(int replyId, int adminUserId, UpdateReviewReplyDto updateReplyDto);
        Task<bool> DeleteReplyAsync(int replyId, int adminUserId);
    }
} 