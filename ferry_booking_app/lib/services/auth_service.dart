import 'dart:convert';
import 'package:ferry_booking_app/models/user.dart';
import '../services/api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  
  // Login user
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final data = {
        'email': email,
        'password': password,
      };
      
      final response = await _apiService.post('auth/login', data);
      
      if (response['success'] == true && 
          response['data'] != null && 
          response['data']['token'] != null) {
        
        // Explicitly save token to secure storage
        await _apiService.saveToken(response['data']['token']);
        
        // Return user data and token
        return {
          'user': User.fromJson(response['data']['user']),
          'token': response['data']['token'],
        };
      } else {
        throw Exception(response['message'] ?? 'Login failed');
      }
    } catch (e) {
      print('Login exception: $e');
      rethrow;
    }
  }
  
  // Register new user
  Future<User> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.post('auth/register', userData);
      
      if (response['success'] == true && response['data'] != null) {
        return User.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      print('Register exception: $e');
      rethrow;
    }
  }
  
  // Get current user profile
  Future<User> getCurrentUser() async {
    try {
      final response = await _apiService.get('auth/user');
      
      if (response['success'] == true && response['data'] != null) {
        return User.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to get user profile');
      }
    } catch (e) {
      print('Get current user exception: $e');
      rethrow;
    }
  }
  
  // Update user profile
  Future<User> updateProfile(Map<String, dynamic> userData) async {
    try {
      final response = await _apiService.put('auth/user', userData);
      
      if (response['success'] == true && response['data'] != null) {
        return User.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      print('Update profile exception: $e');
      rethrow;
    }
  }
  
  // Change password
  Future<bool> changePassword(String currentPassword, String newPassword) async {
    try {
      final data = {
        'current_password': currentPassword,
        'password': newPassword,
        'password_confirmation': newPassword,
      };
      
      final response = await _apiService.put('auth/password', data);
      
      return response['success'] == true;
    } catch (e) {
      print('Change password exception: $e');
      rethrow;
    }
  }
  
  // Logout user
  Future<bool> logout() async {
    try {
      final response = await _apiService.post('auth/logout', {});
      
      // Clear token regardless of response
      await _apiService.clearToken();
      
      return response['success'] == true;
    } catch (e) {
      // Ensure token is cleared even if API call fails
      await _apiService.clearToken();
      print('Logout exception: $e');
      rethrow;
    }
  }
  
  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    try {
      // Try to get user profile, if successful then user is logged in
      await getCurrentUser();
      return true;
    } catch (e) {
      // If an error occurs, user is probably not logged in
      return false;
    }
  }
}