import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ferry_booking_app/api/auth_api.dart';
import 'package:ferry_booking_app/models/user.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/services/token_storage_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthApi _authApi = AuthApi();
  final TokenStorageService _tokenStorage = TokenStorageService();

  bool _isLoading = false;
  bool _isLoggedIn = false;
  User? _user;
  String? _errorMessage;
  String? _token;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  String? get token => _token;

  // Check if user is already logged in
  Future<void> checkLoginStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Get token from storage
      final storedToken = await _tokenStorage.getToken();
      
      // If token exists, validate it by getting user profile
      if (storedToken != null && storedToken.isNotEmpty) {
        _token = storedToken; // Set token in memory
        final isLoggedIn = await _authApi.isLoggedIn();
        _isLoggedIn = isLoggedIn;

        if (isLoggedIn) {
          // If token is valid, get user profile
          _user = await _authApi.getProfile();
        } else {
          // If token is invalid, clear it
          await _tokenStorage.clearToken();
          _token = null;
        }
      } else {
        _isLoggedIn = false;
      }

      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      print('Error checking login status: $e');
      _isLoading = false;
      _isLoggedIn = false;
      _token = null;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Login user dengan device ID
  Future<bool> login(String email, String password, String deviceId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Ensure deviceId is always a valid string
      final String safeDeviceId = deviceId.trim();

      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'password': password,
          'device_id': safeDeviceId,
        }),
      );

      print('STATUS CODE: ${response.statusCode}');
      print('RESPONSE BODY: ${response.body}');

      final data = jsonDecode(response.body);

      if (data['errors'] != null) {
        print('VALIDATION ERRORS: ${data['errors']}');
      }

      if (response.statusCode == 200 && data['success']) {
        // Get token from response
        _token = data['data']['token'];
        
        // Save token using TokenStorageService
        await _tokenStorage.saveToken(_token!);
        
        // Print token after saving for debugging
        print('Token saved successfully: $_token');
        
        // Set user data and login state
        _user = User.fromJson(data['data']['user']);
        _isLoggedIn = true;
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return true;
      } else {
        _isLoading = false;
        _errorMessage = data['message'] ?? 'Login gagal';
        notifyListeners();
        return false;
      }
    } catch (e) {
      print('Login error: $e');
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Register user
  Future<bool> register(
    String name,
    String email,
    String phone,
    String password,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _user = await _authApi.register(name, email, phone, password);
      
      // Get token after registration
      _token = await _tokenStorage.getToken();
      _isLoggedIn = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _isLoggedIn = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Logout user
  Future<bool> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      final result = await _authApi.logout();
      _isLoggedIn = false;
      _user = null;
      _token = null;
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
      return result;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      
      // Still clear token and user data on error
      _isLoggedIn = false;
      _user = null;
      _token = null;
      
      notifyListeners();
      return false;
    }
  }

  // Update user profile
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _user = await _authApi.updateProfile(data);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Update password
  Future<bool> updatePassword(
    String currentPassword,
    String newPassword,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _authApi.updatePassword(
        currentPassword,
        newPassword,
      );
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}