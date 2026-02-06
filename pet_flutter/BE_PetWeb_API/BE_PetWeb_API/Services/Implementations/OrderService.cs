using BE_PetWeb_API.DTOs.Order;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class OrderService : IOrderService
    {
        private readonly PetWebContext _context;
        private readonly IDateTimeService _dateTimeService;

        public OrderService(PetWebContext context, IDateTimeService dateTimeService)
        {
            _context = context;
            _dateTimeService = dateTimeService;
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return null;

            return MapToOrderDto(order);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto)
        {
            // Kiểm tra user có tồn tại
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User không tồn tại");

            // Kiểm tra danh sách sản phẩm
            if (createOrderDto.OrderItems == null || !createOrderDto.OrderItems.Any())
                throw new Exception("Đơn hàng phải có ít nhất một sản phẩm");

            // Thêm logging để debug
            Console.WriteLine($"CreateOrderAsync called with {createOrderDto.OrderItems.Count} items");
            foreach (var item in createOrderDto.OrderItems)
            {
                Console.WriteLine($"OrderItem - ProductId: {item.ProductId}, Quantity: {item.Quantity}, Price: {item.Price}");
                
                if (item.ProductId <= 0)
                    throw new Exception($"ProductId không hợp lệ: {item.ProductId}");
                
                if (item.Quantity <= 0)
                    throw new Exception($"Quantity phải lớn hơn 0. Giá trị hiện tại: {item.Quantity}");
                
                if (item.Price < 0)
                    throw new Exception($"Price không thể âm. Giá trị hiện tại: {item.Price}");
            }

            // Kiểm tra và lấy thông tin sản phẩm
            var productIds = createOrderDto.OrderItems.Select(oi => oi.ProductId).ToList();
            Console.WriteLine($"Looking for products with IDs: [{string.Join(", ", productIds)}]");
            
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId) && p.IsActive == true)
                .ToListAsync();

            Console.WriteLine($"Found {products.Count} products in database");
            foreach (var product in products)
            {
                Console.WriteLine($"Product found: ID={product.ProductId}, Name={product.Name}, IsActive={product.IsActive}, Stock={product.StockQuantity}");
            }

            if (products.Count != productIds.Count)
            {
                var missingIds = productIds.Except(products.Select(p => p.ProductId)).ToList();
                throw new Exception($"Sản phẩm không tồn tại hoặc không còn hoạt động. Missing IDs: [{string.Join(", ", missingIds)}]");
            }

            // Kiểm tra số lượng tồn kho trước khi tạo order
            foreach (var item in createOrderDto.OrderItems)
            {
                var product = products.First(p => p.ProductId == item.ProductId);
                
                if (product.StockQuantity < item.Quantity)
                {
                    throw new Exception($"Sản phẩm '{product.Name}' chỉ còn {product.StockQuantity} sản phẩm trong kho, không đủ cho số lượng yêu cầu: {item.Quantity}");
                }
                
                Console.WriteLine($"Stock check passed for product {product.Name}: Available={product.StockQuantity}, Required={item.Quantity}");
            }

            // Tính tổng tiền sản phẩm từ CreateOrderDto
            decimal subtotalAmount = 0;
            foreach (var item in createOrderDto.OrderItems)
            {
                var product = products.First(p => p.ProductId == item.ProductId);
                // Sử dụng price từ DTO hoặc price từ database
                decimal itemPrice = item.Price > 0 ? item.Price : product.Price;
                subtotalAmount += itemPrice * item.Quantity;
            }

            // Sử dụng TotalAmount từ DTO nếu có, nếu không thì tính từ subtotal + shipping
            decimal totalAmount = createOrderDto.TotalAmount > 0 
                ? createOrderDto.TotalAmount 
                : subtotalAmount + createOrderDto.ShippingFee;

            // Bắt đầu transaction để đảm bảo data consistency
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
            // Tạo đơn hàng mới
            var order = new Order
            {
                UserId = userId,
                RecipientName = createOrderDto.RecipientName,
                RecipientPhone = createOrderDto.RecipientPhone,
                TotalAmount = totalAmount,
                ShippingFee = createOrderDto.ShippingFee,
                ShippingAddress = createOrderDto.ShippingAddress,
                PaymentMethod = createOrderDto.PaymentMethod,
                Notes = createOrderDto.Note,
                Status = Models.OrderStatus.ChoXuLy.ToString(),
                PaymentStatus = Models.PaymentStatus.ChoThanhToan.ToString(),
                OrderDate = _dateTimeService.Now,
                UpdatedAt = _dateTimeService.Now
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

                // Tạo chi tiết đơn hàng và cập nhật số lượng tồn kho
            foreach (var item in createOrderDto.OrderItems)
            {
                var product = products.First(p => p.ProductId == item.ProductId);
                // Sử dụng price từ DTO hoặc price từ database
                decimal itemPrice = item.Price > 0 ? item.Price : product.Price;
                
                var orderItem = new OrderItem
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = itemPrice,
                    Subtotal = itemPrice * item.Quantity,
                    ProductOption = item.ProductOption
                };

                _context.OrderItems.Add(orderItem);
                    
                    // Cập nhật số lượng tồn kho
                    product.StockQuantity -= item.Quantity;
                    product.UpdatedAt = _dateTimeService.Now;
                    _context.Products.Update(product);
                    
                    Console.WriteLine($"Updated stock for product {product.Name}: New Stock = {product.StockQuantity}");
            }

            await _context.SaveChangesAsync();
                
                // Commit transaction
                await transaction.CommitAsync();
                
                Console.WriteLine($"Order {order.OrderId} created successfully with stock updates");

            // Trả về thông tin đơn hàng mới
            return await GetOrderByIdAsync(order.OrderId);
            }
            catch (Exception)
            {
                // Rollback transaction nếu có lỗi
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<OrderDto> UpdateOrderAsync(int orderId, UpdateOrderDto updateOrderDto)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new Exception("Đơn hàng không tồn tại");

            // Không cho phép cập nhật đơn hàng đã hoàn thành hoặc đã hủy
            if (order.Status == Models.OrderStatus.HoanThanh.ToString() || order.Status == Models.OrderStatus.DaHuy.ToString())
                throw new Exception("Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy");

            // Cập nhật thông tin đơn hàng
            if (!string.IsNullOrEmpty(updateOrderDto.ShippingAddress))
                order.ShippingAddress = updateOrderDto.ShippingAddress;

            if (!string.IsNullOrEmpty(updateOrderDto.Status))
                order.Status = updateOrderDto.Status;

            order.UpdatedAt = _dateTimeService.Now;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(orderId);
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new Exception("Đơn hàng không tồn tại");

            // Kiểm tra trạng thái hợp lệ
            var validStatuses = new[] { 
                Models.OrderStatus.ChoXuLy.ToString(),
                Models.OrderStatus.DangXuLy.ToString(),
                Models.OrderStatus.DaXacNhan.ToString(),
                Models.OrderStatus.DangGiaoHang.ToString(),
                Models.OrderStatus.DaGiaoHang.ToString(),
                Models.OrderStatus.HoanThanh.ToString(),
                Models.OrderStatus.DaHuy.ToString()
            };
            if (!validStatuses.Contains(status))
                throw new Exception("Trạng thái không hợp lệ");

            // Không cho phép cập nhật từ trạng thái Cancelled
            if (order.Status == Models.OrderStatus.DaHuy.ToString())
                throw new Exception("Không thể cập nhật đơn hàng đã hủy");

            // Cập nhật trạng thái
            order.Status = status;
            order.UpdatedAt = _dateTimeService.Now;

            // Nếu trạng thái là Completed, cập nhật trạng thái thanh toán
            if (status == Models.OrderStatus.HoanThanh.ToString())
                order.PaymentStatus = Models.PaymentStatus.DaThanhToan.ToString();

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(orderId);
        }

        public async Task<bool> CancelOrderAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
                
            if (order == null)
                return false;

            // Chỉ cho phép hủy đơn hàng ở trạng thái Pending hoặc Processing
            if (order.Status != Models.OrderStatus.ChoXuLy.ToString() && order.Status != Models.OrderStatus.DangXuLy.ToString())
                throw new Exception("Không thể hủy đơn hàng ở trạng thái hiện tại");

            // Bắt đầu transaction để phục hồi tồn kho
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Phục hồi số lượng tồn kho cho các sản phẩm
                foreach (var orderItem in order.OrderItems)
                {
                    if (orderItem.Product != null)
                    {
                        orderItem.Product.StockQuantity += orderItem.Quantity;
                        orderItem.Product.UpdatedAt = _dateTimeService.Now;
                        _context.Products.Update(orderItem.Product);
                        
                        Console.WriteLine($"Restored stock for product {orderItem.Product.Name}: Restored quantity = {orderItem.Quantity}, New stock = {orderItem.Product.StockQuantity}");
                    }
                }

            order.Status = Models.OrderStatus.DaHuy.ToString();
            order.UpdatedAt = _dateTimeService.Now;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
                
                // Commit transaction
                await transaction.CommitAsync();
                
                Console.WriteLine($"Order {orderId} cancelled successfully with stock restoration");

            return true;
            }
            catch (Exception)
            {
                // Rollback transaction nếu có lỗi
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.OrderDate.HasValue && o.OrderDate.Value >= startDate.Date && o.OrderDate.Value < endDate.Date.AddDays(1))
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByStatusAsync(string status)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        private OrderDto MapToOrderDto(Order order)
        {
            // Tính subtotal từ orderItems
            decimal subtotalAmount = order.OrderItems?.Sum(oi => oi.Subtotal) ?? 0;

            return new OrderDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = order.User?.FullName,
                RecipientName = order.RecipientName,
                RecipientPhone = order.RecipientPhone,
                TotalAmount = order.TotalAmount,
                SubtotalAmount = subtotalAmount,
                ShippingFee = order.ShippingFee,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                Status = order.Status,
                Notes = order.Notes,
                OrderDate = order.OrderDate ?? _dateTimeService.Now, // Sử dụng null-coalescing để xử lý null
                UpdatedAt = order.UpdatedAt,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    OrderId = oi.OrderId,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name,
                    ProductImage = oi.Product?.Photo,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Subtotal,
                    ProductOption = oi.ProductOption
                }).ToList()
            };
        }
    }
}