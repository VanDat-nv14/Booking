using BE_PetWeb_API.DTOs.Payment;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly PetWebContext _context;
        private readonly IOrderService _orderService;

        public PaymentService(PetWebContext context, IOrderService orderService)
        {
            _context = context;
            _orderService = orderService;
        }

        public async Task<PaymentDto> ProcessPaymentAsync(ProcessPaymentDto paymentDto)
        {
            // Lấy thông tin đơn hàng
            var order = await _context.Orders.FindAsync(paymentDto.OrderId);
            if (order == null)
                throw new Exception("Đơn hàng không tồn tại");

            // Kiểm tra trạng thái đơn hàng
            if (order.Status == Models.OrderStatus.DaHuy.ToString())
                throw new Exception("Không thể thanh toán đơn hàng đã hủy");

            if (order.PaymentStatus == Models.PaymentStatus.DaThanhToan.ToString())
                throw new Exception("Đơn hàng đã được thanh toán");

            // Mô phỏng xử lý thanh toán (trong thực tế sẽ tích hợp với cổng thanh toán)
            string transactionId = Guid.NewGuid().ToString();
            string paymentStatus = "Completed"; // Giả định thanh toán thành công

            // Cập nhật thông tin thanh toán vào order
            order.PaymentStatus = Models.PaymentStatus.DaThanhToan.ToString();
            order.Status = Models.OrderStatus.DangXuLy.ToString(); // Sau khi thanh toán, chuyển sang trạng thái đang xử lý
            order.UpdatedAt = DateTime.Now;

            // Trong thực tế, nếu cần lưu thêm thông tin về giao dịch, bạn có thể lưu trong trường Notes
            order.Notes = $"Transaction ID: {transactionId}; Payment Method: {paymentDto.PaymentMethod}; Payment Date: {DateTime.Now}";

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            // Tạo và trả về PaymentDto từ thông tin order
            var result = new PaymentDto
            {
                PaymentId = order.OrderId, // Sử dụng OrderId làm PaymentId
                OrderId = order.OrderId,
                Amount = order.TotalAmount,
                PaymentMethod = paymentDto.PaymentMethod,
                TransactionId = transactionId,
                Status = paymentStatus,
                PaymentDate = DateTime.Now
            };

            return result;
        }

        public async Task<PaymentDto> GetPaymentByOrderIdAsync(int orderId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return null;

            // Nếu chưa thanh toán
            if (order.PaymentStatus != "Paid")
                return null;

            // Parse thông tin thanh toán từ Notes (nếu có)
            string transactionId = "N/A";
            DateTime paymentDate = order.UpdatedAt ?? DateTime.Now;

            if (!string.IsNullOrEmpty(order.Notes) && order.Notes.Contains("Transaction ID:"))
            {
                var noteParts = order.Notes.Split(';');
                foreach (var part in noteParts)
                {
                    if (part.Trim().StartsWith("Transaction ID:"))
                    {
                        transactionId = part.Replace("Transaction ID:", "").Trim();
                    }
                    else if (part.Trim().StartsWith("Payment Date:"))
                    {
                        if (DateTime.TryParse(part.Replace("Payment Date:", "").Trim(), out DateTime date))
                        {
                            paymentDate = date;
                        }
                    }
                }
            }

            // Tạo PaymentDto từ thông tin order
            var result = new PaymentDto
            {
                PaymentId = order.OrderId,
                OrderId = order.OrderId,
                Amount = order.TotalAmount,
                PaymentMethod = order.PaymentMethod,
                TransactionId = transactionId,
                Status = order.PaymentStatus,
                PaymentDate = paymentDate
            };

            return result;
        }

        public async Task<bool> CancelPaymentAsync(int paymentId)
        {
            // Trong trường hợp này, paymentId chính là orderId
            var order = await _context.Orders.FindAsync(paymentId);
            if (order == null)
                return false;

            // Chỉ cho phép hủy thanh toán nếu đơn hàng ở trạng thái Pending
            if (order.Status != "Pending" && order.Status != "Processing")
                throw new Exception("Không thể hủy thanh toán cho đơn hàng ở trạng thái hiện tại");

            // Cập nhật trạng thái thanh toán
            order.PaymentStatus = Models.PaymentStatus.DaHuy.ToString();
            order.Status = Models.OrderStatus.DaHuy.ToString();
            order.UpdatedAt = DateTime.Now;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<PaymentDto> VerifyPaymentAsync(string transactionId)
        {
            // Tìm order có transactionId trong Notes
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Notes != null && o.Notes.Contains("Transaction ID: " + transactionId));

            if (order == null)
                return null;

            DateTime paymentDate = order.UpdatedAt ?? DateTime.Now;
            if (!string.IsNullOrEmpty(order.Notes) && order.Notes.Contains("Payment Date:"))
            {
                var noteParts = order.Notes.Split(';');
                foreach (var part in noteParts)
                {
                    if (part.Trim().StartsWith("Payment Date:"))
                    {
                        if (DateTime.TryParse(part.Replace("Payment Date:", "").Trim(), out DateTime date))
                        {
                            paymentDate = date;
                        }
                    }
                }
            }

            // Tạo PaymentDto từ thông tin order
            var result = new PaymentDto
            {
                PaymentId = order.OrderId,
                OrderId = order.OrderId,
                Amount = order.TotalAmount,
                PaymentMethod = order.PaymentMethod,
                TransactionId = transactionId,
                Status = order.PaymentStatus,
                PaymentDate = paymentDate
            };

            return result;
        }
    }
}