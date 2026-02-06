using BE_PetWeb_API.DTOs.Review;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ReviewReplyService : IReviewReplyService
    {
        private readonly PetWebContext _context;

        public ReviewReplyService(PetWebContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReviewReplyDto>> GetAllRepliesAsync()
        {
            var replies = await _context.ReviewReplies
                .Include(r => r.AdminUser)
                .Include(r => r.Review)
                .OrderByDescending(r => r.ReplyDate)
                .ToListAsync();

            return replies.Select(MapToReplyDto);
        }

        public async Task<ReviewReplyDto> GetReplyByIdAsync(int replyId)
        {
            var reply = await _context.ReviewReplies
                .Include(r => r.AdminUser)
                .Include(r => r.Review)
                .FirstOrDefaultAsync(r => r.ReplyId == replyId);

            if (reply == null)
                return null;

            return MapToReplyDto(reply);
        }

        public async Task<IEnumerable<ReviewReplyDto>> GetRepliesByReviewIdAsync(int reviewId)
        {
            var replies = await _context.ReviewReplies
                .Include(r => r.AdminUser)
                .Where(r => r.ReviewId == reviewId)
                .OrderBy(r => r.ReplyDate)
                .ToListAsync();

            return replies.Select(MapToReplyDto);
        }

        public async Task<IEnumerable<ReviewReplyDto>> GetRepliesByAdminIdAsync(int adminUserId)
        {
            var replies = await _context.ReviewReplies
                .Include(r => r.AdminUser)
                .Include(r => r.Review)
                .Where(r => r.AdminUserId == adminUserId)
                .OrderByDescending(r => r.ReplyDate)
                .ToListAsync();

            return replies.Select(MapToReplyDto);
        }

        public async Task<ReviewReplyDto> CreateReplyAsync(int adminUserId, CreateReviewReplyDto createReplyDto)
        {
            // Kiểm tra admin user có tồn tại và có quyền admin
            var adminUser = await _context.Users.FindAsync(adminUserId);
            if (adminUser == null)
                throw new Exception("Admin user không tồn tại");

            if (adminUser.Role != "Admin")
                throw new Exception("Chỉ admin mới có thể trả lời đánh giá");

            // Kiểm tra review có tồn tại
            var review = await _context.Reviews.FindAsync(createReplyDto.ReviewId);
            if (review == null)
                throw new Exception("Đánh giá không tồn tại");

            // Kiểm tra admin đã trả lời đánh giá này chưa
            var existingReply = await _context.ReviewReplies
                .FirstOrDefaultAsync(r => r.ReviewId == createReplyDto.ReviewId && r.AdminUserId == adminUserId);

            if (existingReply != null)
                throw new Exception("Bạn đã trả lời đánh giá này rồi");

            // Tạo reply mới
            var reply = new ReviewReply
            {
                ReviewId = createReplyDto.ReviewId,
                AdminUserId = adminUserId,
                ReplyContent = createReplyDto.ReplyContent,
                ReplyDate = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.ReviewReplies.Add(reply);
            await _context.SaveChangesAsync();

            return await GetReplyByIdAsync(reply.ReplyId);
        }

        public async Task<ReviewReplyDto> UpdateReplyAsync(int replyId, int adminUserId, UpdateReviewReplyDto updateReplyDto)
        {
            var reply = await _context.ReviewReplies
                .FirstOrDefaultAsync(r => r.ReplyId == replyId);

            if (reply == null)
                throw new Exception("Reply không tồn tại");

            // Kiểm tra quyền sửa (chỉ admin tạo reply hoặc admin khác)
            var currentUser = await _context.Users.FindAsync(adminUserId);
            if (currentUser == null || currentUser.Role != "Admin")
                throw new Exception("Chỉ admin mới có thể sửa reply");

            if (reply.AdminUserId != adminUserId && currentUser.Role != "Admin")
                throw new Exception("Bạn chỉ có thể sửa reply của mình");

            // Cập nhật
            reply.ReplyContent = updateReplyDto.ReplyContent;
            reply.UpdatedAt = DateTime.Now;

            _context.ReviewReplies.Update(reply);
            await _context.SaveChangesAsync();

            return await GetReplyByIdAsync(replyId);
        }

        public async Task<bool> DeleteReplyAsync(int replyId, int adminUserId)
        {
            var reply = await _context.ReviewReplies
                .FirstOrDefaultAsync(r => r.ReplyId == replyId);

            if (reply == null)
                return false;

            // Kiểm tra quyền xóa (chỉ admin tạo reply hoặc admin khác)
            var currentUser = await _context.Users.FindAsync(adminUserId);
            if (currentUser == null || currentUser.Role != "Admin")
                throw new Exception("Chỉ admin mới có thể xóa reply");

            if (reply.AdminUserId != adminUserId && currentUser.Role != "Admin")
                throw new Exception("Bạn chỉ có thể xóa reply của mình");

            _context.ReviewReplies.Remove(reply);
            await _context.SaveChangesAsync();

            return true;
        }

        private ReviewReplyDto MapToReplyDto(ReviewReply reply)
        {
            return new ReviewReplyDto
            {
                ReplyId = reply.ReplyId,
                ReviewId = reply.ReviewId,
                AdminUserId = reply.AdminUserId,
                AdminUserName = reply.AdminUser?.FullName ?? "Admin",
                AdminUserAvatar = reply.AdminUser?.Avatar,
                ReplyContent = reply.ReplyContent,
                ReplyDate = reply.ReplyDate,
                UpdatedAt = reply.UpdatedAt
            };
        }
    }
} 