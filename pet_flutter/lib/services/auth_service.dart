import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:pet_flutter/config/api_config.dart';
import 'package:pet_flutter/network/http_client.dart';

class AuthService {
  AuthService({http.Client? client, String? baseUrl})
      : _client = client ?? HttpClientFactory.create(),
        _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  final http.Client _client;
  final String _baseUrl;

  Future<Map<String, dynamic>> login({required String usernameOrEmail, required String password}) async {
    final uri = Uri.parse('$_baseUrl/api/Auth/login');
    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'usernameOrEmail': usernameOrEmail, 'password': password}),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception(_extractError(response.body));
  }

  Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String password,
    required String fullName,
    String? phone,
    String? address,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/Auth/register');
    final payload = {
      'username': username,
      'email': email,
      'password': password,
      'fullName': fullName,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      if (address != null && address.isNotEmpty) 'address': address,
    };
    final response = await _client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception(_extractError(response.body));
  }

  Future<Map<String, dynamic>> changePassword({
    required int userId,
    required String currentPassword,
    required String newPassword,
    required String token,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/Users/$userId/change-password');
    final response = await _client.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
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


