using System.Security.Claims;
using BE_PetWeb_API.DTOs.Payment;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;

        public PaymentsController(IPaymentService paymentService, IOrderService orderService)
        {
            _paymentService = paymentService;
            _orderService = orderService;
        }

        // POST: api/Payments/Process
        [HttpPost("Process")]
        public async Task<ActionResult> ProcessPayment(ProcessPaymentDto paymentDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");

                // Lấy thông tin đơn hàng để kiểm tra quyền
                var order = await _orderService.GetOrderByIdAsync(paymentDto.OrderId);
                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Kiểm tra quyền: Admin hoặc chủ sở hữu đơn hàng
                if (!isAdmin && order.UserId != userId)
                {
                    return Forbid("You don't have permission to pay for this order");
                }

                var payment = await _paymentService.ProcessPaymentAsync(paymentDto);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Payments/Order/5
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult> GetPaymentByOrderId(int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");

                // Lấy thông tin đơn hàng để kiểm tra quyền
                var order = await _orderService.GetOrderByIdAsync(orderId);
                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Kiểm tra quyền: Admin hoặc chủ sở hữu đơn hàng
                if (!isAdmin && order.UserId != userId)
                {
                    return Forbid("You don't have permission to view this payment");
                }

                var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
                if (payment == null)
                {
                    return NotFound("Payment not found for this order");
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Payments/5/Cancel
        [HttpDelete("{paymentId}/Cancel")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CancelPayment(int paymentId)
        {
            try
            {
                var result = await _paymentService.CancelPaymentAsync(paymentId);
                if (!result)
                {
                    return NotFound("Payment not found or cannot be cancelled");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Payments/Verify/{transactionId}
        [HttpGet("Verify/{transactionId}")]
        public async Task<ActionResult> VerifyPayment(string transactionId)
        {
            try
            {
                var payment = await _paymentService.VerifyPaymentAsync(transactionId);
                if (payment == null)
                {
                    return NotFound("Transaction not found");
                }

                return Ok(payment);
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