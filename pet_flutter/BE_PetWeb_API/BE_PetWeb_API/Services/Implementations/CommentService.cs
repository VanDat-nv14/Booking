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
    public class CommentService : ICommentService
    {
        private readonly PetWebContext _context;

        public CommentService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByPostIdAsync(int postId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.PostId == postId && c.IsApproved == true)
                .OrderByDescending(c => c.CommentDate)
                .ToListAsync();

            return comments.Select(MapToCommentDto);
        }

        public async Task<CommentDto> GetCommentByIdAsync(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.CommentId == id);

            if (comment == null)
                return null;

            return MapToCommentDto(comment);
        }

        public async Task<CommentDto> CreateCommentAsync(int userId, CreateCommentDto createCommentDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            var post = await _context.BlogPosts.FindAsync(createCommentDto.PostId);
            if (post == null)
                throw new Exception("Bài viết không tồn tại");

            var isAdmin = user.Role == "Admin";

            var comment = new Comment
            {
                PostId = createCommentDto.PostId,
                UserId = userId,
                Content = createCommentDto.Content,
                CommentDate = DateTime.Now,
                IsApproved = isAdmin // Admin comments are auto-approved
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return await GetCommentByIdAsync(comment.CommentId);
        }

        public async Task<CommentDto> UpdateCommentAsync(int id, int userId, UpdateCommentDto updateCommentDto)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                throw new Exception("Bình luận không tồn tại");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể cập nhật
            var isAdmin = user.Role == "Admin";
            if (comment.UserId != userId && !isAdmin)
                throw new Exception("Bạn không có quyền cập nhật bình luận này");

            if (!string.IsNullOrEmpty(updateCommentDto.Content))
                comment.Content = updateCommentDto.Content;

            // Chỉ admin mới có thể cập nhật trạng thái IsApproved
            if (isAdmin && updateCommentDto.IsApproved.HasValue)
                comment.IsApproved = updateCommentDto.IsApproved.Value;

            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();

            return await GetCommentByIdAsync(id);
        }

        public async Task<bool> DeleteCommentAsync(int id, int userId)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return false;

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            // Kiểm tra quyền: chỉ người tạo hoặc admin mới có thể xóa
            var isAdmin = user.Role == "Admin";
            if (comment.UserId != userId && !isAdmin)
                throw new Exception("Bạn không có quyền xóa bình luận này");

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<CommentDto> ApproveCommentAsync(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                throw new Exception("Bình luận không tồn tại");

            comment.IsApproved = true;
            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();

            return await GetCommentByIdAsync(id);
        }

        private CommentDto MapToCommentDto(Comment comment)
        {
            return new CommentDto
            {
                CommentId = comment.CommentId,
                PostId = comment.PostId,
                UserId = comment.UserId,
                UserName = comment.User?.FullName,
                UserAvatar = comment.User?.Avatar,
                Content = comment.Content,
                CommentDate = comment.CommentDate,
                IsApproved = comment.IsApproved
            };
        }
    }
}