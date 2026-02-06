import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/review.dart';
import 'secure_storage.dart';

class ReviewService {
  static String get _baseUrl => '${ApiConfig.baseUrl}/api/Reviews';

  // Lấy token từ secure storage
  Future<String?> _getAuthToken() async {
    final secureStorage = SecureStorageService();
    return await secureStorage.readToken();
  }

  // Tạo headers với authorization
  Future<Map<String, String>> _getHeaders() async {
    final token = await _getAuthToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Lấy tất cả reviews
  Future<List<Review>> getAllReviews() async {
    try {
      final response = await http.get(
        Uri.parse(_baseUrl),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting reviews: $e');
    }
  }

  // Lấy review theo ID
  Future<Review?> getReviewById(int reviewId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/$reviewId'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        return Review.fromJson(json.decode(response.body));
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Failed to load review: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting review: $e');
    }
  }

  // Lấy reviews theo user ID
  Future<List<Review>> getReviewsByUserId(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/User/$userId'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load user reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting user reviews: $e');
    }
  }

  // Lấy reviews theo service ID
  Future<List<Review>> getReviewsByServiceId(int serviceId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/Service/$serviceId'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load service reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting service reviews: $e');
    }
  }

  // Lấy reviews theo appointment ID
  Future<List<Review>> getReviewsByAppointmentId(int appointmentId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/Appointment/$appointmentId'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load appointment reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting appointment reviews: $e');
    }
  }

  // Lấy reviews theo product ID
  Future<List<Review>> getReviewsByProductId(int productId, {String sortBy = 'newest'}) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/Product/$productId?sortBy=$sortBy'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => Review.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load product reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting product reviews: $e');
    }
  }

  // Lấy rating trung bình của service
  Future<double> getServiceRating(int serviceId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/Service/$serviceId/Rating'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        return (json['averageRating'] ?? 0.0).toDouble();
      } else {
        throw Exception('Failed to load service rating: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting service rating: $e');
    }
  }

  // Lấy rating trung bình của product
  Future<double> getProductRating(int productId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/Product/$productId/Rating'),
        headers: await _getHeaders(),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        return (json['averageRating'] ?? 0.0).toDouble();
      } else {
        throw Exception('Failed to load product rating: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting product rating: $e');
    }
  }

  // Tạo review mới
  Future<Review> createReview(CreateReviewRequest request) async {
    try {
      print('Creating review with data: ${request.toJson()}');
      
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: await _getHeaders(),
        body: json.encode(request.toJson()),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 201) {
        if (response.body.isNotEmpty) {
          return Review.fromJson(json.decode(response.body));
        } else {
          throw Exception('Empty response body');
        }
      } else {
        String errorMessage = 'Failed to create review: ${response.statusCode}';
        
        if (response.body.isNotEmpty) {
          try {
            final errorBody = json.decode(response.body);
            errorMessage = errorBody['message'] ?? errorBody['title'] ?? errorMessage;
          } catch (e) {
            // If response body is not JSON, use the raw body
            errorMessage = 'Server error: ${response.body}';
          }
        }
        
        throw Exception(errorMessage);
      }
    } catch (e) {
      print('Error creating review: $e');
      throw Exception('Error creating review: $e');
    }
  }

  // Cập nhật review
  Future<Review> updateReview(int reviewId, UpdateReviewRequest request) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/$reviewId'),
        headers: await _getHeaders(),
        body: json.encode(request.toJson()),
      );

      if (response.statusCode == 200) {
        return Review.fromJson(json.decode(response.body));
      } else {
        final errorBody = json.decode(response.body);
        throw Exception('Failed to update review: ${errorBody['message'] ?? response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating review: $e');
    }
  }

  // Xóa review
  Future<bool> deleteReview(int reviewId) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/$reviewId'),
        headers: await _getHeaders(),
      );

      return response.statusCode == 204;
    } catch (e) {
      throw Exception('Error deleting review: $e');
    }
  }

  // Upload ảnh cho review
  Future<List<String>> uploadReviewImages(List<File> imageFiles) async {
    try {
      final token = await _getAuthToken();
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/upload-images'),
      );

      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      for (int i = 0; i < imageFiles.length; i++) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'files',
            imageFiles[i].path,
          ),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((url) => url.toString()).toList();
      } else {
        throw Exception('Failed to upload images: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error uploading images: $e');
    }
  }
}
