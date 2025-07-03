import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'token_storage_service.dart';

// Fungsi helper untuk menambahkan token ke header
class ApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final TokenStorageService _tokenStorage = TokenStorageService();
  // Map untuk menyimpan request aktif
  final Map<String, http.Client> _activeClients = {};

  // Fungsi untuk mencatat log dengan tingkat debug yang sesuai
  void _logDebug(String message) {
    if (AppConfig.debugMode) {
      print('[ApiService] $message');
    }
  }

  Future<Map<String, String>> _getHeaders() async {
    String? token = await _tokenStorage.getToken();

    // _logDebug(
    //   'Current token: ${token?.isNotEmpty == true ? "Available" : "Not available"}',
    // );

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
      // _logDebug('Added token to headers');
    }

    return headers;
  }

  // Fungsi untuk memformat URL dengan benar
  String _formatUrl(String endpoint) {
    // Hapus slash di awal endpoint jika ada
    String cleanEndpoint =
        endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // Hapus slash di akhir baseUrl jika ada
    String cleanBaseUrl =
        baseUrl.endsWith('/')
            ? baseUrl.substring(0, baseUrl.length - 1)
            : baseUrl;

    return '$cleanBaseUrl/$cleanEndpoint';
  }

  // Method untuk membatalkan request yang sedang berjalan
  void cancelRequest(String endpoint) {
    final client = _activeClients[endpoint];
    if (client != null) {
      client.close();
      _activeClients.remove(endpoint);
      // _logDebug('Request to $endpoint cancelled');
    }
  }

  // FUNGSI BARU: Helper untuk mendeteksi error pembatalan koneksi
  bool _isConnectionCancellationError(dynamic error) {
    final errorString = error.toString().toLowerCase();

    // Deteksi semua kemungkinan pesan error pembatalan koneksi
    return errorString.contains('connection closed') ||
        errorString.contains('connection terminated') ||
        errorString.contains('before full header was received') ||
        errorString.contains('connection reset by peer') ||
        errorString.contains('socket closed') ||
        errorString.contains('connection timed out') ||
        errorString.contains('operation cancelled');
  }

  bool _isTruncatedResponseError(dynamic error) {
    final errorString = error.toString().toLowerCase();

    return errorString.contains('unexpected end of input') ||
        errorString.contains('unterminated string') ||
        errorString.contains('format exception') ||
        errorString.contains('invalid json');
  }

  // Metode untuk memastikan koneksi dimatikan dengan benar
  void _safeCloseClient(http.Client client) {
    try {
      client.close();
    } catch (e) {
      // _logDebug('Error closing client: $e');
    }
  }

  // FUNGSI BARU: Helper untuk membuat respons standar untuk error pembatalan
  Map<String, dynamic> _createCancellationResponse(String endpoint) {
    // _logDebug('Request dibatalkan: $endpoint');
    return {
      'success': false,
      'message': 'Request dibatalkan',
      'data': [],
      'is_canceled': true,
    };
  }

  Future<dynamic> get(String endpoint, {bool cancelPrevious = false}) async {
    // PERUBAHAN KRITIS: JANGAN membatalkan request sebelumnya
    // Pembatalan request yang sedang berjalan bisa menyebabkan JSON terpotong
    // if (cancelPrevious) {
    //   cancelRequest(endpoint);
    // }

    final client = http.Client();
    _activeClients[endpoint] = client;

    try {
      final headers = await _getHeaders();
      final url = _formatUrl(endpoint);

      // _logDebug('GET Request to: $url');

      // PERBAIKAN: Tambahkan timeout yang lebih panjang
      final response = await client
          .get(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 30)); // Perpanjang dari 15 detik

      // _logDebug('Response status: ${response.statusCode}');

      // PERBAIKAN: Pastikan kita membersihkan client sebelum memproses respons
      _activeClients.remove(endpoint);

      // Tangani respons empty body lebih dulu
      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.body.isEmpty) {
          return {
            'success': false,
            'message': 'Tidak ada data dari server',
            'data': [],
          };
        }
      }

      return _processResponse(response, endpoint);
    } catch (e) {
      _activeClients.remove(endpoint);
      // _logDebug('GET exception: $e');

      if (e is TimeoutException) {
        return {
          'success': false,
          'message': 'Permintaan terlalu lama, silakan coba lagi',
          'data': [],
          'is_timeout': true,
        };
      }

      if (_isConnectionCancellationError(e)) {
        return _createCancellationResponse(endpoint);
      }

      // PERBAIKAN: Tangani FormatException secara khusus
      if (e.toString().contains('FormatException')) {
        return {
          'success': false,
          'message': 'Terjadi kesalahan format data, coba muat ulang',
          'data': [],
        };
      }

      throw Exception('Gagal memuat data: $e');
    }
  }

  // Metode POST yang dirombak
  Future<dynamic> post(
    String endpoint,
    dynamic data, {
    bool cancelPrevious = true,
  }) async {
    if (cancelPrevious) {
      cancelRequest(endpoint);
    }

    final client = http.Client();
    _activeClients[endpoint] = client;

    try {
      final headers = await _getHeaders();
      final encodedData = json.encode(data);
      final url = _formatUrl(endpoint);

      // _logDebug('POST Request to: $url');

      final response = await client.post(
        Uri.parse(url),
        headers: headers,
        body: encodedData,
      );

      // _logDebug('Response status: ${response.statusCode}');

      _activeClients.remove(endpoint);
      return _processResponse(response, endpoint);
    } catch (e) {
      _activeClients.remove(endpoint);
      // _logDebug('POST exception: $e');

      // Deteksi semua tipe error pembatalan koneksi
      if (_isConnectionCancellationError(e)) {
        return _createCancellationResponse(endpoint);
      }

      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception(
          'Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.',
        );
      }

      throw Exception('Gagal mengirim data: $e');
    }
  }

  // Metode PUT yang dirombak
  Future<dynamic> put(
    String endpoint,
    dynamic data, {
    bool cancelPrevious = true,
  }) async {
    if (cancelPrevious) {
      cancelRequest(endpoint);
    }

    final client = http.Client();
    _activeClients[endpoint] = client;

    try {
      final headers = await _getHeaders();
      final encodedData = json.encode(data);
      final url = _formatUrl(endpoint);

      // _logDebug('PUT Request to: $url');

      final response = await client.put(
        Uri.parse(url),
        headers: headers,
        body: encodedData,
      );

      // _logDebug('Response status: ${response.statusCode}');

      _activeClients.remove(endpoint);
      return _processResponse(response, endpoint);
    } catch (e) {
      _activeClients.remove(endpoint);
      // _logDebug('PUT exception: $e');

      // Deteksi semua tipe error pembatalan koneksi
      if (_isConnectionCancellationError(e)) {
        return _createCancellationResponse(endpoint);
      }

      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception(
          'Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.',
        );
      }

      throw Exception('Gagal memperbarui data: $e');
    }
  }

  // Metode DELETE yang dirombak
  Future<dynamic> delete(String endpoint, {bool cancelPrevious = true}) async {
    if (cancelPrevious) {
      cancelRequest(endpoint);
    }

    final client = http.Client();
    _activeClients[endpoint] = client;

    try {
      final headers = await _getHeaders();
      final url = _formatUrl(endpoint);

      // _logDebug('DELETE Request to: $url');

      final response = await client.delete(Uri.parse(url), headers: headers);

      // _logDebug('Response status: ${response.statusCode}');

      _activeClients.remove(endpoint);
      return _processResponse(response, endpoint);
    } catch (e) {
      _activeClients.remove(endpoint);
      // _logDebug('DELETE exception: $e');

      // Deteksi semua tipe error pembatalan koneksi
      if (_isConnectionCancellationError(e)) {
        return _createCancellationResponse(endpoint);
      }

      // Jika error berisi pesan 404, berikan pesan yang lebih jelas
      if (e.toString().contains('404')) {
        throw Exception(
          'Endpoint tidak ditemukan: $endpoint. Periksa URL atau koneksi Anda.',
        );
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

  // Fungsi ini tetap dipertahankan seperti semula
  String _fixInvalidJson(String json) {
    // Perbaiki masalah "nul" yang seharusnya "null"
    String fixed = json
        .replaceAll('"nul"', '"null"')
        .replaceAll(':nul,', ':null,')
        .replaceAll(':nul}', ':null}')
        .replaceAll(':nul]', ':null]');

    // _logDebug(
    //   'JSON fixed: original length ${json.length}, fixed length ${fixed.length}',
    // );
    return fixed;
  }

  // Fungsi ini tetap dipertahankan seperti semula
  String _fixTruncatedJson(String json) {
    // Hitung jumlah kurung buka dan tutup
    int openBraces = 0, closeBraces = 0;
    int openBrackets = 0, closeBrackets = 0;
    bool inString = false;
    bool hasEscapedChar = false;
    String lastKey = "";
    bool afterColon = false;
    String buffer = "";

    for (int i = 0; i < json.length; i++) {
      final char = json[i];

      // Deteksi karakter escape
      if (char == '\\' && !hasEscapedChar) {
        hasEscapedChar = true;
        continue;
      }

      // Deteksi string
      if (char == '"' && !hasEscapedChar) {
        inString = !inString;
        if (!inString && !afterColon) {
          lastKey = buffer;
          buffer = "";
        }
      }

      // Kumpulkan karakter dalam buffer saat dalam string
      if (inString) {
        buffer += char;
      }

      // Reset status escape karakter
      hasEscapedChar = false;

      // Deteksi titik dua setelah kunci
      if (char == ':' && !inString) {
        afterColon = true;
      }

      // Reset afterColon setelah nilai selesai
      if ((char == ',' || char == '}' || char == ']') && !inString) {
        afterColon = false;
      }

      // Hitung kurung hanya jika tidak dalam string
      if (!inString) {
        if (char == '{')
          openBraces++;
        else if (char == '}')
          closeBraces++;
        else if (char == '[')
          openBrackets++;
        else if (char == ']')
          closeBrackets++;
      }
    }

    // Perbaiki JSON yang terpotong
    String fixedJson = json;

    // 1. Jika JSON terpotong di tengah string, tutup string tersebut
    if (inString) {
      fixedJson += '"';
    }

    // 2. Jika JSON terpotong setelah titik dua dan sebelum nilai, tambahkan null
    if (afterColon) {
      fixedJson += 'null';
    }

    // 3. Deteksi pola JSON di akhir untuk menentukan struktur penutup yang tepat
    String lastChars =
        fixedJson.length > 50
            ? fixedJson.substring(fixedJson.length - 50)
            : fixedJson;

    // Deteksi pola umum
    bool endsWithObjectStart = lastChars.contains('{"');
    bool endsWithArrayStart = lastChars.contains('[{');
    bool endsWithObjectInArray = lastChars.contains('}]');
    bool endsWithArrayInObject = lastChars.contains(']}');
    bool endsWithComma = lastChars.trim().endsWith(',');

    // Hapus koma terakhir jika ada
    if (endsWithComma) {
      fixedJson = fixedJson.substring(0, fixedJson.lastIndexOf(','));
    }

    // 4. Tutup semua struktur JSON yang belum lengkap
    // Tutup kurung kurawal yang masih terbuka
    if (openBraces > closeBraces) {
      // Khusus jika kita dalam objek dalam array
      if (endsWithObjectInArray && openBrackets > closeBrackets) {
        while (openBraces > closeBraces) {
          fixedJson += '}';
          closeBraces++;
        }
        while (openBrackets > closeBrackets) {
          fixedJson += ']';
          closeBrackets++;
        }
      } else {
        // Tutup kurung kurawal biasa
        while (openBraces > closeBraces) {
          fixedJson += '}';
          closeBraces++;
        }
      }
    }

    // Tutup kurung siku yang masih terbuka
    if (openBrackets > closeBrackets) {
      while (openBrackets > closeBrackets) {
        fixedJson += ']';
        closeBrackets++;
      }
    }

    // 5. Verifikasi bahwa hasil perbaikan adalah JSON yang valid
    try {
      jsonDecode(fixedJson);
      // _logDebug('JSON fixed successfully and validated');
    } catch (e) {
      // _logDebug('JSON fix validation failed: $e');
      // _logDebug('Attempting alternative repair strategy');

      // Jika perbaikan masih tidak valid, coba pendekatan minimal
      fixedJson = _repairMinimalJson(json);
    }

    // _logDebug(
    //   'JSON fixed: ${fixedJson.substring(math.max(0, fixedJson.length - 50))}',
    // );
    return fixedJson;
  }

  // Fungsi ini tetap dipertahankan seperti semula
  String _repairMinimalJson(String json) {
    try {
      // Coba ekstrak data dari respons parsial
      RegExp dataPattern = RegExp(r'"data"\s*:\s*(\[.*?\])', dotAll: true);
      var match = dataPattern.firstMatch(json);

      if (match != null && match.groupCount >= 1) {
        String dataArrayStr = match.group(1)!;

        // Bungkus dalam objek JSON minimal yang valid
        return '{"success":true,"message":"Partial data extracted","data":$dataArrayStr,"is_partial_data":true}';
      } else {
        // Jika tidak ada data array, buat JSON minimal
        return '{"success":true,"message":"Unable to extract data","data":[],"is_partial_data":true}';
      }
    } catch (e) {
      _logDebug('Minimal repair failed: $e');
      return '{"success":false,"message":"Data format error","data":[],"is_partial_data":true}';
    }
  }

  // Fungsi ini tetap dipertahankan seperti semula
  String _sanitizeJson(String json) {
    // Pembersihan dasar
    String sanitized = json
        .replaceAll('\u0000', '') // Null bytes
        .replaceAll('\n', '\\n') // Pastikan newlines diformat dengan benar
        .replaceAll('\r', '\\r'); // Pastikan returns diformat dengan benar

    // TAMBAHKAN: Perbaiki escape karakter yang tidak valid
    sanitized = _fixInvalidEscapeSequences(sanitized);

    // [Kode yang sudah ada tetap di sini...]

    // Perbaiki tanda kutip ganda
    if (sanitized.contains('\"\"')) {
      sanitized = sanitized.replaceAll('\"\"', '\"'); // Double quotes berlebih
    }

    // Perbaiki escape characters
    sanitized = sanitized
        .replaceAll('\\\\\"', '\\\"') // Backslash ganda sebelum kutip
        .replaceAll('\\,', ',') // Backslash sebelum koma
        .replaceAll('\\:', ':') // Backslash sebelum titik dua
        .replaceAll('\\(', '(') // Backslash sebelum kurung buka
        .replaceAll('\\)', ')') // Backslash sebelum kurung tutup
        .replaceAll('\\[', '[') // Backslash sebelum bracket buka
        .replaceAll('\\]', ']') // Backslash sebelum bracket tutup
        .replaceAll('\\{', '{') // Backslash sebelum brace buka
        .replaceAll('\\}', '}'); // Backslash sebelum brace tutup

    // PERBAIKAN KHUSUS:
    // Perbaiki field yang tidak memiliki tanda kutip di bagian nilai
    sanitized = sanitized.replaceAll('"expiry_date:', '"expiry_date":"');

    // Perbaiki format field yang tidak memiliki tanda kutip penutup dengan pendekatan lebih umum
    RegExp keyValuePattern = RegExp(r'"([^"]+)":([^",{}\[\]]+)(?=[,}])');
    sanitized = sanitized.replaceAllMapped(keyValuePattern, (match) {
      String key = match.group(1)!;
      String value = match.group(2)!.trim();

      // Jika nilai bukan null, true, false, atau angka, tambahkan kutip
      if (value != 'null' &&
          value != 'true' &&
          value != 'false' &&
          !RegExp(r'^-?\d+(\.\d+)?$').hasMatch(value)) {
        return '"$key":"$value"';
      }

      return '"$key":$value';
    });

    // Perbaiki field yang tidak memiliki kutip penutup pada nama field
    RegExp missingColonQuote = RegExp(r'"([^":]+)([^":]+)"');
    sanitized = sanitized.replaceAllMapped(missingColonQuote, (match) {
      String fullMatch = match.group(0)!;
      if (fullMatch.contains(':')) {
        List<String> parts = fullMatch.split(':');
        if (parts.length == 2) {
          String key = parts[0].replaceAll('"', '');
          String value = parts[1].replaceAll('"', '');

          // Cek apakah nilai perlu dikutip
          if (value == 'null' ||
              value == 'true' ||
              value == 'false' ||
              RegExp(r'^-?\d+(\.\d+)?$').hasMatch(value)) {
            return '"$key":$value';
          } else {
            return '"$key":"$value"';
          }
        }
      }
      return fullMatch;
    });

    // Perbaikan tambahan untuk menangani berbagai jenis karakter
    sanitized = sanitized
        .replaceAll('\\\'', '\'') // Backslash sebelum kutip tunggal
        .replaceAll('\\"', '"') // Backslash sebelum kutip ganda
        .replaceAll('\\t', '\t'); // Backslash sebelum tab

    // Perbaikan terakhir: tanda kutip ganda dalam string
    sanitized = sanitized.replaceAll('\\"', '"');

    // PERBAIKAN KHUSUS untuk payload JSON
    RegExp payloadPattern = RegExp(r'"payload":"({.*?})"');
    sanitized = sanitized.replaceAllMapped(payloadPattern, (match) {
      String payloadJson = match.group(1)!;
      // Escape semua quote di dalam payload JSON
      String escapedPayload = payloadJson.replaceAll('"', '\\"');
      return '"payload":"' + escapedPayload + '"';
    });

    // Penanganan nested JSON objects dalam payload
    RegExp nestedJsonPattern = RegExp(r'"payload":"\\{(.*?)\\}"');
    sanitized = sanitized.replaceAllMapped(nestedJsonPattern, (match) {
      String payloadContent = match.group(1)!;
      // Pastikan semua quote di dalam konten payload sudah di-escape
      String properlyEscapedContent = payloadContent.replaceAll('"', '\\"');
      return '"payload":"\\{' + properlyEscapedContent + '\\}"';
    });

    return sanitized;
  }

  // TAMBAHKAN: Fungsi baru untuk memperbaiki escape karakter yang tidak valid
  String _fixInvalidEscapeSequences(String json) {
    // Temukan semua escape sequence yang tidak valid dan perbaiki
    // Pattern: Backslash diikuti karakter selain escape sequence yang valid
    String result = json;

    // Escape sequence yang valid dalam JSON: " \ / b f n r t u
    final validEscapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'];

    // Kumpulkan semua karakter yang mengikuti backslash
    RegExp escapePattern = RegExp(r'\\([^"\\/bfnrtu])');

    // Perbaiki escape karakter yang tidak valid dengan menambahkan backslash tambahan
    result = result.replaceAllMapped(escapePattern, (match) {
      final char = match.group(1);
      // Jika karakter setelah \ bukan escape sequence yang valid, tambahkan backslash
      return '\\\\$char';
    });

    // Perbaiki URL dengan escape backslash yang salah (kasus khusus)
    // Pola: https://something.com\/path\invalid-escape
    RegExp urlWithInvalidEscapePattern = RegExp(
      r'(https?:\/\/[^"]+)\\([^"\\/bfnrtu])',
    );
    result = result.replaceAllMapped(urlWithInvalidEscapePattern, (match) {
      final url = match.group(1);
      final char = match.group(2);
      return '$url\\\\$char';
    });

    return result;
  }

  Future<Map<String, dynamic>> _processResponse(
    http.Response response,
    String endpoint,
  ) async {
    try {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Validasi respons tidak kosong
        if (response.body.isEmpty) {
          // _logDebug('Response body kosong dari server');
          return _createFallbackResponse('Tidak ada data dari server');
        }

        String responseBody = response.body;
        Map<String, dynamic> jsonResponse;

        try {
          // Coba parse JSON langsung terlebih dahulu
          try {
            jsonResponse = jsonDecode(responseBody);
            // _logDebug('Berhasil parsing JSON secara langsung');
            return jsonResponse;
          } catch (e) {
            // _logDebug('Parsing JSON langsung gagal: $e, mencoba perbaikan');

            // Jika error adalah "Unexpected end of input", coba perbaiki JSON terpotong
            if (e.toString().contains('Unexpected end of input') ||
                _isTruncatedResponseError(e)) {
              // _logDebug('Terdeteksi JSON terpotong, mencoba perbaiki');
              String fixedJson = _fixTruncatedJson(responseBody);

              try {
                jsonResponse = jsonDecode(fixedJson);
                // _logDebug('Berhasil parsing JSON setelah perbaikan truncated');
                return jsonResponse;
              } catch (e2) {
                // _logDebug(
                //   'Parsing JSON setelah perbaikan truncated gagal: $e2',
                // );
              }
            }

            // Jika masih gagal, coba perbaikan umum
            // _logDebug('Mencoba perbaikan umum untuk JSON');
            String fixedJson = _sanitizeJson(_fixInvalidJson(responseBody));

            // try {
            //   jsonResponse = jsonDecode(fixedJson);
            //   _logDebug('Berhasil parsing JSON setelah perbaikan umum');
            //   return jsonResponse;
            // } catch (e3) {
            //   _logDebug('Parsing JSON setelah perbaikan umum gagal: $e3');
            // }

            // Jika semua upaya perbaikan gagal, coba ekstrak data parsial
            // _logDebug('Mencoba ekstrak data parsial dari JSON');
            return _extractPartialJson(responseBody);
          }
        } catch (e) {
          // _logDebug('Error umum dalam pemrosesan: $e');
          return _createFallbackResponse('Format data tidak valid');
        }
      } else if (response.statusCode == 401) {
        await clearToken();
        return _createFallbackResponse(
          'Sesi telah berakhir. Silakan login kembali.',
          isPartial: false,
        );
      } else {
        return _createFallbackResponse(
          'Terjadi kesalahan pada server (${response.statusCode})',
          isPartial: false,
        );
      }
    } catch (e) {
      // _logDebug('Error global dalam _processResponse: $e');
      return _createFallbackResponse('Terjadi kesalahan saat memproses data');
    }
  }

  // Helper method untuk membuat respons fallback yang konsisten
  Map<String, dynamic> _createFallbackResponse(
    String message, {
    bool isPartial = true,
  }) {
    return {
      'success': false,
      'message': message,
      'data': [],
      'is_partial_data': isPartial,
    };
  }

  // PERBAIKAN: Metode ekstraksi parsial yang lebih kuat
  Map<String, dynamic> _extractPartialJson(String responseBody) {
    // Respons default
    Map<String, dynamic> result = {
      'success': true,
      'message': 'Data parsial berhasil diambil',
      'data': [],
      'is_partial_data': true,
    };

    // Coba beberapa strategi untuk mengekstrak data yang valid
    try {
      // Strategi 1: Coba ekstrak objek root yang valid
      RegExp rootObjPattern = RegExp(r'^\s*(\{.*?\})\s*$', dotAll: true);
      var rootMatch = rootObjPattern.firstMatch(responseBody);

      if (rootMatch != null) {
        try {
          var rootObj = jsonDecode(rootMatch.group(1)!);
          if (rootObj is Map) {
            // _logDebug('Berhasil mengekstrak objek root');
            Map<String, dynamic> converted = Map<String, dynamic>.from(rootObj);
            converted['is_partial_data'] = false; // Ini data lengkap
            return converted;
          }
        } catch (e) {
          // _logDebug('Gagal parsing objek root: $e');
        }
      }

      // Strategi 2: Coba ekstrak array data
      RegExp dataPattern = RegExp(r'"data"\s*:\s*(\[.*?\])', dotAll: true);
      var match = dataPattern.firstMatch(responseBody);

      if (match != null && match.groupCount >= 1) {
        String dataArrayStr = match.group(1)!;

        // Coba parse array data
        try {
          var dataArray = jsonDecode('{"data":$dataArrayStr}');
          if (dataArray is Map && dataArray.containsKey('data')) {
            result['data'] = dataArray['data'];
            // _logDebug('Berhasil mengekstrak array data');
          }
        } catch (e) {
          // _logDebug('Gagal parsing array data: $e');

          // Strategi 3: Ekstrak objek individual dari array
          List<Map<String, dynamic>> items = [];
          RegExp objPattern = RegExp(r'\{[^{}]*\}');
          var matches = objPattern.allMatches(dataArrayStr);

          for (var m in matches) {
            try {
              var item = jsonDecode(m.group(0)!);
              if (item is Map) {
                items.add(Map<String, dynamic>.from(item));
              }
            } catch (e) {
              // Skip item yang gagal di-parse
            }
          }

          if (items.isNotEmpty) {
            result['data'] = items;
            // _logDebug('Berhasil mengekstrak ${items.length} objek individual');
          }
        }
      }

      // Strategi 4: Jika semua gagal, coba ekstrak objek apa pun yang valid
      if ((result['data'] as List).isEmpty) {
        RegExp anyObjPattern = RegExp(r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}');
        var objMatches = anyObjPattern.allMatches(responseBody);

        List<Map<String, dynamic>> validObjects = [];

        for (var m in objMatches) {
          try {
            var obj = jsonDecode(m.group(0)!);
            if (obj is Map) {
              validObjects.add(Map<String, dynamic>.from(obj));
            }
          } catch (e) {
            // Skip objek yang tidak valid
          }
        }

        if (validObjects.isNotEmpty) {
          // Ambil objek terbesar (kemungkinan ini adalah respons utama)
          validObjects.sort(
            (a, b) => b.toString().length.compareTo(a.toString().length),
          );

          // Jika objek terbesar memiliki kunci 'data', gunakan sebagai hasil
          if (validObjects[0].containsKey('data')) {
            result = Map<String, dynamic>.from(validObjects[0]);
            result['is_partial_data'] = true;
          } else {
            // Jika tidak, gunakan sebagai data itu sendiri
            result['data'] = validObjects;
          }

          // _logDebug('Berhasil mengekstrak ${validObjects.length} objek valid');
        }
      }
    } catch (e) {
      // _logDebug('Error ekstraksi data: $e');
    }

    return result;
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
      // _logDebug('Error formatting time string: $e');
      return timeStr; // Return original jika gagal
    }
  }
}
