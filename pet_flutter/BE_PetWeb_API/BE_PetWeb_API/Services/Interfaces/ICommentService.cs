using BE_PetWeb_API.DTOs.Blog;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface ICommentService
    {
        Task<IEnumerable<CommentDto>> GetCommentsByPostIdAsync(int postId);
        Task<CommentDto> GetCommentByIdAsync(int id);
        Task<CommentDto> CreateCommentAsync(int userId, CreateCommentDto createCommentDto);
        Task<CommentDto> UpdateCommentAsync(int id, int userId, UpdateCommentDto updateCommentDto);
        Task<bool> DeleteCommentAsync(int id, int userId);
        Task<CommentDto> ApproveCommentAsync(int id);
    }
}