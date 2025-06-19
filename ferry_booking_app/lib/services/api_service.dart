import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'token_storage_service.dart';

// Fungsi helper untuk menambahkan token ke header
class ApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final TokenStorageService _tokenStorage = TokenStorageService();

  Future<Map<String, String>> _getHeaders() async {
    String? token = await _tokenStorage.getToken();

    print('Current token in ApiService._getHeaders: $token');

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

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

      // Perbaikan format URL: menghapus / berlebih
      String url;
      if (endpoint.startsWith('/')) {
        url = '$baseUrl${endpoint}'; // Jika endpoint sudah memiliki / di awal
      } else {
        url = '$baseUrl/$endpoint'; // Jika endpoint tidak memiliki / di awal
      }

      print('GET Request to: $url');
      print('Headers: $headers');

      final response = await http.get(Uri.parse(url), headers: headers);

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      try {
        return _processResponse(response);
      } catch (e) {
        print('Error processing response: $e');
        // Tangani error token dengan lebih spesifik
        if (e.toString().contains("token") &&
            e.toString().contains("String is not a subtype of type 'int'")) {
          // Parse response manual dan hilangkan token
          final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
          if (jsonResponse.containsKey('data') &&
              jsonResponse['data'] is List &&
              endpoint == 'routes') {
            return {
              'success': true,
              'message': 'Data berhasil diambil',
              'data': jsonResponse['data'],
            };
          }
        }
        throw Exception('Failed to load data: $e');
      }
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

  // Simpan token (sudah benar)
  Future<void> saveToken(String token) async {
    await _tokenStorage.saveToken(token);
  }

  // Ambil token (sudah benar)
  Future<String?> getToken() async {
    return await _tokenStorage.getToken();
  }

  // Hapus token (sudah benar)
  Future<void> clearToken() async {
    await _tokenStorage.clearToken();
  }

  // Perbaiki metode ini jika ada masalah di sini
  Future<Map<String, dynamic>> _processResponse(http.Response response) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);

        // Pastikan token selalu string jika ada
        if (jsonResponse.containsKey('data') && jsonResponse['data'] is Map) {
          var data = jsonResponse['data'];
          if (data.containsKey('token')) {
            // Pastikan token selalu string
            data['token'] = data['token'].toString();
          }
        }

        return jsonResponse;
      } catch (e) {
        print('Error processing response: $e');
        throw e;
      }
    } else {
      throw Exception('API request failed with status: ${response.statusCode}');
    }
  }
}