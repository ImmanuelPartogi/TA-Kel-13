import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ferry_booking_app/api/auth_api.dart';
import 'package:ferry_booking_app/models/user.dart';
import 'package:ferry_booking_app/config/app_config.dart';

class AuthProvider extends ChangeNotifier {
  final AuthApi _authApi = AuthApi();

  bool _isLoading = false;
  bool _isLoggedIn = false;
  User? _user;
  String? _errorMessage;
  String? _token; // Menambahkan variabel _token yang hilang

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
      final isLoggedIn = await _authApi.isLoggedIn();
      _isLoggedIn = isLoggedIn;

      if (isLoggedIn) {
        _user = await _authApi.getProfile();
      }

      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _isLoggedIn = false;
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
        _token = data['data']['token'];
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
      _token = null; // Hapus token saat logout
      _isLoading = false;
      _errorMessage = null;
      notifyListeners();
      return result;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
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
