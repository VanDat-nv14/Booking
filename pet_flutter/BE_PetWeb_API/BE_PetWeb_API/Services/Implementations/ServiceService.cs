using BE_PetWeb_API.DTOs.Service;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class ServiceService : IServiceService
    {
        private readonly PetWebContext _context;
        private readonly IFileService _fileService;

        public ServiceService(PetWebContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllServicesAsync()
        {
            var services = await _context.Services
                .Where(s => s.IsActive == true)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive,
                    ViewCount = s.ViewCount,
                    BookingCount = s.BookingCount,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            // Tính toán rating và booking count cho mỗi service
            foreach (var service in services)
            {
                // Tính rating trung bình
                var reviews = await _context.Reviews
                    .Where(r => r.ServiceId == service.ServiceId)
                    .ToListAsync();
                
                if (reviews.Any())
                {
                    service.Rating = Math.Round(reviews.Average(r => r.Rating), 1);
                    service.ReviewCount = reviews.Count;
                }

                // Tính số lượng booking
                var bookingCount = await _context.Appointments
                    .Where(a => a.ServiceId == service.ServiceId)
                    .CountAsync();
                
                service.BookingCount = bookingCount;
            }

            return services;
        }

        public async Task<ServiceDto> GetServiceByIdAsync(int id)
        {
            var service = await _context.Services
                .Where(s => s.ServiceId == id && s.IsActive == true)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive,
                    ViewCount = s.ViewCount,
                    BookingCount = s.BookingCount,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (service != null)
            {
                // Tính rating trung bình
                var reviews = await _context.Reviews
                    .Where(r => r.ServiceId == service.ServiceId)
                    .ToListAsync();
                
                if (reviews.Any())
                {
                    service.Rating = Math.Round(reviews.Average(r => r.Rating), 1);
                    service.ReviewCount = reviews.Count;
                }

                // Tính số lượng booking
                var bookingCount = await _context.Appointments
                    .Where(a => a.ServiceId == service.ServiceId)
                    .CountAsync();
                
                service.BookingCount = bookingCount;
            }

            return service;
        }

        public async Task<IEnumerable<ServiceDto>> GetServicesByCategoryAsync(string category)
        {
            var services = await _context.Services
                .Where(s => s.Category == category && s.IsActive == true)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive,
                    ViewCount = s.ViewCount,
                    BookingCount = s.BookingCount,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            // Tính toán rating và booking count cho mỗi service
            foreach (var service in services)
            {
                // Tính rating trung bình
                var reviews = await _context.Reviews
                    .Where(r => r.ServiceId == service.ServiceId)
                    .ToListAsync();
                
                if (reviews.Any())
                {
                    service.Rating = Math.Round(reviews.Average(r => r.Rating), 1);
                    service.ReviewCount = reviews.Count;
                }

                // Tính số lượng booking
                var bookingCount = await _context.Appointments
                    .Where(a => a.ServiceId == service.ServiceId)
                    .CountAsync();
                
                service.BookingCount = bookingCount;
            }

            return services;
        }

        public async Task<IEnumerable<ServiceDto>> GetFilteredServicesAsync(string? category, decimal? minPrice, decimal? maxPrice, int? duration, string sortBy)
        {
            var query = _context.Services.Where(s => s.IsActive == true);

            // Apply filters
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(s => s.Category == category);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(s => s.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(s => s.Price <= maxPrice.Value);
            }

            if (duration.HasValue)
            {
                query = query.Where(s => s.Duration == duration.Value);
            }

            // Apply sorting
            switch (sortBy.ToLower())
            {
                case "price_low":
                    query = query.OrderBy(s => s.Price);
                    break;
                case "price_high":
                    query = query.OrderByDescending(s => s.Price);
                    break;
                case "rating":
                    // Will be sorted after calculating ratings
                    break;
                case "popular":
                default:
                    // Will be sorted after calculating booking counts
                    break;
            }

            var services = await query
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    Name = s.Name,
                    Description = s.Description,
                    Price = s.Price,
                    Duration = s.Duration,
                    Category = s.Category,
                    Photo = s.Photo,
                    IsActive = s.IsActive,
                    ViewCount = s.ViewCount,
                    BookingCount = s.BookingCount,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            // Calculate ratings and booking counts
            foreach (var service in services)
            {
                var reviews = await _context.Reviews
                    .Where(r => r.ServiceId == service.ServiceId)
                    .ToListAsync();
                
                if (reviews.Any())
                {
                    service.Rating = Math.Round(reviews.Average(r => r.Rating), 1);
                    service.ReviewCount = reviews.Count;
                }

                var bookingCount = await _context.Appointments
                    .Where(a => a.ServiceId == service.ServiceId)
                    .CountAsync();
                
                service.BookingCount = bookingCount;
            }

            // Apply sorting that requires calculated fields
            if (sortBy.ToLower() == "rating")
            {
                services = services.OrderByDescending(s => s.Rating).ToList();
            }
            else if (sortBy.ToLower() == "popular")
            {
                services = services.OrderByDescending(s => s.BookingCount).ToList();
            }

            return services;
        }

        public async Task<ServiceDto> CreateServiceAsync(CreateServiceDto createServiceDto)
        {
            var service = new Service
            {
                Name = createServiceDto.Name,
                Description = createServiceDto.Description,
                Price = createServiceDto.Price,
                Duration = createServiceDto.Duration,
                Category = createServiceDto.Category,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };

            // Handle photo upload
            if (createServiceDto.Photo != null)
            {
                try
                {
                    service.Photo = await _fileService.UploadImageAsync(createServiceDto.Photo, "services");
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to upload image: {ex.Message}");
                }
            }

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                ServiceId = service.ServiceId,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                Duration = service.Duration,
                Category = service.Category,
                Photo = service.Photo,
                IsActive = service.IsActive
            };
        }

        public async Task<ServiceDto> UpdateServiceAsync(int id, UpdateServiceDto updateServiceDto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null || service.IsActive != true)
                return null;

            service.Name = updateServiceDto.Name;
            service.Description = updateServiceDto.Description;
            service.Price = updateServiceDto.Price;
            service.Duration = updateServiceDto.Duration;
            service.Category = updateServiceDto.Category;
            service.UpdatedAt = DateTime.Now;

            // Handle photo upload
            if (updateServiceDto.Photo != null)
            {
                try
                {
                    // Delete old photo if exists
                    if (!string.IsNullOrEmpty(service.Photo))
                    {
                        _fileService.DeleteImage(service.Photo);
                    }

                    service.Photo = await _fileService.UploadImageAsync(updateServiceDto.Photo, "services");
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to upload image: {ex.Message}");
                }
            }

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                ServiceId = service.ServiceId,
                Name = service.Name,
                Description = service.Description,
                Price = service.Price,
                Duration = service.Duration,
                Category = service.Category,
                Photo = service.Photo,
                IsActive = service.IsActive
            };
        }

        public async Task<bool> DeleteServiceAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null || service.IsActive != true)
                return false;

            // Check if service is being used in appointments
            bool isUsed = await _context.Appointments.AnyAsync(a => a.ServiceId == id && a.Status != "Cancelled");
            if (isUsed)
            {
                throw new Exception("Cannot delete service as it is currently being used in appointments");
            }

            // Soft delete
            service.IsActive = false;
            service.UpdatedAt = DateTime.Now;

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IncrementViewCountAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null || service.IsActive != true)
            {
                return false;
            }

            service.ViewCount++;
            service.UpdatedAt = DateTime.Now;

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IncrementBookingCountAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null || service.IsActive != true)
            {
                return false;
            }

            service.BookingCount++;
            service.UpdatedAt = DateTime.Now;

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}