using BE_PetWeb_API.DTOs.Blog;
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
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly IBlogPostService _blogPostService;

        public CommentsController(ICommentService commentService, IBlogPostService blogPostService)
        {
            _commentService = commentService;
            _blogPostService = blogPostService;
        }

        // GET: api/Comments/Post/5
        [HttpGet("Post/{postId}")]
        public async Task<ActionResult<IEnumerable<CommentDto>>> GetCommentsByPost(int postId)
        {
            var post = await _blogPostService.GetPostByIdAsync(postId);
            if (post == null)
            {
                return NotFound("Blog post not found");
            }

            var comments = await _commentService.GetCommentsByPostIdAsync(postId);
            return Ok(comments);
        }

        // GET: api/Comments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CommentDto>> GetComment(int id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null)
            {
                return NotFound("Comment not found");
            }

            // Nếu bình luận chưa được phê duyệt, kiểm tra quyền
            if (comment.IsApproved != true)
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return Forbid("You must be logged in to view unapproved comments");
                }

                var userId = GetCurrentUserId();
                var isAuthor = comment.UserId == userId;
                var isAdmin = User.IsInRole("Admin");

                if (!isAuthor && !isAdmin)
                {
                    return Forbid("You don't have permission to view this comment");
                }
            }

            return Ok(comment);
        }

        // POST: api/Comments
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CommentDto>> CreateComment(CreateCommentDto createCommentDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var comment = await _commentService.CreateCommentAsync(userId, createCommentDto);
                return CreatedAtAction(nameof(GetComment), new { id = comment.CommentId }, comment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Comments/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<CommentDto>> UpdateComment(int id, UpdateCommentDto updateCommentDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var comment = await _commentService.UpdateCommentAsync(id, userId, updateCommentDto);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Comments/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _commentService.DeleteCommentAsync(id, userId);
                if (!result)
                {
                    return NotFound("Comment not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PATCH: api/Comments/5/Approve
        [HttpPatch("{id}/Approve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CommentDto>> ApproveComment(int id)
        {
            try
            {
                var comment = await _commentService.ApproveCommentAsync(id);
                return Ok(comment);
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