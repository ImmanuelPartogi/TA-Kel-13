import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'token_storage_service.dart';

class ApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final TokenStorageService _tokenStorage = TokenStorageService();

  // Fungsi helper untuk menambahkan token ke header
  Future<Map<String, String>> _getHeaders() async {
    String? token = await _tokenStorage.getToken();
    
    // Debug log untuk token
    print('Current token in ApiService._getHeaders: $token');
    
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add token to headers if available
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
      print('Added token to headers: Bearer $token');
    } else {
      print('No token available for request');
    }
    
    return headers;
  }

  // GET request
  Future<dynamic> get(String endpoint) async {
    try {
      final headers = await _getHeaders();
      
      // Debug log untuk request
      print('GET Request to: $baseUrl/$endpoint');
      print('Headers: $headers');
      
      final response = await http.get(
        Uri.parse('$baseUrl/$endpoint'),
        headers: headers,
      );

      // Debug log untuk response
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      return _processResponse(response);
    } catch (e) {
      print('GET exception: $e');
      throw Exception('Failed to load data: $e');
    }
  }

  // POST request
  Future<dynamic> post(String endpoint, dynamic data) async {
    try {
      final headers = await _getHeaders();
      final encodedData = json.encode(data);
      
      // Debug log untuk request
      print('POST Request to: $baseUrl/$endpoint');
      print('Headers: $headers');
      print('Body: $encodedData');
      
      final response = await http.post(
        Uri.parse('$baseUrl/$endpoint'),
        headers: headers,
        body: encodedData,
      );

      // Debug log untuk response
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      return _processResponse(response);
    } catch (e) {
      print('POST exception: $e');
      throw Exception('Failed to post data: $e');
    }
  }

  // PUT request
  Future<dynamic> put(String endpoint, dynamic data) async {
    try {
      final headers = await _getHeaders();
      final encodedData = json.encode(data);
      
      // Debug log untuk request
      print('PUT Request to: $baseUrl/$endpoint');
      print('Headers: $headers');
      print('Body: $encodedData');
      
      final response = await http.put(
        Uri.parse('$baseUrl/$endpoint'),
        headers: headers,
        body: encodedData,
      );

      // Debug log untuk response
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      return _processResponse(response);
    } catch (e) {
      print('PUT exception: $e');
      throw Exception('Failed to update data: $e');
    }
  }

  // DELETE request
  Future<dynamic> delete(String endpoint) async {
    try {
      final headers = await _getHeaders();
      
      // Debug log untuk request
      print('DELETE Request to: $baseUrl/$endpoint');
      print('Headers: $headers');
      
      final response = await http.delete(
        Uri.parse('$baseUrl/$endpoint'),
        headers: headers,
      );

      // Debug log untuk response
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      return _processResponse(response);
    } catch (e) {
      print('DELETE exception: $e');
      throw Exception('Failed to delete data: $e');
    }
  }

  // Save token from login response
  Future<void> saveToken(String token) async {
    await _tokenStorage.saveToken(token);
    print('Token saved in ApiService: $token');
  }

  // Clear token on logout
  Future<void> clearToken() async {
    await _tokenStorage.clearToken();
    print('Token cleared in ApiService');
  }

  // Process HTTP response
  dynamic _processResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
      case 201:
        var responseJson = json.decode(response.body);
        
        // Jika ini adalah response login, otomatis simpan token
        if (responseJson['data'] != null && 
            responseJson['data']['token'] != null) {
          saveToken(responseJson['data']['token']);
          print('Token auto-saved from response: ${responseJson['data']['token']}');
        }
        
        return responseJson;
      case 400:
        throw Exception('Bad request: ${response.body}');
      case 401:
      case 403:
        // Hapus token saat autentikasi gagal
        print('Authentication error (${response.statusCode}): ${response.body}');
        clearToken();
        throw Exception('Unauthorized: ${response.body}');
      case 404:
        throw Exception('Not found: ${response.body}');
      case 500:
      default:
        throw Exception('Server error: ${response.body}');
    }
  }
}