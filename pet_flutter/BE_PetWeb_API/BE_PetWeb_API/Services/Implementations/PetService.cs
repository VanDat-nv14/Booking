using BE_PetWeb_API.DTOs.Pet;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class PetService : IPetService
    {
        private readonly PetWebContext _context;
        private readonly IFileService _fileService;
        private readonly ILogger<PetService> _logger;

        public PetService(PetWebContext context, IFileService fileService, ILogger<PetService> logger)
        {
            _context = context;
            _fileService = fileService;
            _logger = logger;
        }

        public async Task<IEnumerable<PetDto>> GetAllPetsAsync()
        {
            try
            {
                var pets = await _context.Pets
                    .Include(p => p.User)
                    .Where(p => p.IsActive == true)
                    .Select(p => new PetDto
                    {
                        PetId = p.PetId,
                        UserId = p.UserId,
                        Name = p.Name,
                        Species = p.Species,
                        Breed = p.Breed,
                        Gender = p.Gender,
                        // Chuyển đổi từ DateOnly? sang DateTime?
                        DateOfBirth = p.DateOfBirth != null ? new DateTime?(new DateTime(p.DateOfBirth.Value.Year, p.DateOfBirth.Value.Month, p.DateOfBirth.Value.Day)) : null,
                        Weight = p.Weight,
                        Color = p.Color,
                        Description = p.Description,
                        Photo = p.Photo,
                        OwnerName = p.User.FullName
                    })
                    .ToListAsync();

                return pets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all pets");
                throw;
            }
        }

        public async Task<IEnumerable<PetDto>> GetUserPetsAsync(int userId)
        {
            try
            {
                var pets = await _context.Pets
                    .Include(p => p.User)
                    .Where(p => p.UserId == userId && p.IsActive == true)
                    .Select(p => new PetDto
                    {
                        PetId = p.PetId,
                        UserId = p.UserId,
                        Name = p.Name,
                        Species = p.Species,
                        Breed = p.Breed,
                        Gender = p.Gender,
                        // Chuyển đổi từ DateOnly? sang DateTime?
                        DateOfBirth = p.DateOfBirth != null ? new DateTime?(new DateTime(p.DateOfBirth.Value.Year, p.DateOfBirth.Value.Month, p.DateOfBirth.Value.Day)) : null,
                        Weight = p.Weight,
                        Color = p.Color,
                        Description = p.Description,
                        Photo = p.Photo,
                        OwnerName = p.User.FullName
                    })
                    .ToListAsync();

                return pets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting pets for user {userId}");
                throw;
            }
        }

        public async Task<PetDto> GetPetByIdAsync(int id)
        {
            try
            {
                var pet = await _context.Pets
                    .Include(p => p.User)
                    .Where(p => p.PetId == id && p.IsActive == true)
                    .Select(p => new PetDto
                    {
                        PetId = p.PetId,
                        UserId = p.UserId,
                        Name = p.Name,
                        Species = p.Species,
                        Breed = p.Breed,
                        Gender = p.Gender,
                        // Chuyển đổi từ DateOnly? sang DateTime?
                        DateOfBirth = p.DateOfBirth != null ? new DateTime?(new DateTime(p.DateOfBirth.Value.Year, p.DateOfBirth.Value.Month, p.DateOfBirth.Value.Day)) : null,
                        Weight = p.Weight,
                        Color = p.Color,
                        Description = p.Description,
                        Photo = p.Photo,
                        OwnerName = p.User.FullName
                    })
                    .FirstOrDefaultAsync();

                return pet;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting pet with id {id}");
                throw;
            }
        }

        public async Task<PetDto> CreatePetAsync(int userId, CreatePetDto createPetDto)
        {
            try
            {
                _logger.LogInformation($"Creating pet with name: {createPetDto.Name}, Species: {createPetDto.Species}");

                // Đảm bảo species chỉ có thể là "Chó" hoặc "Mèo"
                if (createPetDto.Species != "Chó" && createPetDto.Species != "Mèo")
                {
                    createPetDto.Species = "Chó"; // Mặc định là "Chó"
                    _logger.LogWarning($"Invalid species value provided: {createPetDto.Species}. Using default: Chó");
                }

                // Đảm bảo gender chỉ có thể là "Đực" hoặc "Cái"
                if (createPetDto.Gender != "Đực" && createPetDto.Gender != "Cái")
                {
                    createPetDto.Gender = "Đực"; // Mặc định là "Đực"
                    _logger.LogWarning($"Invalid gender value provided: {createPetDto.Gender}. Using default: Đực");
                }

                // Log thông tin ngày tháng để debug
                if (createPetDto.DateOfBirth.HasValue)
                {
                    _logger.LogInformation($"Input date: {createPetDto.DateOfBirth.Value.ToString("yyyy-MM-dd")}");
                }

                DateOnly? dateOfBirth = null;

                // Xử lý ngày tháng an toàn hơn
                if (createPetDto.DateOfBirth.HasValue)
                {
                    try
                    {
                        // Cố gắng chuyển đổi từ DateTime sang DateOnly
                        dateOfBirth = DateOnly.FromDateTime(createPetDto.DateOfBirth.Value);
                        _logger.LogInformation($"Parsed date: {dateOfBirth.Value.ToString()}");
                    }
                    catch (Exception dateEx)
                    {
                        _logger.LogWarning(dateEx, $"Error parsing date {createPetDto.DateOfBirth.Value}. Continuing with null date.");
                        // Không throw exception, tiếp tục với dateOfBirth = null
                    }
                }

                var pet = new Pet
                {
                    UserId = userId,
                    Name = createPetDto.Name,
                    Species = createPetDto.Species,
                    Breed = createPetDto.Breed ?? string.Empty,
                    Gender = createPetDto.Gender,
                    DateOfBirth = dateOfBirth,
                    Weight = createPetDto.Weight,
                    Color = createPetDto.Color ?? string.Empty,
                    Description = createPetDto.Description ?? string.Empty,
                    MedicalHistory = string.Empty, // Đảm bảo không null
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true
                };

                // Tách phần xử lý ảnh để tránh làm hỏng toàn bộ quá trình nếu upload lỗi
                string photoPath = null;
                if (createPetDto.Photo != null && createPetDto.Photo.Length > 0)
                {
                    try
                    {
                        photoPath = await _fileService.UploadImageAsync(createPetDto.Photo, "pets");
                        _logger.LogInformation($"Successfully uploaded image for pet: {photoPath}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error uploading pet image: {ex.Message}");
                        // Tiếp tục mà không có ảnh
                    }
                }

                // Chỉ gán đường dẫn ảnh nếu upload thành công
                pet.Photo = photoPath;

                _context.Pets.Add(pet);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Created new pet with ID: {pet.PetId}");

                var user = await _context.Users.FindAsync(userId);

                return new PetDto
                {
                    PetId = pet.PetId,
                    UserId = pet.UserId,
                    Name = pet.Name,
                    Species = pet.Species,
                    Breed = pet.Breed,
                    Gender = pet.Gender,
                    DateOfBirth = pet.DateOfBirth.HasValue ?
                        new DateTime(pet.DateOfBirth.Value.Year, pet.DateOfBirth.Value.Month, pet.DateOfBirth.Value.Day) : null,
                    Weight = pet.Weight,
                    Color = pet.Color,
                    Description = pet.Description,
                    Photo = pet.Photo,
                    OwnerName = user?.FullName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating pet: {ex.Message}");
                _logger.LogError($"Inner exception: {ex.InnerException?.Message}");
                throw;
            }
        }

        public async Task<PetDto> UpdatePetAsync(int id, int userId, UpdatePetDto updatePetDto)
        {
            try
            {
                _logger.LogInformation($"Updating pet with ID: {id}, User ID: {userId}");

                // Đảm bảo species chỉ có thể là "Chó" hoặc "Mèo"
                if (updatePetDto.Species != "Chó" && updatePetDto.Species != "Mèo")
                {
                    updatePetDto.Species = "Chó"; // Mặc định là "Chó"
                    _logger.LogWarning($"Invalid species value provided for update: {updatePetDto.Species}. Using default: Chó");
                }

                // Đảm bảo gender chỉ có thể là "Đực" hoặc "Cái"
                if (updatePetDto.Gender != "Đực" && updatePetDto.Gender != "Cái")
                {
                    updatePetDto.Gender = "Đực"; // Mặc định là "Đực"
                    _logger.LogWarning($"Invalid gender value provided for update: {updatePetDto.Gender}. Using default: Đực");
                }

                var pet = await _context.Pets.FindAsync(id);
                if (pet == null || pet.IsActive != true)
                {
                    _logger.LogWarning($"Pet not found or not active: {id}");
                    return null;
                }

                if (pet.UserId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to update pet {id} owned by {pet.UserId}");
                    throw new Exception("You are not authorized to update this pet");
                }

                // Log thông tin ngày tháng để debug
                if (updatePetDto.DateOfBirth.HasValue)
                {
                    _logger.LogInformation($"Update date: {updatePetDto.DateOfBirth.Value.ToString("yyyy-MM-dd")}");
                }

                DateOnly? dateOfBirth = null;

                // Xử lý ngày tháng an toàn hơn
                if (updatePetDto.DateOfBirth.HasValue)
                {
                    try
                    {
                        // Cố gắng chuyển đổi từ DateTime sang DateOnly
                        dateOfBirth = DateOnly.FromDateTime(updatePetDto.DateOfBirth.Value);
                        _logger.LogInformation($"Parsed update date: {dateOfBirth.Value.ToString()}");
                    }
                    catch (Exception dateEx)
                    {
                        _logger.LogWarning(dateEx, $"Error parsing update date {updatePetDto.DateOfBirth.Value}. Continuing with previous date.");
                        // Giữ nguyên ngày tháng cũ
                        dateOfBirth = pet.DateOfBirth;
                    }
                }

                // Cập nhật thông tin cơ bản
                pet.Name = updatePetDto.Name;
                pet.Species = updatePetDto.Species;
                pet.Breed = updatePetDto.Breed ?? string.Empty;
                pet.Gender = updatePetDto.Gender;
                pet.DateOfBirth = dateOfBirth;
                pet.Weight = updatePetDto.Weight;
                pet.Color = updatePetDto.Color ?? string.Empty;
                pet.Description = updatePetDto.Description ?? string.Empty;
                pet.UpdatedAt = DateTime.Now;

                // Xử lý ảnh nếu có
                if (updatePetDto.Photo != null && updatePetDto.Photo.Length > 0)
                {
                    try
                    {
                        _logger.LogInformation($"Processing new image upload for pet {id}");

                        // Xóa ảnh cũ nếu có
                        if (!string.IsNullOrEmpty(pet.Photo))
                        {
                            bool deleted = _fileService.DeleteImage(pet.Photo);
                            _logger.LogInformation($"Deleted old image result: {deleted}, Path: {pet.Photo}");
                        }

                        // Upload ảnh mới vào thư mục pets
                        string newPhotoPath = await _fileService.UploadImageAsync(updatePetDto.Photo, "pets");

                        if (!string.IsNullOrEmpty(newPhotoPath))
                        {
                            _logger.LogInformation($"New image uploaded successfully: {newPhotoPath}");
                            pet.Photo = newPhotoPath;
                        }
                        else
                        {
                            _logger.LogWarning("Failed to upload new image, path is null or empty");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error during image update process for pet {id}: {ex.Message}");
                        // Giữ nguyên ảnh cũ nếu có lỗi
                    }
                }

                _context.Pets.Update(pet);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Successfully updated pet with ID: {pet.PetId}");

                var user = await _context.Users.FindAsync(userId);

                return new PetDto
                {
                    PetId = pet.PetId,
                    UserId = pet.UserId,
                    Name = pet.Name,
                    Species = pet.Species,
                    Breed = pet.Breed,
                    Gender = pet.Gender,
                    DateOfBirth = pet.DateOfBirth.HasValue ?
                        new DateTime(pet.DateOfBirth.Value.Year, pet.DateOfBirth.Value.Month, pet.DateOfBirth.Value.Day) : null,
                    Weight = pet.Weight,
                    Color = pet.Color,
                    Description = pet.Description,
                    Photo = pet.Photo,
                    OwnerName = user?.FullName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating pet {id}: {ex.Message}");
                _logger.LogError($"Inner exception: {ex.InnerException?.Message}");
                throw;
            }
        }

        public async Task<bool> DeletePetAsync(int id, int userId)
        {
            try
            {
                var pet = await _context.Pets.FindAsync(id);
                if (pet == null || pet.IsActive != true)
                {
                    _logger.LogWarning($"Pet not found or not active during delete: {id}");
                    return false;
                }

                if (pet.UserId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to delete pet {id} owned by {pet.UserId}");
                    throw new Exception("You are not authorized to delete this pet");
                }

                // Soft delete
                pet.IsActive = false;
                pet.UpdatedAt = DateTime.Now;

                _context.Pets.Update(pet);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Soft deleted pet with ID: {pet.PetId}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting pet {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> IsPetOwner(int petId, int userId)
        {
            try
            {
                // Đếm số lượng thay vì sử dụng FirstOrDefault hoặc Any
                int count = await _context.Pets
                    .CountAsync(p => p.PetId == petId && p.UserId == userId);

                if (count > 0)
                {
                    var pet = await _context.Pets.FindAsync(petId);
                    return pet?.IsActive == true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking pet ownership for pet {petId} and user {userId}");
                throw;
            }
        }
    }
}