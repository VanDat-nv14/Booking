import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

class ApiConfig {
  // Allow override via --dart-define=API_BASE_URL=https://myhost:port
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;
    if (kIsWeb) return 'https://localhost:7164';
    // For real Android device: use computer IP address with HTTP (no SSL issues)
    if (Platform.isAndroid) return 'http://192.168.1.163:5181';
    return 'https://localhost:7164';
  }
}


