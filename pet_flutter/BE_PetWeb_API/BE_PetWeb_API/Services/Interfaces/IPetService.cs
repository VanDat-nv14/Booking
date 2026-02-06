using BE_PetWeb_API.DTOs.Pet;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IPetService
    {
        Task<IEnumerable<PetDto>> GetAllPetsAsync();
        Task<IEnumerable<PetDto>> GetUserPetsAsync(int userId);
        Task<PetDto> GetPetByIdAsync(int id);
        Task<PetDto> CreatePetAsync(int userId, CreatePetDto createPetDto);
        Task<PetDto> UpdatePetAsync(int id, int userId, UpdatePetDto updatePetDto);
        Task<bool> DeletePetAsync(int id, int userId);
        Task<bool> IsPetOwner(int petId, int userId);
    }
}