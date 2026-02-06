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
    public class BlogPostsController : ControllerBase
    {
        private readonly IBlogPostService _blogPostService;

        public BlogPostsController(IBlogPostService blogPostService)
        {
            _blogPostService = blogPostService;
        }

        // GET: api/BlogPosts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetAllPosts([FromQuery] string status = null)
        {
            if (string.IsNullOrEmpty(status) || status.ToLower() == "published")
            {
                // Không có đăng nhập hoặc không có quyền: chỉ trả về bài viết đã xuất bản
                var posts = await _blogPostService.GetAllPostsAsync("Published");
                return Ok(posts);
            }
            else
            {
                // Kiểm tra quyền cho các trạng thái khác
                if (!User.Identity.IsAuthenticated || (!User.IsInRole("Admin") && !User.IsInRole("Staff")))
                {
                    return Forbid("You don't have permission to view unpublished posts");
                }

                var posts = await _blogPostService.GetAllPostsAsync(status);
                return Ok(posts);
            }
        }

        // GET: api/BlogPosts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BlogPostDto>> GetPost(int id)
        {
            var post = await _blogPostService.GetPostByIdAsync(id);
            if (post == null)
            {
                return NotFound("Blog post not found");
            }

            // Nếu bài viết không được xuất bản, kiểm tra quyền
            if (post.Status != "Published")
            {
                if (!User.Identity.IsAuthenticated)
                {
                    return Forbid("You must be logged in to view unpublished posts");
                }

                var userId = GetCurrentUserId();
                var isAuthor = post.UserId == userId;
                var isAdminOrStaff = User.IsInRole("Admin") || User.IsInRole("Staff");

                if (!isAuthor && !isAdminOrStaff)
                {
                    return Forbid("You don't have permission to view this post");
                }
            }
            else
            {
                // Tăng lượt xem cho bài viết đã xuất bản
                await _blogPostService.IncrementViewCountAsync(id);
            }

            return Ok(post);
        }

        // GET: api/BlogPosts/Category/news
        [HttpGet("Category/{category}")]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetPostsByCategory(string category)
        {
            var posts = await _blogPostService.GetPostsByCategoryAsync(category);
            return Ok(posts);
        }

        // GET: api/BlogPosts/User/5
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetPostsByUser(int userId)
        {
            var posts = await _blogPostService.GetPostsByUserIdAsync(userId);

            // Nếu không đăng nhập hoặc không phải tác giả/admin: chỉ trả về bài viết đã xuất bản
            if (!User.Identity.IsAuthenticated ||
                (GetCurrentUserId() != userId && !User.IsInRole("Admin") && !User.IsInRole("Staff")))
            {
                posts = posts.Where(p => p.Status == "Published").ToList();
            }

            return Ok(posts);
        }

        // GET: api/BlogPosts/MyPosts
        [HttpGet("MyPosts")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> GetMyPosts()
        {
            var userId = GetCurrentUserId();
            var posts = await _blogPostService.GetPostsByUserIdAsync(userId);
            return Ok(posts);
        }

        // GET: api/BlogPosts/Search?query=pets
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<BlogPostDto>>> SearchPosts([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest("Search query is required");
            }

            var posts = await _blogPostService.SearchPostsAsync(query);
            return Ok(posts);
        }

        // POST: api/BlogPosts
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BlogPostDto>> CreatePost([FromForm] CreateBlogPostDto createBlogPostDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var post = await _blogPostService.CreatePostAsync(userId, createBlogPostDto);
                return CreatedAtAction(nameof(GetPost), new { id = post.PostId }, post);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/BlogPosts/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<BlogPostDto>> UpdatePost(int id, [FromForm] UpdateBlogPostDto updateBlogPostDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var post = await _blogPostService.UpdatePostAsync(id, userId, updateBlogPostDto);
                return Ok(post);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/BlogPosts/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePost(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _blogPostService.DeletePostAsync(id, userId);
                if (!result)
                {
                    return NotFound("Blog post not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PATCH: api/BlogPosts/5/Publish
        [HttpPatch("{id}/Publish")]
        [Authorize]
        public async Task<ActionResult<BlogPostDto>> PublishPost(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var post = await _blogPostService.PublishPostAsync(id, userId);
                return Ok(post);
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