using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IFileService
    {
        /// <summary>
        /// Uploads an image file to the specified folder
        /// </summary>
        /// <param name="file">The file to upload</param>
        /// <param name="folderName">The folder name to store the file (e.g., "pets")</param>
        /// <returns>The relative path to the uploaded file or null if upload fails</returns>
        Task<string> UploadImageAsync(IFormFile file, string folderName);

        /// <summary>
        /// Deletes an image file based on its relative path
        /// </summary>
        /// <param name="imagePath">The relative path to the image file</param>
        /// <returns>True if deletion was successful, otherwise false</returns>
        bool DeleteImage(string imagePath);
    }
}