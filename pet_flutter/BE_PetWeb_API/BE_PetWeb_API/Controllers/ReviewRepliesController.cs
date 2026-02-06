using BE_PetWeb_API.DTOs.Review;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Chỉ admin mới được truy cập
    public class ReviewRepliesController : ControllerBase
    {
        private readonly IReviewReplyService _reviewReplyService;

        public ReviewRepliesController(IReviewReplyService reviewReplyService)
        {
            _reviewReplyService = reviewReplyService;
        }

        // GET: api/ReviewReplies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewReplyDto>>> GetAllReplies()
        {
            var replies = await _reviewReplyService.GetAllRepliesAsync();
            return Ok(replies);
        }

        // GET: api/ReviewReplies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewReplyDto>> GetReply(int id)
        {
            var reply = await _reviewReplyService.GetReplyByIdAsync(id);
            if (reply == null)
            {
                return NotFound("Reply not found");
            }

            return Ok(reply);
        }

        // GET: api/ReviewReplies/Review/5
        [HttpGet("Review/{reviewId}")]
        public async Task<ActionResult<IEnumerable<ReviewReplyDto>>> GetRepliesByReview(int reviewId)
        {
            var replies = await _reviewReplyService.GetRepliesByReviewIdAsync(reviewId);
            return Ok(replies);
        }

        // GET: api/ReviewReplies/Admin/5
        [HttpGet("Admin/{adminUserId}")]
        public async Task<ActionResult<IEnumerable<ReviewReplyDto>>> GetRepliesByAdmin(int adminUserId)
        {
            var replies = await _reviewReplyService.GetRepliesByAdminIdAsync(adminUserId);
            return Ok(replies);
        }

        // POST: api/ReviewReplies
        [HttpPost]
        public async Task<ActionResult<ReviewReplyDto>> CreateReply(CreateReviewReplyDto createReplyDto)
        {
            try
            {
                var adminUserId = GetCurrentUserId();
                var reply = await _reviewReplyService.CreateReplyAsync(adminUserId, createReplyDto);
                return CreatedAtAction(nameof(GetReply), new { id = reply.ReplyId }, reply);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/ReviewReplies/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ReviewReplyDto>> UpdateReply(int id, UpdateReviewReplyDto updateReplyDto)
        {
            try
            {
                var adminUserId = GetCurrentUserId();
                var reply = await _reviewReplyService.UpdateReplyAsync(id, adminUserId, updateReplyDto);
                return Ok(reply);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/ReviewReplies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReply(int id)
        {
            try
            {
                var adminUserId = GetCurrentUserId();
                var result = await _reviewReplyService.DeleteReplyAsync(id, adminUserId);
                if (!result)
                {
                    return NotFound("Reply not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new Exception("User ID claim not found");

            return int.Parse(userIdClaim.Value);
        }
    }
} 