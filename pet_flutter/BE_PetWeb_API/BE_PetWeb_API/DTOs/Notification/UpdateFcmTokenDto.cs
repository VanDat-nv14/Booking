using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Notification;

public class UpdateFcmTokenDto
{
    [Required]
    public string FcmToken { get; set; }
}
