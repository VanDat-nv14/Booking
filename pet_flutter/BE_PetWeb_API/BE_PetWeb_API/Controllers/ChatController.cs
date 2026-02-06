using System;
using System.Threading.Tasks;
using BE_PetWeb_API.Models;
using BE_PetWeb_API.Services;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BE_PetWeb_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IOneSignalChatService _oneSignalChatService;
        private readonly IFirebaseMessagingService _firebaseMessagingService;
        private readonly PetWebContext _context;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            IOneSignalChatService oneSignalChatService,
            IFirebaseMessagingService firebaseMessagingService,
            PetWebContext context,
            ILogger<ChatController> logger)
        {
            _oneSignalChatService = oneSignalChatService;
            _firebaseMessagingService = firebaseMessagingService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("SendNotification")]
        public async Task<IActionResult> SendChatNotification([FromBody] SendChatNotificationRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.RecipientUserId) || 
                    string.IsNullOrEmpty(request.SenderName) || 
                    string.IsNullOrEmpty(request.ChatRoomId))
                {
                    return BadRequest(new { message = "Missing required fields" });
                }

                await _oneSignalChatService.SendChatNotificationAsync(
                    request.RecipientUserId,
                    request.SenderName,
                    request.MessageContent ?? "",
                    request.ChatRoomId,
                    request.SenderAvatar
                );

                // Gửi FCM notification
                if (int.TryParse(request.RecipientUserId, out int recipientId))
                {
                    var recipient = await _context.Users.FindAsync(recipientId);
                    if (recipient != null && !string.IsNullOrEmpty(recipient.FcmToken))
                    {
                        var messagePreview = string.IsNullOrEmpty(request.MessageContent) 
                            ? "Đã gửi một tin nhắn" 
                            : request.MessageContent;

                        await _firebaseMessagingService.SendNotificationAsync(
                            recipient.FcmToken,
                            request.SenderName,
                            messagePreview,
                            new Dictionary<string, string>
                            {
                                { "type", "chat" },
                                { "chatRoomId", request.ChatRoomId },
                                { "senderId", request.RecipientUserId },
                                { "senderName", request.SenderName },
                                { "senderAvatar", request.SenderAvatar ?? "" }
                            }
                        );
                        _logger.LogInformation($"FCM notification sent to user {recipientId}");
                    }
                }

                return Ok(new { message = "Notification sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendChatNotification");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }

    public class SendChatNotificationRequest
    {
        public string RecipientUserId { get; set; }
        public string SenderName { get; set; }
        public string MessageContent { get; set; }
        public string ChatRoomId { get; set; }
        public string SenderAvatar { get; set; }
    }
}
