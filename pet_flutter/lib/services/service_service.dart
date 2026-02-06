import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:pet_flutter/config/api_config.dart';
import 'package:pet_flutter/network/http_client.dart';

class ServiceService {
  ServiceService({http.Client? client, String? baseUrl})
      : _client = client ?? HttpClientFactory.create(),
        _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  final http.Client _client;
  final String _baseUrl;

  Future<List<Map<String, dynamic>>> getServices() async {
    final uri = Uri.parse('$_baseUrl/api/Services');
    final response = await _client.get(uri);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body) as List<dynamic>;
      final servicesWithFullImageUrls = data.map<Map<String, dynamic>>((service) {
        final serviceMap = service as Map<String, dynamic>;
        if (serviceMap['photo'] != null && serviceMap['photo'] is String) {
          final photo = serviceMap['photo'] as String;
          // Thêm base URL nếu ảnh chưa có đầy đủ URL
          if (!photo.startsWith('http') && !photo.startsWith('data:')) {
            final photoPath = photo.startsWith('/') ? photo : '/$photo';
            serviceMap['photo'] = '$_baseUrl$photoPath';
          }
        }
        return serviceMap;
      }).toList();
      return servicesWithFullImageUrls;
    }
    throw Exception(_extractError(response.body));
  }

  Future<List<Map<String, dynamic>>> getFilteredServices({
    String? category,
    double? minPrice,
    double? maxPrice,
    int? duration,
    String sortBy = 'popular',
  }) async {
    final uri = Uri.parse('$_baseUrl/api/Services/filtered').replace(
      queryParameters: {
        if (category != null && category != 'all') 'category': category,
        if (minPrice != null) 'minPrice': minPrice.toString(),
        if (maxPrice != null) 'maxPrice': maxPrice.toString(),
        if (duration != null) 'duration': duration.toString(),
        'sortBy': sortBy,
      },
    );
    
    final response = await _client.get(uri);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body) as List<dynamic>;
      final servicesWithFullImageUrls = data.map<Map<String, dynamic>>((service) {
        final serviceMap = service as Map<String, dynamic>;
        if (serviceMap['photo'] != null && serviceMap['photo'] is String) {
          final photo = serviceMap['photo'] as String;
          // Thêm base URL nếu ảnh chưa có đầy đủ URL
          if (!photo.startsWith('http') && !photo.startsWith('data:')) {
            final photoPath = photo.startsWith('/') ? photo : '/$photo';
            serviceMap['photo'] = '$_baseUrl$photoPath';
          }
        }
        return serviceMap;
      }).toList();
      return servicesWithFullImageUrls;
    }
    throw Exception(_extractError(response.body));
  }

  Future<bool> incrementViewCount(int serviceId) async {
    final uri = Uri.parse('$_baseUrl/api/Services/$serviceId/view');
    final response = await _client.post(uri);
    return response.statusCode >= 200 && response.statusCode < 300;
  }

  Future<bool> incrementBookingCount(int serviceId) async {
    final uri = Uri.parse('$_baseUrl/api/Services/$serviceId/booking');
    final response = await _client.post(uri);
    return response.statusCode >= 200 && response.statusCode < 300;
  }

  String _extractError(String body) {
    try {
      final map = jsonDecode(body);
      if (map is Map && map['message'] is String) return map['message'] as String;
      return body;
    } catch (_) {
      return body;
    }
  }
}


