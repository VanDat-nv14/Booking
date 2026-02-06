using BE_PetWeb_API.DTOs.Blog;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class BlogPostService : IBlogPostService
    {
        private readonly PetWebContext _context;
        private readonly IFileService _fileService;

        public BlogPostService(PetWebContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<IEnumerable<BlogPostDto>> GetAllPostsAsync(string status = null)
        {
            var query = _context.BlogPosts
                .Include(p => p.User)
                .Include(p => p.Comments.Where(c => c.IsApproved == true))
                .ThenInclude(c => c.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status == status);
            }

            var posts = await query
                .OrderByDescending(p => p.PublishDate)
                .ToListAsync();

            return posts.Select(MapToBlogPostDto);
        }

        public async Task<BlogPostDto> GetPostByIdAsync(int id)
        {
            var post = await _context.BlogPosts
                .Include(p => p.User)
                .Include(p => p.Comments.Where(c => c.IsApproved == true))
                .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(p => p.PostId == id);

            if (post == null)
                return null;

            return MapToBlogPostDto(post);
        }

        public async Task<IEnumerable<BlogPostDto>> GetPostsByCategoryAsync(string category)
        {
            var posts = await _context.BlogPosts
                .Include(p => p.User)
                .Include(p => p.Comments.Where(c => c.IsApproved == true))
                .ThenInclude(c => c.User)
                .Where(p => p.Category == category && p.Status == "Published")
                .OrderByDescending(p => p.PublishDate)
                .ToListAsync();

            return posts.Select(MapToBlogPostDto);
        }

        public async Task<IEnumerable<BlogPostDto>> GetPostsByUserIdAsync(int userId)
        {
            var posts = await _context.BlogPosts
                .Include(p => p.User)
                .Include(p => p.Comments.Where(c => c.IsApproved == true))
                .ThenInclude(c => c.User)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.PublishDate)
                .ToListAsync();

            return posts.Select(MapToBlogPostDto);
        }

        public async Task<BlogPostDto> CreatePostAsync(int userId, CreateBlogPostDto createBlogPostDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            string featuredImagePath = null;
            if (createBlogPostDto.FeaturedImage != null)
            {
                try
                {
                    featuredImagePath = await _fileService.UploadImageAsync(createBlogPostDto.FeaturedImage, "blogs");
                }
                catch (Exception ex)
                {
                    throw new Exception($"Lỗi khi tải lên hình ảnh: {ex.Message}");
                }
            }

            var post = new BlogPost
            {
                UserId = userId,
                Title = createBlogPostDto.Title,
                Content = createBlogPostDto.Content,
                FeaturedImage = featuredImagePath,
                Category = createBlogPostDto.Category,
                Tags = createBlogPostDto.Tags,
                Status = createBlogPostDto.Status,
                PublishDate = createBlogPostDto.Status == "Published" ? DateTime.Now : null,
                UpdatedAt = DateTime.Now,
                ViewCount = 0
            };

            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync();

            return await GetPostByIdAsync(post.PostId);
        }

        public async Task<BlogPostDto> UpdatePostAsync(int id, int userId, UpdateBlogPostDto updateBlogPostDto)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                throw new Exception("Bài viết không tồn tại");

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể cập nhật
            if (post.UserId != userId && !await IsAdminUserAsync(userId))
                throw new Exception("Bạn không có quyền cập nhật bài viết này");

            if (!string.IsNullOrEmpty(updateBlogPostDto.Title))
                post.Title = updateBlogPostDto.Title;

            if (!string.IsNullOrEmpty(updateBlogPostDto.Content))
                post.Content = updateBlogPostDto.Content;

            if (!string.IsNullOrEmpty(updateBlogPostDto.Category))
                post.Category = updateBlogPostDto.Category;

            if (updateBlogPostDto.Tags != null)
                post.Tags = updateBlogPostDto.Tags;

            if (!string.IsNullOrEmpty(updateBlogPostDto.Status))
            {
                bool wasPublished = post.Status == "Published";
                post.Status = updateBlogPostDto.Status;

                // Nếu trạng thái thay đổi từ Draft sang Published
                if (!wasPublished && updateBlogPostDto.Status == "Published")
                {
                    post.PublishDate = DateTime.Now;
                }
            }

            // Xử lý hình ảnh
            if (updateBlogPostDto.FeaturedImage != null)
            {
                try
                {
                    // Xóa hình ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(post.FeaturedImage))
                    {
                        _fileService.DeleteImage(post.FeaturedImage);
                    }

                    // Tải lên hình ảnh mới
                    post.FeaturedImage = await _fileService.UploadImageAsync(updateBlogPostDto.FeaturedImage, "blogs");
                }
                catch (Exception ex)
                {
                    throw new Exception($"Lỗi khi tải lên hình ảnh: {ex.Message}");
                }
            }
            // THÊM CODE MỚI: Kiểm tra flag KeepExistingImage để quyết định có xóa ảnh hiện tại hay không
            else if (updateBlogPostDto.KeepExistingImage == false && !string.IsNullOrEmpty(post.FeaturedImage))
            {
                // Xóa hình ảnh hiện tại nếu có yêu cầu xóa
                _fileService.DeleteImage(post.FeaturedImage);
                post.FeaturedImage = null;
            }
            // Các trường hợp còn lại: không có ảnh mới và keepExistingImage = true -> giữ nguyên ảnh cũ

            post.UpdatedAt = DateTime.Now;

            _context.BlogPosts.Update(post);
            await _context.SaveChangesAsync();

            return await GetPostByIdAsync(id);
        }

        public async Task<bool> DeletePostAsync(int id, int userId)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                return false;

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể xóa
            if (post.UserId != userId && !await IsAdminUserAsync(userId))
                throw new Exception("Bạn không có quyền xóa bài viết này");

            // Xóa hình ảnh nếu có
            if (!string.IsNullOrEmpty(post.FeaturedImage))
            {
                _fileService.DeleteImage(post.FeaturedImage);
            }

            // Xóa tất cả comments liên quan
            var comments = await _context.Comments.Where(c => c.PostId == id).ToListAsync();
            _context.Comments.RemoveRange(comments);

            _context.BlogPosts.Remove(post);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<BlogPostDto> PublishPostAsync(int id, int userId)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                throw new Exception("Bài viết không tồn tại");

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể xuất bản
            if (post.UserId != userId && !await IsAdminUserAsync(userId))
                throw new Exception("Bạn không có quyền xuất bản bài viết này");

            if (post.Status == "Published")
                throw new Exception("Bài viết đã được xuất bản");

            post.Status = "Published";
            post.PublishDate = DateTime.Now;
            post.UpdatedAt = DateTime.Now;

            _context.BlogPosts.Update(post);
            await _context.SaveChangesAsync();

            return await GetPostByIdAsync(id);
        }

        public async Task<BlogPostDto> IncrementViewCountAsync(int id)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post == null)
                throw new Exception("Bài viết không tồn tại");

            post.ViewCount = (post.ViewCount ?? 0) + 1;
            _context.BlogPosts.Update(post);
            await _context.SaveChangesAsync();

            return await GetPostByIdAsync(id);
        }

        public async Task<IEnumerable<BlogPostDto>> SearchPostsAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<BlogPostDto>();

            var posts = await _context.BlogPosts
                .Include(p => p.User)
                .Include(p => p.Comments.Where(c => c.IsApproved == true))
                .ThenInclude(c => c.User)
                .Where(p => p.Status == "Published" &&
                           (p.Title.Contains(searchTerm) ||
                            p.Content.Contains(searchTerm) ||
                            p.Tags.Contains(searchTerm) ||
                            p.Category.Contains(searchTerm)))
                .OrderByDescending(p => p.PublishDate)
                .ToListAsync();

            return posts.Select(MapToBlogPostDto);
        }

        private BlogPostDto MapToBlogPostDto(BlogPost post)
        {
            return new BlogPostDto
            {
                PostId = post.PostId,
                UserId = post.UserId,
                AuthorName = post.User?.FullName,
                Title = post.Title,
                Content = post.Content,
                FeaturedImage = post.FeaturedImage,
                Category = post.Category,
                Tags = post.Tags,
                PublishDate = post.PublishDate,
                UpdatedAt = post.UpdatedAt,
                Status = post.Status,
                ViewCount = post.ViewCount,
                Comments = post.Comments
                    .Where(c => c.IsApproved == true)
                    .Select(c => new CommentDto
                    {
                        CommentId = c.CommentId,
                        PostId = c.PostId,
                        UserId = c.UserId,
                        UserName = c.User?.FullName,
                        UserAvatar = c.User?.Avatar,
                        Content = c.Content,
                        CommentDate = c.CommentDate,
                        IsApproved = c.IsApproved
                    }).ToList()
            };
        }

        private async Task<bool> IsAdminUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user != null && user.Role == "Admin";
        }
    }
}