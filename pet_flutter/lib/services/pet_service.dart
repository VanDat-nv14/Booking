import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:pet_flutter/config/api_config.dart';
import 'package:pet_flutter/network/http_client.dart';

class PetService {
  PetService({http.Client? client, String? baseUrl})
      : _client = client ?? HttpClientFactory.create(),
        _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  final http.Client _client;
  final String _baseUrl;

  Map<String, String> _authHeaders(String token) => {'Authorization': 'Bearer $token'};

  Future<List<Map<String, dynamic>>> getAllPets() async {
    final uri = Uri.parse('$_baseUrl/api/Pets');
    final res = await _client.get(uri);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final data = (jsonDecode(res.body) as List).cast<Map<String, dynamic>>();
      return _processedPetsWithFullImageUrls(data);
    }
    throw Exception(_extractError(res.body));
  }

  Future<List<Map<String, dynamic>>> getUserPets(String token) async {
    final uri = Uri.parse('$_baseUrl/api/Pets/User');
    final res = await _client.get(uri, headers: _authHeaders(token));
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final data = (jsonDecode(res.body) as List).cast<Map<String, dynamic>>();
      return _processedPetsWithFullImageUrls(data);
    }
    throw Exception(_extractError(res.body));
  }

  Future<Map<String, dynamic>> getPetById(int id) async {
    final uri = Uri.parse('$_baseUrl/api/Pets/$id');
    final res = await _client.get(uri);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return _processPetWithFullImageUrl(data);
    }
    throw Exception(_extractError(res.body));
  }

  Future<Map<String, dynamic>> updatePet({
    required int id,
    required String token,
    String? name,
    String? species,
    String? breed,
    String? gender,
    String? color,
    DateTime? birthDate,
    double? weight,
    String? description,
    File? photo,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/Pets/$id');
    final request = http.MultipartRequest('PUT', uri);
    request.headers.addAll(_authHeaders(token));
    if (name != null) request.fields['name'] = name;
    if (species != null) request.fields['species'] = species;
    if (breed != null) request.fields['breed'] = breed;
    if (gender != null) request.fields['gender'] = gender;
    if (color != null) request.fields['color'] = color;
    if (birthDate != null) request.fields['dateOfBirth'] = birthDate.toIso8601String();
    if (weight != null) request.fields['weight'] = weight.toString();
    if (description != null && description.isNotEmpty) request.fields['description'] = description;
    if (photo != null) {
      request.files.add(await http.MultipartFile.fromPath('photo', photo.path, contentType: MediaType('image', 'jpeg')));
    }
    final streamed = await request.send();
    final res = await http.Response.fromStream(streamed);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return _processPetWithFullImageUrl(data);
    }
    throw Exception(_extractError(res.body));
  }

  Future<void> deletePet({required int id, required String token}) async {
    final uri = Uri.parse('$_baseUrl/api/Pets/$id');
    final res = await _client.delete(uri, headers: _authHeaders(token));
    if (res.statusCode >= 200 && res.statusCode < 300) return;
    throw Exception(_extractError(res.body));
  }

  Future<Map<String, dynamic>> createPet({
    required String token,
    required String name,
    required String species,
    String? breed,
    String? gender,
    String? color,
    DateTime? birthDate,
    double? weight,
    String? description,
    File? photo,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/Pets');
    final request = http.MultipartRequest('POST', uri);
    request.headers.addAll(_authHeaders(token));
    request.fields['name'] = name;
    request.fields['species'] = species;
    if (breed != null) request.fields['breed'] = breed;
    if (gender != null) request.fields['gender'] = gender;
    if (color != null) request.fields['color'] = color;
    if (birthDate != null) request.fields['dateOfBirth'] = birthDate.toIso8601String();
    if (weight != null) request.fields['weight'] = weight.toString();
    if (description != null && description.isNotEmpty) request.fields['description'] = description;
    if (photo != null) {
      request.files.add(await http.MultipartFile.fromPath('photo', photo.path, contentType: MediaType('image', 'jpeg')));
    }
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return _processPetWithFullImageUrl(data);
    }
    throw Exception(_extractError(response.body));
  }

  // Helper method để xử lý URL ảnh thú cưng
  Map<String, dynamic> _processPetWithFullImageUrl(Map<String, dynamic> pet) {
    if (pet['photo'] != null && pet['photo'] is String) {
      final photo = pet['photo'] as String;
      // Thêm base URL nếu ảnh chưa có đầy đủ URL
      if (!photo.startsWith('http') && !photo.startsWith('data:')) {
        final photoPath = photo.startsWith('/') ? photo : '/$photo';
        pet['photoUrl'] = '$_baseUrl$photoPath';
        // Giữ nguyên trường photo gốc và thêm photoUrl
      }
    }
    return pet;
  }

  // Helper method để xử lý danh sách thú cưng
  List<Map<String, dynamic>> _processedPetsWithFullImageUrls(List<Map<String, dynamic>> pets) {
    return pets.map((pet) => _processPetWithFullImageUrl(pet)).toList();
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


