import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class OneSignalNotificationHelper {
  // REST API Key từ OneSignal Dashboard (phải giống với Backend)
  static const String _restApiKey = "os_v2_app_b5jnw3d2aba4zovz5e7ruj5fqjklfa6jk5se6jeveid2dvr2hre6dooqsbbhcp7bcpnnnywas37cut7nuyvjpjpxy4nlb4yroawtgya";
  static const String _appId = "0f52db6c-7a00-41cc-bab9-e93f1a27a582";

  /// Gửi notification đến tất cả users
  static Future<void> sendNotificationToAll({
    required String title,
    required String message,
    Map<String, dynamic>? data,
  }) async {
    try {
      final url = Uri.parse('https://onesignal.com/api/v1/notifications');
      
      final body = {
        'app_id': _appId,
        'included_segments': ['All'], // Gửi cho tất cả users
        'headings': {'en': title},
        'contents': {'en': message},
        if (data != null) 'data': data,
      };

      debugPrint('🔔 [OneSignal] Sending notification to all users...');
      debugPrint('   Title: $title');
      debugPrint('   Message: $message');
      debugPrint('   Data: $data');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic $_restApiKey',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        debugPrint('✅ [OneSignal] Notification sent successfully!');
        debugPrint('   Recipients: ${result['recipients']}');
      } else {
        debugPrint('❌ [OneSignal] Failed to send notification');
        debugPrint('   Status: ${response.statusCode}');
        debugPrint('   Response: ${response.body}');
      }
    } catch (e) {
      debugPrint('❌ [OneSignal] Error sending notification: $e');
    }
  }

  /// Gửi notification đến specific user (bằng External User ID)
  static Future<void> sendNotificationToUser({
    required String userId,
    required String title,
    required String message,
    Map<String, dynamic>? data,
  }) async {
    try {
      final url = Uri.parse('https://onesignal.com/api/v1/notifications');
      
      final body = {
        'app_id': _appId,
        'include_external_user_ids': [userId],
        'headings': {'en': title},
        'contents': {'en': message},
        if (data != null) 'data': data,
      };

      debugPrint('🔔 [OneSignal] Sending notification to user: $userId');
      debugPrint('   Title: $title');
      debugPrint('   Message: $message');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic $_restApiKey',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ [OneSignal] Notification sent successfully!');
      } else {
        debugPrint('❌ [OneSignal] Failed to send notification');
        debugPrint('   Status: ${response.statusCode}');
        debugPrint('   Response: ${response.body}');
      }
    } catch (e) {
      debugPrint('❌ [OneSignal] Error sending notification: $e');
    }
  }

  /// Gửi notification đến specific Player ID
  static Future<void> sendNotificationToPlayerId({
    required String playerId,
    required String title,
    required String message,
    Map<String, dynamic>? data,
  }) async {
    try {
      final url = Uri.parse('https://onesignal.com/api/v1/notifications');
      
      final body = {
        'app_id': _appId,
        'include_player_ids': [playerId],
        'headings': {'en': title},
        'contents': {'en': message},
        if (data != null) 'data': data,
      };

      debugPrint('🔔 [OneSignal] Sending notification to Player ID: $playerId');
      debugPrint('   Title: $title');
      debugPrint('   Message: $message');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic $_restApiKey',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        debugPrint('✅ [OneSignal] Notification sent successfully!');
      } else {
        debugPrint('❌ [OneSignal] Failed to send notification');
        debugPrint('   Status: ${response.statusCode}');
        debugPrint('   Response: ${response.body}');
      }
    } catch (e) {
      debugPrint('❌ [OneSignal] Error sending notification: $e');
    }
  }

  /// Gửi test notification (khi chỉnh sửa pet thành công)
  static Future<void> sendPetUpdateNotification({
    required String petName,
  }) async {
    await sendNotificationToAll(
      title: '🐾 Cập nhật thành công!',
      message: 'Thông tin của $petName đã được cập nhật',
      data: {
        'type': 'pet_update',
        'pet_name': petName,
      },
    );
  }
}
