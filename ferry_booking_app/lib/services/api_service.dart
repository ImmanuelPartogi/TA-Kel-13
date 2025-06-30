import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'token_storage_service.dart';

// Fungsi helper untuk menambahkan token ke header
class ApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final TokenStorageService _tokenStorage = TokenStorageService();

  // Fungsi untuk mencatat log dengan tingkat debug yang sesuai
  void _logDebug(String message) {
    if (AppConfig.debugMode) {
      print('[ApiService] $message');
    }
  }

  Future<Map<String, String>> _getHeaders() async {
    String? token = await _tokenStorage.getToken();

    _logDebug('Current token: ${token?.isNotEmpty == true ? "Available" : "Not available"}');

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
      _logDebug('Added token to headers');
    }

    return headers;
  }

  // Fungsi untuk memformat URL dengan benar
  String _formatUrl(String endpoint) {
    // Hapus slash di awal endpoint jika ada
    String cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Hapus slash di akhir baseUrl jika ada
    String cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    
    return '$cleanBaseUrl/$cleanEndpoint';
  }

  // GET request dengan penanganan error yang lebih baik
  Future<dynamic> get(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final url = _formatUrl(endpoint);

      _logDebug('GET Request to: $url');

      final response = await http.get(Uri.parse(url), headers: headers);

      _logDebug('Response status: ${response.statusCode}');

      return _processResponse(response, endpoint);
    } catch (e) {
      _logDebug('GET exception: $e');
      
      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception('Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.');
      }
      
      throw Exception('Gagal memuat data: $e');
    }
  }

  // POST request dengan penanganan error yang lebih baik
  Future<dynamic> post(String endpoint, dynamic data) async {
    try {
      final headers = await _getHeaders();
      final encodedData = json.encode(data);
      final url = _formatUrl(endpoint);

      _logDebug('POST Request to: $url');

      final response = await http.post(
        Uri.parse(url),
        headers: headers,
        body: encodedData,
      );

      _logDebug('Response status: ${response.statusCode}');

      return _processResponse(response, endpoint);
    } catch (e) {
      _logDebug('POST exception: $e');
      
      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception('Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.');
      }
      
      throw Exception('Gagal mengirim data: $e');
    }
  }

  // PUT request dengan penanganan error yang lebih baik
  Future<dynamic> put(String endpoint, dynamic data) async {
    try {
      final headers = await _getHeaders();
      final encodedData = json.encode(data);
      final url = _formatUrl(endpoint);

      _logDebug('PUT Request to: $url');

      final response = await http.put(
        Uri.parse(url),
        headers: headers,
        body: encodedData,
      );

      _logDebug('Response status: ${response.statusCode}');

      return _processResponse(response, endpoint);
    } catch (e) {
      _logDebug('PUT exception: $e');
      
      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception('Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.');
      }
      
      throw Exception('Gagal memperbarui data: $e');
    }
  }

  // DELETE request dengan penanganan error yang lebih baik
  Future<dynamic> delete(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final url = _formatUrl(endpoint);

      _logDebug('DELETE Request to: $url');

      final response = await http.delete(
        Uri.parse(url),
        headers: headers,
      );

      _logDebug('Response status: ${response.statusCode}');

      return _processResponse(response, endpoint);
    } catch (e) {
      _logDebug('DELETE exception: $e');
      
      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception('Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.');
      }
      
      throw Exception('Gagal menghapus data: $e');
    }
  }

  // Simpan token
  Future<void> saveToken(String token) async {
    await _tokenStorage.saveToken(token);
  }

  // Ambil token
  Future<String?> getToken() async {
    return await _tokenStorage.getToken();
  }

  // Hapus token
  Future<void> clearToken() async {
    await _tokenStorage.clearToken();
  }

  // Metode untuk memproses response dengan penanganan error yang lebih baik
  Future<Map<String, dynamic>> _processResponse(http.Response response, String endpoint) async {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      try {
        // Validasi bahwa response.body tidak kosong
        if (response.body.isEmpty) {
          throw Exception('Response body kosong dari server');
        }

        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);

        // Normalisasi struktur respons
        _normalizeResponseStructure(jsonResponse);

        return jsonResponse;
      } catch (e) {
        _logDebug('Error processing response: $e');

        // Coba parse dan kembalikan pesan error yang lebih informatif
        if (response.body.isNotEmpty) {
          try {
            final errorData = jsonDecode(response.body);
            final errorMessage = errorData['message'] ?? 'Unknown error';
            throw Exception('API error: $errorMessage');
          } catch (_) {
            // Jika gagal parse error JSON, lempar error asli
            throw Exception(
              'Error memproses response: $e. Status: ${response.statusCode}',
            );
          }
        } else {
          throw Exception(
            'Error memproses response: $e. Status: ${response.statusCode}',
          );
        }
      }
    } else if (response.statusCode == 401) {
      try {
        final errorData = jsonDecode(response.body);

        // Cek apakah ini kesalahan validasi password saat update email
        if (errorData['message'] == 'Password yang dimasukkan salah') {
          throw Exception(
            errorData['message'],
          ); // Lempar error biasa tanpa clear token
        } else {
          // Ini adalah error autentikasi sesungguhnya
          await clearToken();
          throw Exception('Sesi telah berakhir. Silakan login kembali.');
        }
      } catch (e) {
        if (e is Exception &&
            e.toString().contains('Password yang dimasukkan salah')) {
          throw e; // Lempar error validasi tanpa clear token
        }
        // Untuk kasus lain, hapus token
        await clearToken();
        throw Exception('Sesi telah berakhir. Silakan login kembali.');
      }
    } else if (response.statusCode == 404) {
      // Penanganan khusus untuk error 404
      try {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Resource tidak ditemukan';
        throw Exception('API error (404): $errorMessage untuk endpoint "$endpoint"');
      } catch (_) {
        // Jika parsing gagal, berikan pesan error yang lebih spesifik
        throw Exception(
          'Endpoint "$endpoint" tidak ditemukan. Periksa URL atau koneksi Anda.',
        );
      }
    } else {
      try {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        throw Exception('API error (${response.statusCode}): $errorMessage');
      } catch (_) {
        throw Exception(
          'API request failed with status: ${response.statusCode}. Endpoint: $endpoint',
        );
      }
    }
  }

  // Fungsi helper untuk normalisasi struktur respons
  void _normalizeResponseStructure(Map<String, dynamic> jsonResponse) {
    // Pastikan token selalu string jika ada
    if (jsonResponse.containsKey('data')) {
      if (jsonResponse['data'] is Map) {
        var data = jsonResponse['data'];
        if (data.containsKey('token')) {
          // Pastikan token selalu string
          data['token'] = data['token'].toString();
        }

        // Normalisasi format tanggal jika ada
        _normalizeTimeFormats(data);
      } else if (jsonResponse['data'] is List) {
        // Untuk array data, normalisasi setiap item
        for (var item in jsonResponse['data']) {
          if (item is Map) {
            _normalizeTimeFormats(item);
          }
        }
      }
    }
  }

  // Fungsi helper untuk normalisasi format waktu
  void _normalizeTimeFormats(Map<dynamic, dynamic> data) {
    // Normalisasi waktu keberangkatan dan tanggal jika ada
    if (data.containsKey('departure_time') && data['departure_time'] != null) {
      // Pastikan format waktu konsisten (HH:MM:SS)
      final timeStr = data['departure_time'].toString();
      if (timeStr.length <= 5 && !timeStr.contains(':')) {
        // Format time yang salah, coba perbaiki
        data['departure_time'] = _formatTimeString(timeStr);
      }
    }

    // Lakukan hal yang sama untuk field waktu lainnya jika diperlukan
  }

  // Fungsi helper untuk format waktu
  String _formatTimeString(String timeStr) {
    // Coba format string waktu ke format HH:MM:SS
    try {
      if (timeStr.length == 4) {
        // HHMM format
        return '${timeStr.substring(0, 2)}:${timeStr.substring(2)}:00';
      } else if (timeStr.length <= 2) {
        // HH format
        return '$timeStr:00:00';
      }
      return '$timeStr:00'; // Tambahkan detik jika tidak ada
    } catch (e) {
      _logDebug('Error formatting time string: $e');
      return timeStr; // Return original jika gagal
    }
  }
}