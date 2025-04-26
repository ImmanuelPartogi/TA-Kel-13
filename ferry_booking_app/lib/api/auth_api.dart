import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:ferry_booking_app/services/api_service.dart';
import 'package:ferry_booking_app/models/user.dart';
import 'package:ferry_booking_app/services/token_storage_service.dart';

class AuthApi {
  final ApiService _apiService = ApiService();
  final _storage = FlutterSecureStorage();
  final TokenStorageService _tokenStorage = TokenStorageService();

  // Login user
  Future<User> login(String email, String password, {String? deviceId}) async {
    try {
      final Map<String, dynamic> loginData = {
        'email': email,
        'password': password,
      };

      // Add device_id if provided
      if (deviceId != null && deviceId.isNotEmpty) {
        loginData['device_id'] = deviceId;
      }

      final response = await _apiService.post('auth/login', loginData);

      if (response['success']) {
        // Save token dengan TokenStorageService
        final token = response['data']['token'];
        await _tokenStorage.saveToken(token);
        print('Token saved in AuthApi.login: $token');

        // Save user info
        final user = User.fromJson(response['data']['user']);
        await _storage.write(key: 'user', value: jsonEncode(user.toJson()));

        print('Token saved and user stored: ${user.name}');
        return user;
      } else {
        throw Exception(response['message'] ?? 'Login gagal');
      }
    } catch (e) {
      print('Error in AuthApi.login: $e');
      rethrow;
    }
  }

  // Register user
  Future<User> register(
    String name,
    String email,
    String phone,
    String password,
  ) async {
    try {
      final response = await _apiService.post('auth/register', {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
      });

      if (response['success']) {
        // Save token dengan TokenStorageService
        final token = response['data']['token'];
        await _tokenStorage.saveToken(token);
        print('Token saved in AuthApi.register: $token');

        // Save user info
        final user = User.fromJson(response['data']['user']);
        await _storage.write(key: 'user', value: jsonEncode(user.toJson()));

        return user;
      } else {
        throw Exception(response['message'] ?? 'Registrasi gagal');
      }
    } catch (e) {
      print('Error in AuthApi.register: $e');
      rethrow;
    }
  }

  // Logout user
  Future<bool> logout() async {
    try {
      await _apiService.post('auth/logout', {});

      // Clear storage
      await _tokenStorage.clearToken();
      await _storage.delete(key: 'user');
      print('Token and user cleared in AuthApi.logout');

      return true;
    } catch (e) {
      // Still clear storage even if API call fails
      await _tokenStorage.clearToken();
      await _storage.delete(key: 'user');

      print('Error in AuthApi.logout but token cleared: $e');
      return false;
    }
  }

  // Get user profile
  Future<User> getProfile() async {
    try {
      final response = await _apiService.get('auth/profile');

      if (response['success']) {
        final user = User.fromJson(response['data']);
        await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
        return user;
      } else {
        throw Exception(response['message'] ?? 'Gagal mendapatkan profil');
      }
    } catch (e) {
      print('Error in AuthApi.getProfile: $e');
      rethrow;
    }
  }

  // Update user profile
  Future<User> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('auth/profile', data);

      if (response['success']) {
        final user = User.fromJson(response['data']);
        await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
        return user;
      } else {
        throw Exception(response['message'] ?? 'Gagal memperbarui profil');
      }
    } catch (e) {
      print('Error in AuthApi.updateProfile: $e');
      rethrow;
    }
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    try {
      final token = await _tokenStorage.getToken();
      print('Token in AuthApi.isLoggedIn: $token');

      if (token != null && token.isNotEmpty) {
        // Verify token validity by making a test request
        try {
          final response = await _apiService.get('auth/profile');
          return response['success'] == true;
        } catch (e) {
          print('Token validation failed: $e');
          return false;
        }
      }
      return false;
    } catch (e) {
      print('Error checking logged in state: $e');
      return false;
    }
  }

  // Get stored user data
  Future<User?> getStoredUser() async {
    try {
      final userString = await _storage.read(key: 'user');
      if (userString != null && userString.isNotEmpty) {
        return User.fromJson(jsonDecode(userString));
      }
      return null;
    } catch (e) {
      print('Error getting stored user: $e');
      return null;
    }
  }

  // Update password
  Future<bool> updatePassword(
    String currentPassword,
    String newPassword,
  ) async {
    try {
      final response = await _apiService.put('auth/password', {
        'current_password': currentPassword,
        'password': newPassword,
        'password_confirmation': newPassword,
      });

      return response['success'] == true;
    } catch (e) {
      print('Error updating password: $e');
      rethrow;
    }
  }

  // Forgot password
  Future<bool> forgotPassword(String email) async {
    try {
      final response = await _apiService.post('auth/forgot-password', {
        'email': email,
      });

      return response['success'] == true;
    } catch (e) {
      // Ekstrak pesan error yang lebih spesifik
      if (e is Exception) {
        String errorMessage = e.toString();

        // Jika error berisi informasi JSON, coba ekstrak pesan yang lebih baik
        if (errorMessage.contains('422')) {
          // Ini kemungkinan error validasi, beri pesan yang lebih jelas
          return Future.error('Email tidak terdaftar dalam sistem kami.');
        } else if (errorMessage.contains('500')) {
          return Future.error(
            'Terjadi kesalahan saat mengirim email. Silakan coba lagi nanti.',
          );
        }
      }
      print('Error in AuthApi.forgotPassword: $e');
      return Future.error('Gagal mengirim kode reset password: $e');
    }
  }

  // Reset password
  Future<bool> resetPassword(
    String email,
    String token,
    String password,
  ) async {
    try {
      final response = await _apiService.post('auth/reset-password', {
        'email': email,
        'token': token,
        'password': password,
        'password_confirmation': password,
      });

      return response['success'] == true;
    } catch (e) {
      print('Error in AuthApi.resetPassword: $e');
      rethrow;
    }
  }

  // Verifikasi password
  Future<bool> verifyPassword(String password) async {
    try {
      final response = await _apiService.post('auth/verify-password', {
        'password': password,
      });

      return response['success'] == true;
    } catch (e) {
      print('Error in AuthApi.verifyPassword: $e');
      rethrow;
    }
  }

  // Update email
  Future<User> updateEmail(String email, String password) async {
    try {
      final response = await _apiService.post('auth/update-email', {
        'email': email,
        'password': password,
      });

      if (response['success']) {
        // Update user info
        final user = User.fromJson(response['data']);
        await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
        return user;
      } else {
        throw Exception(response['message'] ?? 'Gagal memperbarui email');
      }
    } catch (e) {
      print('Error in AuthApi.updateEmail: $e');
      rethrow;
    }
  }
}
