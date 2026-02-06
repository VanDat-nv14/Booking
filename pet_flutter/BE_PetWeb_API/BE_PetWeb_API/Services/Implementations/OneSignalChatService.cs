using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using BE_PetWeb_API.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BE_PetWeb_API.Services.Implementations
{
    public class OneSignalChatService : IOneSignalChatService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<OneSignalChatService> _logger;
        private readonly HttpClient _httpClient;

        public OneSignalChatService(
            IConfiguration configuration,
            ILogger<OneSignalChatService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient();
        }

        public async Task SendChatNotificationAsync(
            string recipientUserId,
            string senderName,
            string messageContent,
            string chatRoomId,
            string senderAvatar = null)
        {
            try
            {
                var appId = _configuration["OneSignal:AppId"];
                var restApiKey = _configuration["OneSignal:RestApiKey"];

                if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(restApiKey))
                {
                    _logger.LogWarning("OneSignal configuration is missing");
                    return;
                }

                // Truncate message content if too long
                var truncatedMessage = messageContent.Length > 100 
                    ? messageContent.Substring(0, 97) + "..." 
                    : messageContent;

                // Check if message is image
                var displayMessage = messageContent.StartsWith("http") && 
                                    (messageContent.Contains("firebasestorage") || messageContent.Contains("image"))
                    ? "📷 Đã gửi một hình ảnh"
                    : truncatedMessage;

                var notification = new
                {
                    app_id = appId,
                    include_external_user_ids = new[] { recipientUserId },
                    headings = new { en = senderName },
                    contents = new { en = displayMessage },
                    data = new
                    {
                        type = "chat",
                        chatRoomId = chatRoomId,
                        senderId = recipientUserId,
                        senderName = senderName,
                        senderAvatar = senderAvatar ?? ""
                    },
                    android_channel_id = "chat_notifications",
                    priority = 10,
                    small_icon = "ic_stat_onesignal_default",
                    large_icon = senderAvatar
                };

                var json = JsonSerializer.Serialize(notification);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Basic {restApiKey}");

                var response = await _httpClient.PostAsync(
                    "https://onesignal.com/api/v1/notifications",
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation($"Chat notification sent successfully to user {recipientUserId}");
                    _logger.LogDebug($"OneSignal response: {responseBody}");
                }
                else
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Failed to send chat notification: {response.StatusCode} - {errorBody}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending chat notification to user {recipientUserId}");
            }
        }
    }
}
