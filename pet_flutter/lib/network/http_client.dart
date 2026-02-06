import 'dart:io';

import 'package:flutter/foundation.dart'; // dùng để sử dụng kIsWeb
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';

class HttpClientFactory {
  static http.Client create() {
    if (kIsWeb) return http.Client();
    final HttpClient ioHttpClient = HttpClient()
      ..badCertificateCallback = (cert, host, port) {
        // Allow dev self-signed cert for localhost/10.0.2.2/192.168.1.163
        return host == 'localhost' || host == '10.0.2.2' || host == '192.168.1.163';
      };
    return IOClient(ioHttpClient);
  }
}


