using BE_PetWeb_API.Models;
using BE_PetWeb_API.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ReservationCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReservationCleanupService> _logger;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(1); // Cleanup mỗi phút

        public ReservationCleanupService(
            IServiceProvider serviceProvider, 
            ILogger<ReservationCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Reservation Cleanup Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredReservations();
                    await Task.Delay(_cleanupInterval, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during reservation cleanup");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Wait 5 minutes on error
                }
            }

            _logger.LogInformation("Reservation Cleanup Service stopped");
        }

        private async Task CleanupExpiredReservations()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PetWebContext>();

            try
            {
                var now = DateTime.Now;
                
                // Tìm tất cả reservations đã hết hạn
                var expiredReservations = await context.TemporaryReservations
                    .Where(tr => tr.IsActive && tr.ExpiresAt <= now)
                    .ToListAsync();

                if (expiredReservations.Any())
                {
                    // Đánh dấu là inactive
                    foreach (var reservation in expiredReservations)
                    {
                        reservation.IsActive = false;
                    }

                    await context.SaveChangesAsync();

                    _logger.LogInformation($"Cleaned up {expiredReservations.Count} expired reservations");

                    // TODO: Có thể thêm SignalR notification để thông báo slots đã được release
                    await NotifySlotReleases(expiredReservations, scope);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CleanupExpiredReservations");
            }
        }

        private async Task NotifySlotReleases(List<TemporaryReservation> expiredReservations, IServiceScope scope)
        {
            try
            {
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<TimeSlotSharingHub>>();

                foreach (var reservation in expiredReservations)
                {
                    var groupName = $"service_{reservation.ServiceId}_{reservation.SlotStartTime:yyyy-MM-dd}_{reservation.StaffId?.ToString() ?? "any"}";
                    
                    await hubContext.Clients.Group(groupName).SendAsync("SlotReleased", new
                    {
                        serviceId = reservation.ServiceId,
                        staffId = reservation.StaffId,
                        slotStartTime = reservation.SlotStartTime,
                        reason = "expired"
                    });
                }

                _logger.LogInformation($"Notified about {expiredReservations.Count} expired slot releases");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying slot releases");
            }
        }
    }
} 