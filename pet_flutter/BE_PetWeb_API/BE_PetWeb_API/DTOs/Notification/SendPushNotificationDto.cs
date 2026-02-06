using System.ComponentModel.DataAnnotations;

namespace BE_PetWeb_API.DTOs.Notification;

public class SendPushNotificationDto
{
    [Required]
    public int TargetUserId { get; set; }

    [Required]
    public string Title { get; set; }

    [Required]
    public string Body { get; set; }

    public Dictionary<string, string>? Data { get; set; }
}
