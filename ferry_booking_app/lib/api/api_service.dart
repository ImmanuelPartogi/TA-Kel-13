import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class ApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final storage = FlutterSecureStorage();

  // Fungsi helper untuk menambahkan token ke header
  Future<Map<String, String>> _getHeaders() async {
    String? token = await storage.read(key: 'token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // GET request
  Future<dynamic> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$endpoint'),
        headers: await _getHeaders(),
      );

      return _processResponse(response);
    } catch (e) {
      throw Exception('Failed to load data: $e');
    }
  }

  // POST request
  Future<dynamic> post(String endpoint, dynamic data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$endpoint'),
        headers: await _getHeaders(),
        body: json.encode(data),
      );

      return _processResponse(response);
    } catch (e) {
      throw Exception('Failed to post data: $e');
    }
  }

  // PUT request
  Future<dynamic> put(String endpoint, dynamic data) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/$endpoint'),
        headers: await _getHeaders(),
        body: json.encode(data),
      );

      return _processResponse(response);
    } catch (e) {
      throw Exception('Failed to update data: $e');
    }
  }

  // DELETE request
  Future<dynamic> delete(String endpoint) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/$endpoint'),
        headers: await _getHeaders(),
      );

      return _processResponse(response);
    } catch (e) {
      throw Exception('Failed to delete data: $e');
    }
  }

  // Process HTTP response
  dynamic _processResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
      case 201:
        var responseJson = json.decode(response.body);
        return responseJson;
      case 400:
        throw Exception('Bad request: ${response.body}');
      case 401:
      case 403:
        throw Exception('Unauthorized: ${response.body}');
      case 404:
        throw Exception('Not found: ${response.body}');
      case 500:
      default:
        throw Exception('Server error: ${response.body}');
    }
  }
}