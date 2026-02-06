using System.Threading.Tasks;

namespace BE_PetWeb_API.Services.Interfaces
{
    public interface IOneSignalChatService
    {
        Task SendChatNotificationAsync(
            string recipientUserId,
            string senderName,
            string messageContent,
            string chatRoomId,
            string senderAvatar = null
        );
    }
}
