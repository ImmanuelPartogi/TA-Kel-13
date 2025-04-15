import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/auth_api.dart';
import 'package:ferry_booking_app/models/user.dart';

class AuthProvider extends ChangeNotifier {
  final AuthApi _authApi = AuthApi();
  
  bool _isLoading = false;
  bool _isLoggedIn = false;
  User? _user;
  String? _errorMessage;
  
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  
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
  
  // Login user
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _user = await _authApi.login(email, password);
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
  
  // Register user
  Future<bool> register(String name, String email, String phone, String password) async {
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
  
  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}