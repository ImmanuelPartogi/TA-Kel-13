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

  // Helper untuk mengatur status loading
  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  // Helper untuk mengatur pesan error
  void setError(String? message) {
    _errorMessage = message;
    notifyListeners();
  }

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
      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/register'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      // Penanganan error yang lebih baik
      if (response.statusCode == 422 && data['errors'] != null) {
        // Error validasi
        final errors = data['errors'];
        String errorMsg = '';
        errors.forEach((key, value) {
          errorMsg += '${value.join(', ')}\n';
        });
        _isLoading = false;
        _errorMessage = errorMsg.trim();
        notifyListeners();
        return false;
      } else if (response.statusCode == 201 && data['success']) {
        // Registrasi berhasil
        _token = data['token'];
        await _tokenStorage.saveToken(_token!);
        _user = User.fromJson(data['data']);
        _isLoggedIn = true;
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        // Error lainnya
        _isLoading = false;
        _errorMessage = data['message'] ?? 'Registrasi gagal';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Terjadi kesalahan: ${e.toString()}';
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

  // Forgot password
  Future<bool> forgotPassword(String email) async {
    setLoading(true);
    setError(null);

    try {
      final result = await _authApi.forgotPassword(email);
      setLoading(false);
      return result;
    } catch (e) {
      setLoading(false);
      // Gunakan pesan error yang sudah ditingkatkan dari AuthApi
      setError(e.toString());
      return false;
    }
  }

  // Reset password
  Future<bool> resetPassword(
    String email,
    String token,
    String password,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _authApi.resetPassword(email, token, password);
      _isLoading = false;
      if (!success) {
        _errorMessage = 'Gagal reset password';
      }
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Verifikasi password
  Future<bool> verifyPassword(String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _authApi.verifyPassword(password);
      _isLoading = false;
      if (!success) {
        _errorMessage = 'Password yang Anda masukkan salah';
      }
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Update email
  Future<bool> updateEmail(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _user = await _authApi.updateEmail(email, password);
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

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
