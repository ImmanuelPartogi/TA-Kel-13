import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

/// Layanan untuk menyimpan token yang bekerja di semua platform
/// Menggunakan SharedPreferences untuk web dan FlutterSecureStorage untuk platform lain
class TokenStorageService {
  static final TokenStorageService _instance = TokenStorageService._internal();
  factory TokenStorageService() => _instance;
  
  TokenStorageService._internal();

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  String? _cachedToken; // Cache token dalam memori
  
  final String _tokenKey = 'auth_token'; // Consistent key name for all platforms

  /// Menyimpan token
  Future<void> saveToken(String token) async {
    if (token.isEmpty) {
      print('Warning: Attempting to save empty token');
      return;
    }
    
    print('Saving token: $token');
    
    // Simpan token dalam cache memori
    _cachedToken = token;
    
    // Simpan token dalam penyimpanan persisten sesuai platform
    if (kIsWeb) {
      // Gunakan SharedPreferences untuk web
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      print('Token saved in SharedPreferences for web: $token');
    } else {
      // Gunakan FlutterSecureStorage untuk platform mobile
      await _secureStorage.write(key: _tokenKey, value: token);
      print('Token saved in SecureStorage for mobile: $token');
    }
  }

  /// Mengambil token dari penyimpanan
  Future<String?> getToken() async {
    // Jika token sudah ada di cache memori, gunakan itu
    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      // print('Returning cached token: $_cachedToken');
      return _cachedToken;
    }
    
    // Ambil token dari penyimpanan persisten sesuai platform
    String? token;
    
    if (kIsWeb) {
      // Gunakan SharedPreferences untuk web
      final prefs = await SharedPreferences.getInstance();
      token = prefs.getString(_tokenKey);
      print('Token retrieved from SharedPreferences for web: $token');
    } else {
      // Gunakan FlutterSecureStorage untuk platform mobile
      token = await _secureStorage.read(key: _tokenKey);
      print('Token retrieved from SecureStorage for mobile: $token');
    }
    
    // Simpan token di cache memori untuk pengambilan berikutnya
    if (token != null && token.isNotEmpty) {
      _cachedToken = token;
    }
    
    return token;
  }

  /// Menghapus token
  Future<void> clearToken() async {
    print('Clearing token');
    
    // Hapus token dari cache memori
    _cachedToken = null;
    
    // Hapus token dari penyimpanan persisten sesuai platform
    if (kIsWeb) {
      // Gunakan SharedPreferences untuk web
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      print('Token cleared from SharedPreferences for web');
    } else {
      // Gunakan FlutterSecureStorage untuk platform mobile
      await _secureStorage.delete(key: _tokenKey);
      print('Token cleared from SecureStorage for mobile');
    }
  }
}