import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:pet_flutter/config/api_config.dart';
import 'package:pet_flutter/network/http_client.dart';

class UserService {
  UserService({http.Client? client, String? baseUrl})
      : _client = client ?? HttpClientFactory.create(),
        _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  final http.Client _client;
  final String _baseUrl;

  Map<String, String> _authHeaders(String token) => {
        'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> getUser({required int userId, required String token}) async {
    final uri = Uri.parse('$_baseUrl/api/Users/$userId');
    final response = await _client.get(uri, headers: _authHeaders(token));
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception(_extractError(response.body));
  }

  Future<Map<String, dynamic>> updateUser({
    required int userId,
    required String token,
    required String email,
    required String fullName,
    String? phone,
    String? address,
    String? role,
    String? avatar, // URL string for avatar
  }) async {
    // Use the new profile endpoint that doesn't require Role and Avatar
    final uri = Uri.parse('$_baseUrl/api/Users/$userId/profile');
    final request = http.MultipartRequest('PUT', uri);
    request.headers.addAll(_authHeaders(token));
    
    // Required fields
    request.fields['email'] = email;
    request.fields['fullName'] = fullName;
    
    // Optional fields - only send if not null/empty
    if (phone != null && phone.trim().isNotEmpty) {
      request.fields['phone'] = phone.trim();
    }
    if (address != null && address.trim().isNotEmpty) {
      request.fields['address'] = address.trim();
    }
    
    // Debug logging
    print('Sending fields to profile endpoint: ${request.fields}');
    print('Role value: $role (will be set to Customer by backend)');
    print('Avatar value: $avatar (ignored by profile endpoint)');

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception(_extractError(response.body));
  }

  Future<void> changePassword({
    required int userId,
    required String token,
    required String currentPassword,
    required String newPassword,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/Users/$userId/change-password');
    final response = await _client.post(
      uri,
      headers: {
        ..._authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return;
    }
    throw Exception(_extractError(response.body));
  }

  String _extractError(String body) {
    try {
      final map = jsonDecode(body);
      if (map is Map && map['message'] is String) {
        return map['message'] as String;
      }
      return body;
    } catch (_) {
      return body;
    }
  }
}


