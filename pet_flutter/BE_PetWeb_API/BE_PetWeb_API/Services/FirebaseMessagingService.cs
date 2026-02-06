using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;

namespace BE_PetWeb_API.Services;

public interface IFirebaseMessagingService
{
    Task<bool> SendNotificationAsync(string fcmToken, string title, string body, Dictionary<string, string>? data = null);
    Task<bool> SendNotificationToMultipleDevicesAsync(List<string> fcmTokens, string title, string body, Dictionary<string, string>? data = null);
}

public class FirebaseMessagingService : IFirebaseMessagingService
{
    private readonly ILogger<FirebaseMessagingService> _logger;

    public FirebaseMessagingService(ILogger<FirebaseMessagingService> logger)
    {
        _logger = logger;
        InitializeFirebaseApp();
    }

    private void InitializeFirebaseApp()
    {
        if (FirebaseApp.DefaultInstance == null)
        {
            try
            {
                var credential = GoogleCredential.FromFile("firebase-adminsdk.json");
                FirebaseApp.Create(new AppOptions
                {
                    Credential = credential
                });
                _logger.LogInformation("Firebase Admin SDK initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Firebase Admin SDK");
            }
        }
    }

    public async Task<bool> SendNotificationAsync(
        string fcmToken,
        string title,
        string body,
        Dictionary<string, string>? data = null)
    {
        try
        {
            var message = new Message
            {
                Token = fcmToken,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data,
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "chat_messages"
                    }
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Sound = "default",
                        Badge = 1
                    }
                }
            };

            var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
            _logger.LogInformation($"FCM notification sent successfully. Message ID: {response}");
            return true;
        }
        catch (FirebaseMessagingException ex)
        {
            _logger.LogError(ex, $"Firebase Messaging error: {ex.MessagingErrorCode}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending FCM notification");
            return false;
        }
    }

    public async Task<bool> SendNotificationToMultipleDevicesAsync(
        List<string> fcmTokens,
        string title,
        string body,
        Dictionary<string, string>? data = null)
    {
        try
        {
            var message = new MulticastMessage
            {
                Tokens = fcmTokens,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data,
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "chat_messages"
                    }
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Sound = "default",
                        Badge = 1
                    }
                }
            };

            var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
            _logger.LogInformation($"FCM notification sent to {response.SuccessCount}/{fcmTokens.Count} devices");
            
            if (response.FailureCount > 0)
            {
                foreach (var error in response.Responses.Where(r => !r.IsSuccess))
                {
                    _logger.LogWarning($"Failed to send to token: {error.Exception?.Message}");
                }
            }

            return response.SuccessCount > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending FCM notification to multiple devices");
            return false;
        }
    }
}
