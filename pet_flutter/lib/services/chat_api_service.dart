import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../network/http_client.dart';

class ChatApiService {
  final http.Client _client = HttpClientFactory.create();

  Future<bool> sendChatNotification({
    required String recipientUserId,
    required String senderName,
    required String messageContent,
    required String chatRoomId,
    String? senderAvatar,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('${ApiConfig.baseUrl}/api/Chat/SendNotification'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'recipientUserId': recipientUserId,
          'senderName': senderName,
          'messageContent': messageContent,
          'chatRoomId': chatRoomId,
          'senderAvatar': senderAvatar ?? '',
        }),
      );

      if (response.statusCode == 200) {
        print('✅ Chat notification sent successfully');
        return true;
      } else {
        print('❌ Failed to send chat notification: ${response.statusCode}');
        print('Response: ${response.body}');
        return false;
      }
    } catch (e) {
      print('❌ Error sending chat notification: $e');
      return false;
    }
  }
}
