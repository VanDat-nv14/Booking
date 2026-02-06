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
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly IFileService _fileService;

        public ReviewsController(IReviewService reviewService, IFileService fileService)
        {
            _reviewService = reviewService;
            _fileService = fileService;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetAllReviews()
        {
            var reviews = await _reviewService.GetAllReviewsAsync();
            return Ok(reviews);
        }

        // GET: api/Reviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetReview(int id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);
            if (review == null)
            {
                return NotFound("Review not found");
            }

            return Ok(review);
        }

        // GET: api/Reviews/User/5
        [HttpGet("User/{userId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByUser(int userId)
        {
            var reviews = await _reviewService.GetReviewsByUserIdAsync(userId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Service/5
        [HttpGet("Service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByService(int serviceId)
        {
            var reviews = await _reviewService.GetReviewsByServiceIdAsync(serviceId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Product/5
        [HttpGet("Product/{productId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByProduct(int productId, [FromQuery] string sortBy = "newest")
        {
            var reviews = await _reviewService.GetReviewsByProductIdWithFilterAsync(productId, sortBy);
            return Ok(reviews);
        }

        // GET: api/Reviews/Appointment/5
        [HttpGet("Appointment/{appointmentId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByAppointment(int appointmentId)
        {
            var reviews = await _reviewService.GetReviewsByAppointmentIdAsync(appointmentId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Order/5
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByOrder(int orderId)
        {
            var reviews = await _reviewService.GetReviewsByOrderIdAsync(orderId);
            return Ok(reviews);
        }

        // GET: api/Reviews/Service/5/Rating
        [HttpGet("Service/{serviceId}/Rating")]
        public async Task<ActionResult<double>> GetServiceRating(int serviceId)
        {
            var rating = await _reviewService.GetAverageRatingForServiceAsync(serviceId);
            return Ok(new { AverageRating = rating });
        }

        // GET: api/Reviews/Product/5/Rating
        [HttpGet("Product/{productId}/Rating")]
        public async Task<ActionResult<double>> GetProductRating(int productId)
        {
            var rating = await _reviewService.GetAverageRatingForProductAsync(productId);
            return Ok(new { AverageRating = rating });
        }

        // GET: api/Reviews/User/{userId}/Product/{productId}/PurchaseStatus
        [HttpGet("User/{userId}/Product/{productId}/PurchaseStatus")]
        [Authorize]
        public async Task<ActionResult<UserProductPurchaseStatusDto>> GetUserProductPurchaseStatus(int userId, int productId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");

                // Chỉ cho phép user xem trạng thái của chính mình hoặc admin
                if (currentUserId != userId && !isAdmin)
                {
                    return Forbid("Bạn không có quyền xem thông tin này");
                }

                var status = await _reviewService.GetUserProductPurchaseStatusAsync(userId, productId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Reviews/Public/User/{userId}/Product/{productId}/PurchaseStatus
        [HttpGet("Public/User/{userId}/Product/{productId}/PurchaseStatus")]
        public async Task<ActionResult<PublicPurchaseStatusDto>> GetPublicUserProductPurchaseStatus(int userId, int productId)
        {
            try
            {
                var status = await _reviewService.GetPublicUserProductPurchaseStatusAsync(userId, productId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Reviews
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto createReviewDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var review = await _reviewService.CreateReviewAsync(userId, createReviewDto);
                return CreatedAtAction(nameof(GetReview), new { id = review.ReviewId }, review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> UpdateReview(int id, UpdateReviewDto updateReviewDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var review = await _reviewService.UpdateReviewAsync(id, userId, updateReviewDto);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _reviewService.DeleteReviewAsync(id, userId);
                if (!result)
                {
                    return NotFound("Review not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/Reviews/upload-images
        [HttpPost("upload-images")]
        [Authorize]
        public async Task<IActionResult> UploadReviewImages(List<IFormFile> files)
        {
            try
            {
                if (files == null || !files.Any())
                {
                    return BadRequest("Không có file nào được tải lên");
                }

                // Giới hạn số lượng ảnh (tối đa 5 ảnh)
                if (files.Count > 5)
                {
                    return BadRequest("Chỉ được tải lên tối đa 5 ảnh");
                }

                var uploadedImages = new List<string>();

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        // Kiểm tra kích thước file (tối đa 5MB)
                        if (file.Length > 5 * 1024 * 1024)
                        {
                            return BadRequest($"File '{file.FileName}' quá lớn. Kích thước tối đa là 5MB");
                        }

                        // Upload ảnh vào thư mục reviews
                        string imagePath = await _fileService.UploadImageAsync(file, "reviews");
                        
                        if (!string.IsNullOrEmpty(imagePath))
                        {
                            uploadedImages.Add(imagePath);
                        }
                    }
                }

                return Ok(new { 
                    message = $"Đã tải lên {uploadedImages.Count} ảnh thành công", 
                    images = uploadedImages 
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi khi tải lên ảnh: {ex.Message}");
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