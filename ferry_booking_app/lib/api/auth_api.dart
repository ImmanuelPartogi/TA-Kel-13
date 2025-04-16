import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:ferry_booking_app/api/api_service.dart';
import 'package:ferry_booking_app/models/user.dart';

class AuthApi {
  final ApiService _apiService = ApiService();
  final _storage = FlutterSecureStorage();

  // Login user
  Future<User> login(String email, String password) async {
    final response = await _apiService.post('auth/login', {
      'email': email,
      'password': password,
    });

    if (response['success']) {
      // Save token
      await _storage.write(key: 'token', value: response['data']['token']);

      // Save user info
      final user = User.fromJson(response['data']['user']);
      await _storage.write(key: 'user', value: jsonEncode(user.toJson()));

      return user;
    } else {
      throw Exception(response['message']);
    }
  }

  // Register user
  Future<User> register(
    String name,
    String email,
    String phone,
    String password,
  ) async {
    final response = await _apiService.post('auth/register', {
      'name': name,
      'email': email,
      'phone': phone,
      'password': password,
    });

    if (response['success']) {
      // Save token
      await _storage.write(key: 'token', value: response['data']['token']);

      // Save user info
      final user = User.fromJson(response['data']['user']);
      await _storage.write(key: 'user', value: jsonEncode(user.toJson()));

      return user;
    } else {
      throw Exception(response['message']);
    }
  }

  // Logout user
  Future<bool> logout() async {
    try {
      await _apiService.post('auth/logout', {});

      // Clear storage
      await _storage.delete(key: 'token');
      await _storage.delete(key: 'user');

      return true;
    } catch (e) {
      // Still clear storage even if API call fails
      await _storage.delete(key: 'token');
      await _storage.delete(key: 'user');

      return false;
    }
  }

  // Get user profile
  Future<User> getProfile() async {
    final response = await _apiService.get('auth/profile');

    if (response['success']) {
      final user = User.fromJson(response['data']);
      await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
      return user;
    } else {
      throw Exception(response['message']);
    }
  }

  // Update user profile
  Future<User> updateProfile(Map<String, dynamic> data) async {
    final response = await _apiService.put('auth/profile', data);

    if (response['success']) {
      final user = User.fromJson(response['data']);
      await _storage.write(key: 'user', value: jsonEncode(user.toJson()));
      return user;
    } else {
      throw Exception(response['message']);
    }
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: 'token');
    return token != null;
  }

  // Get stored user data
  Future<User?> getStoredUser() async {
    final userString = await _storage.read(key: 'user');
    if (userString != null) {
      return User.fromJson(jsonDecode(userString));
    }
    return null;
  }

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

      if (response['success']) {
        return true;
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }
}
