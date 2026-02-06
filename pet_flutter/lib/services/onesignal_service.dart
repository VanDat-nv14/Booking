import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import '../main.dart'; // Import để dùng navigatorKey
import '../pages/chat_detail_page.dart';

class OneSignalService {
  static final OneSignalService _instance = OneSignalService._internal();
  factory OneSignalService() => _instance;
  OneSignalService._internal();

  // App ID từ OneSignal Dashboard
  static const String _appId = "0f52db6c-7a00-41cc-bab9-e93f1a27a582";

  /// Khởi tạo OneSignal
  Future<void> initialize() async {
    try {
      debugPrint("🔔 [OneSignal] Initializing...");

      // Enable verbose logging for debugging
      OneSignal.Debug.setLogLevel(OSLogLevel.verbose);

      // Initialize OneSignal with your App ID
      OneSignal.initialize(_appId);

      // Request notification permission
      await OneSignal.Notifications.requestPermission(true);

      // Setup notification handlers
      _setupNotificationHandlers();

      // Get and print Player ID for testing
      final playerId = await getPlayerId();
      debugPrint("🔔 [OneSignal] Initialization complete. Player ID: $playerId");
    } catch (e) {
      debugPrint("❌ [OneSignal] Initialization failed: $e");
    }
  }

  /// Lấy OneSignal Player ID (Subscription ID)
  Future<String?> getPlayerId() async {
    try {
      final playerId = OneSignal.User.pushSubscription.id;
      debugPrint("🔔 [OneSignal] Player ID: $playerId");
      return playerId;
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to get Player ID: $e");
      return null;
    }
  }

  /// Đặt External User ID (User ID từ backend)
  Future<void> setExternalUserId(String userId) async {
    try {
      await OneSignal.login(userId);
      debugPrint("🔔 [OneSignal] External User ID set: $userId");
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to set External User ID: $e");
    }
  }

  /// Xóa External User ID (khi logout)
  Future<void> removeExternalUserId() async {
    try {
      await OneSignal.logout();
      debugPrint("🔔 [OneSignal] External User ID removed");
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to remove External User ID: $e");
    }
  }

  /// Đặt tags cho user (để phân loại notifications)
  Future<void> setTags(Map<String, String> tags) async {
    try {
      OneSignal.User.addTags(tags);
      debugPrint("🔔 [OneSignal] Tags set: $tags");
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to set tags: $e");
    }
  }

  /// Xóa tags
  Future<void> deleteTags(List<String> keys) async {
    try {
      OneSignal.User.removeTags(keys);
      debugPrint("🔔 [OneSignal] Tags deleted: $keys");
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to delete tags: $e");
    }
  }

  /// Setup notification handlers
  void _setupNotificationHandlers() {
    // Notification received in foreground
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      debugPrint("🔔 [OneSignal] Notification received (foreground):");
      debugPrint("   Title: ${event.notification.title}");
      debugPrint("   Body: ${event.notification.body}");
      debugPrint("   Additional Data: ${event.notification.additionalData}");
      
      // Display the notification
      event.notification.display();
    });

    // Notification clicked
    OneSignal.Notifications.addClickListener((event) {
      debugPrint("🔔 [OneSignal] Notification clicked:");
      debugPrint("   Title: ${event.notification.title}");
      debugPrint("   Body: ${event.notification.body}");
      debugPrint("   Additional Data: ${event.notification.additionalData}");

      // Handle navigation based on notification data
      _handleNotificationClick(event.notification.additionalData);
    });

    // Permission state changed
    OneSignal.Notifications.addPermissionObserver((state) {
      debugPrint("🔔 [OneSignal] Permission state changed: $state");
    });

    // Subscription state changed
    OneSignal.User.pushSubscription.addObserver((state) {
      debugPrint("🔔 [OneSignal] Subscription state changed:");
      debugPrint("   ID: ${state.current.id}");
      debugPrint("   Token: ${state.current.token}");
      debugPrint("   Opted In: ${state.current.optedIn}");
    });
  }

  /// Xử lý khi user click vào notification
  void _handleNotificationClick(Map<String, dynamic>? additionalData) {
    if (additionalData == null) return;

    final String? type = additionalData['type'];

    debugPrint("🔔 [OneSignal] Handling notification click:");
    debugPrint("   Type: $type");
    debugPrint("   Data: $additionalData");

    // Handle chat notification
    if (type == 'chat') {
      final String? chatRoomId = additionalData['chatRoomId'];
      final String? senderId = additionalData['senderId'];
      final String? senderName = additionalData['senderName'];
      final String? senderAvatar = additionalData['senderAvatar'];

      if (chatRoomId != null && senderId != null && senderName != null) {
        // Parse chat room ID to get customerId and staffId
        final parts = chatRoomId.split('_');
        if (parts.length == 3) {
          final customerId = parts[1];
          final staffId = parts[2];

          // Navigate to ChatDetailPage
          navigatorKey.currentState?.push(
            MaterialPageRoute(
              builder: (context) => ChatDetailPage(
                chatRoomId: chatRoomId,
                currentUserId: staffId, // Người nhận là staff
                currentUserName: 'Staff', // Sẽ được load lại từ storage
                currentUserAvatar: '',
                otherUserId: customerId,
                otherUserName: senderName,
                otherUserAvatar: senderAvatar ?? '',
              ),
            ),
          );
        }
      }
    }
  }

  /// Kiểm tra trạng thái permission
  Future<bool> hasPermission() async {
    try {
      final permission = OneSignal.Notifications.permission;
      return permission;
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to check permission: $e");
      return false;
    }
  }

  /// Yêu cầu permission (nếu chưa có)
  Future<bool> requestPermission() async {
    try {
      final granted = await OneSignal.Notifications.requestPermission(true);
      debugPrint("🔔 [OneSignal] Permission ${granted ? 'granted' : 'denied'}");
      return granted;
    } catch (e) {
      debugPrint("❌ [OneSignal] Failed to request permission: $e");
      return false;
    }
  }

  /// Gửi notification local (test)
  /// Lưu ý: Cần gửi từ backend hoặc OneSignal Dashboard cho production
  void printPlayerIdForTesting() {
    final playerId = OneSignal.User.pushSubscription.id;
    debugPrint("══════════════════════════════════════════════════");
    debugPrint("🔔 ONESIGNAL PLAYER ID (for testing):");
    debugPrint("   $playerId");
    debugPrint("══════════════════════════════════════════════════");
    debugPrint("📱 Để test notification:");
    debugPrint("   1. Copy Player ID trên");
    debugPrint("   2. Vào OneSignal Dashboard > Audience > All Users");
    debugPrint("   3. Hoặc dùng API để gửi notification");
    debugPrint("══════════════════════════════════════════════════");
  }
}
