using System.Security.Claims;
using BE_PetWeb_API.DTOs.Order;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace BE_PetWeb_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // GET: api/Orders
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
            {
                return NotFound("Order not found");
            }

            // Kiểm tra quyền: Admin hoặc chủ sở hữu đơn hàng
            if (!isAdmin && order.UserId != userId)
            {
                return Forbid("You don't have permission to view this order");
            }

            return Ok(order);
        }

        // GET: api/Orders/User
        [HttpGet("User")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders()
        {
            var userId = GetCurrentUserId();
            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }

        // GET: api/Orders/Date?startDate=2023-06-01&endDate=2023-06-30
        [HttpGet("Date")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var orders = await _orderService.GetOrdersByDateRangeAsync(startDate, endDate);
            return Ok(orders);
        }

        // GET: api/Orders/Status/Processing
        [HttpGet("Status/{status}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByStatus(string status)
        {
            var orders = await _orderService.GetOrdersByStatusAsync(status);
            return Ok(orders);
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto createOrderDto)
        {
            try
            {
                Console.WriteLine($"CreateOrder called by user: {GetCurrentUserId()}");
                Console.WriteLine($"CreateOrderDto received: {System.Text.Json.JsonSerializer.Serialize(createOrderDto)}");
                
                // Validate ModelState
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value.Errors.Count > 0)
                        .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                        .ToList();
                    
                    Console.WriteLine($"ModelState validation failed: {System.Text.Json.JsonSerializer.Serialize(errors)}");
                    return BadRequest($"Dữ liệu không hợp lệ: {string.Join(", ", errors.SelectMany(e => e.Errors))}");
                }
                
                var userId = GetCurrentUserId();
                var createdOrder = await _orderService.CreateOrderAsync(userId, createOrderDto);
                return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.OrderId }, createdOrder);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateOrder: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, UpdateOrderDto updateOrderDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Kiểm tra quyền: Admin hoặc chủ sở hữu đơn hàng
                if (!isAdmin && order.UserId != userId)
                {
                    return Forbid("You don't have permission to update this order");
                }

                // Chỉ Admin có thể thay đổi trạng thái
                if (!isAdmin && !string.IsNullOrEmpty(updateOrderDto.Status))
                {
                    return Forbid("Only administrators can change the order status");
                }

                var updatedOrder = await _orderService.UpdateOrderAsync(id, updateOrderDto);
                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PATCH: api/Orders/5/Status
        [HttpPatch("{id}/Status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto updateStatusDto)
        {
            try
            {
                var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto.Status);
                return Ok(updatedOrder);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Orders/5/Cancel
        [HttpDelete("{id}/Cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isAdmin = User.IsInRole("Admin");

                var order = await _orderService.GetOrderByIdAsync(id);
                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Kiểm tra quyền: Admin hoặc chủ sở hữu đơn hàng
                if (!isAdmin && order.UserId != userId)
                {
                    return Forbid("You don't have permission to cancel this order");
                }

                var result = await _orderService.CancelOrderAsync(id);
                if (!result)
                {
                    return NotFound("Order not found or cannot be cancelled");
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