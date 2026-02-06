using BE_PetWeb_API.DTOs.Blog;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IBlogPostService
    {
        Task<IEnumerable<BlogPostDto>> GetAllPostsAsync(string status = null);
        Task<BlogPostDto> GetPostByIdAsync(int id);
        Task<IEnumerable<BlogPostDto>> GetPostsByCategoryAsync(string category);
        Task<IEnumerable<BlogPostDto>> GetPostsByUserIdAsync(int userId);
        Task<BlogPostDto> CreatePostAsync(int userId, CreateBlogPostDto createBlogPostDto);
        Task<BlogPostDto> UpdatePostAsync(int id, int userId, UpdateBlogPostDto updateBlogPostDto);
        Task<bool> DeletePostAsync(int id, int userId);
        Task<BlogPostDto> PublishPostAsync(int id, int userId);
        Task<BlogPostDto> IncrementViewCountAsync(int id);
        Task<IEnumerable<BlogPostDto>> SearchPostsAsync(string searchTerm);
    }
}