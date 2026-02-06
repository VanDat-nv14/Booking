using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Implementations
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FileService> _logger;

        public FileService(IWebHostEnvironment environment, ILogger<FileService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folderName)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("Empty file received for upload");
                    return null;
                }

                // Kiểm tra WebRootPath
                if (string.IsNullOrEmpty(_environment.WebRootPath))
                {
                    _logger.LogError("WebRootPath is null or empty");
                    throw new Exception("Web root path is not configured properly");
                }

                // Ensure valid file extension
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (string.IsNullOrEmpty(fileExtension) || !IsValidImageExtension(fileExtension))
                {
                    _logger.LogWarning($"Invalid file extension: {fileExtension}");
                    throw new Exception("Invalid file extension. Only jpg, jpeg, png, and gif are allowed.");
                }

                // Create directory path: wwwroot/uploads/pets
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", folderName);

                _logger.LogInformation($"Upload folder path: {uploadsFolder}");

                if (!Directory.Exists(uploadsFolder))
                {
                    try
                    {
                        Directory.CreateDirectory(uploadsFolder);
                        _logger.LogInformation($"Created directory: {uploadsFolder}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to create directory: {uploadsFolder}");
                        throw new Exception($"Failed to create upload directory: {ex.Message}");
                    }
                }

                // Generate unique filename
                var uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                _logger.LogInformation($"Saving file to: {filePath}");

                // Save file
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Return relative path to be stored in database (starting with /)
                var relativePath = $"/uploads/{folderName}/{uniqueFileName}";
                _logger.LogInformation($"File uploaded successfully. Relative path: {relativePath}");

                return relativePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image: {ex.Message}");
                throw new Exception($"Failed to upload image: {ex.Message}", ex);
            }
        }

        public bool DeleteImage(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
            {
                _logger.LogWarning("Empty image path provided for deletion");
                return false;
            }

            try
            {
                // Remove leading slash if present
                var path = imagePath.TrimStart('/');
                var fullPath = Path.Combine(_environment.WebRootPath, path);

                _logger.LogInformation($"Attempting to delete file: {fullPath}");

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Successfully deleted file: {fullPath}");
                    return true;
                }

                _logger.LogWarning($"File not found for deletion: {fullPath}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting image {imagePath}: {ex.Message}");
                return false;
            }
        }

        private bool IsValidImageExtension(string extension)
        {
            var validExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            return Array.Exists(validExtensions, ext => ext.Equals(extension, StringComparison.OrdinalIgnoreCase));
        }
    }
}