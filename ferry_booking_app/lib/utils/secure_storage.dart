import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Kunci penyimpanan
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _userDataKey = 'user_data';

  // Menyimpan token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // Mendapatkan token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Menyimpan refresh token
  Future<void> saveRefreshToken(String refreshToken) async {
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  // Mendapatkan refresh token
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  // Menyimpan user ID
  Future<void> saveUserId(String userId) async {
    await _storage.write(key: _userIdKey, value: userId);
  }

  // Mendapatkan user ID
  Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }

  // Menyimpan data user (dalam bentuk JSON string)
  Future<void> saveUserData(String userData) async {
    await _storage.write(key: _userDataKey, value: userData);
  }

  // Mendapatkan data user
  Future<String?> getUserData() async {
    return await _storage.read(key: _userDataKey);
  }

  // Menghapus semua data
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  // Menghapus token
  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  // Cek apakah pengguna login
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}