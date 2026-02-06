import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'auth_user';

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> readToken() async {
    return _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<void> saveUser(String userJson) async {
    await _storage.write(key: _userKey, value: userJson);
  }

  Future<String?> readUser() async {
    return _storage.read(key: _userKey);
  }

  Future<String?> readUserId() async {
    final userJson = await readUser();
    if (userJson != null) {
      try {
        final user = json.decode(userJson);
        return user['userId']?.toString() ?? user['id']?.toString();
      } catch (e) {
        print('Error parsing user data for userId: $e');
      }
    }
    return null;
  }

  Future<String?> readUserName() async {
    final userJson = await readUser();
    if (userJson != null) {
      try {
        final user = json.decode(userJson);
        return user['fullName'] ?? user['name'] ?? user['userName'];
      } catch (e) {
        print('Error parsing user data for userName: $e');
      }
    }
    return null;
  }

  Future<String?> readUserRole() async {
    final userJson = await readUser();
    if (userJson != null) {
      try {
        final user = json.decode(userJson);
        return user['role'] ?? 'Customer';
      } catch (e) {
        print('Error parsing user data for role: $e');
      }
    }
    return 'Customer';
  }

  Future<String?> readStaffId() async {
    final userJson = await readUser();
    if (userJson != null) {
      try {
        final user = json.decode(userJson);
        // Ưu tiên staffId, nếu không có thì dùng userId
        return user['staffId']?.toString() ?? user['userId']?.toString();
      } catch (e) {
        print('Error parsing user data for staffId: $e');
      }
    }
    return null;
  }

  Future<void> clear() async {
    await _storage.deleteAll();
  }
}


