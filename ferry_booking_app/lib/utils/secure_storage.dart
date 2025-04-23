import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Kunci penyimpanan
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _userDataKey = 'user_data';

  // Menyimpan token dengan dukungan web
  Future<void> saveToken(String token) async {
    try {
      // Simpan token
      await _storage.write(key: _tokenKey, value: token);

      // Simpan juga di SharedPreferences untuk web
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);

      print(
        'Token berhasil disimpan: ${token.substring(0, math.min(10, token.length))}...',
      );
    } catch (e) {
      print('Error saat menyimpan token: $e');

      // Pastikan masih tersimpan di SharedPreferences
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_tokenKey, token);
      } catch (e) {
        print('Gagal menyimpan token: $e');
      }
    }
  }

  // Mendapatkan token dengan dukungan web
  Future<String?> getToken() async {
    try {
      // Coba ambil dari secure storage
      String? token = await _storage.read(key: _tokenKey);

      // Jika tidak ada, coba ambil dari SharedPreferences
      if (token == null || token.isEmpty) {
        final prefs = await SharedPreferences.getInstance();
        token = prefs.getString(_tokenKey);

        if (token != null && token.isNotEmpty) {
          print(
            'Token ditemukan di SharedPreferences: ${token.substring(0, math.min(10, token.length))}...',
          );

          // Simpan kembali di SecureStorage untuk konsistensi
          try {
            await _storage.write(key: _tokenKey, value: token);
          } catch (e) {
            print('Gagal menyinkronkan token ke SecureStorage: $e');
          }
        }
      } else {
        print(
          'Token ditemukan di SecureStorage: ${token.substring(0, math.min(10, token.length))}...',
        );
      }

      return token;
    } catch (e) {
      print('Error saat mengambil token: $e');

      // Fallback ke SharedPreferences
      try {
        final prefs = await SharedPreferences.getInstance();
        return prefs.getString(_tokenKey);
      } catch (e) {
        print('Gagal mengambil token dari fallback: $e');
        return null;
      }
    }
  }

  // Menghapus token dengan logging yang baik
  Future<void> deleteToken() async {
    try {
      if (kIsWeb) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove(_tokenKey);
        print('Token removed from SharedPreferences');
      } else {
        await _storage.delete(key: _tokenKey);
        print('Token removed from SecureStorage');

        // Hapus juga dari SharedPreferences untuk jaga-jaga
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove(_tokenKey);
      }
    } catch (e) {
      print('Error deleting token: $e');
    }
  }

  // Metode lain tetap sama...
  Future<void> saveRefreshToken(String refreshToken) async {
    try {
      if (kIsWeb) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_refreshTokenKey, refreshToken);
      } else {
        await _storage.write(key: _refreshTokenKey, value: refreshToken);
      }
    } catch (e) {
      print('Error saving refresh token: $e');
    }
  }

  Future<String?> getRefreshToken() async {
    try {
      if (kIsWeb) {
        final prefs = await SharedPreferences.getInstance();
        return prefs.getString(_refreshTokenKey);
      } else {
        return await _storage.read(key: _refreshTokenKey);
      }
    } catch (e) {
      print('Error getting refresh token: $e');
      return null;
    }
  }

  // Metode lainnya dengan pola yang sama...

  // Menghapus semua data
  Future<void> clearAll() async {
    try {
      if (!kIsWeb) {
        await _storage.deleteAll();
        print('All data cleared from SecureStorage');
      }

      // Selalu hapus juga dari SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      print('All data cleared from SharedPreferences');
    } catch (e) {
      print('Error clearing all data: $e');
    }
  }

  // Cek apakah pengguna login dengan logging
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    final result = token != null && token.isNotEmpty;
    print(
      'isLoggedIn check result: $result (token: ${token?.substring(0, min(10, token.length))}...)',
    );
    return result;
  }

  // Helper function to get minimum of two integers
  int min(int a, int b) => a < b ? a : b;
}
