using BE_PetWeb_API.DTOs.Payment;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentDto> ProcessPaymentAsync(ProcessPaymentDto paymentDto);
        Task<PaymentDto> GetPaymentByOrderIdAsync(int orderId);
        Task<bool> CancelPaymentAsync(int paymentId);
        Task<PaymentDto> VerifyPaymentAsync(string transactionId);
    }
}