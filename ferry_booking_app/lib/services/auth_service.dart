import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class User {
  final int id;
  final String name;
  final String email;
  final String phone;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
    );
  }
}

class AuthService {
  final String baseUrl =
      'http://127.0.0.1:8000/api'; // Ganti dengan URL server Anda
  String? _token;
  User? _user;

  String? get token => _token;
  User? get user => _user;

  // Headers dengan otentikasi
  Map<String, String> get headers {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }

    return headers;
  }

  // Cek apakah user sudah login
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      _token = token;

      // Ambil data user dari storage
      final userData = prefs.getString('user');
      if (userData != null) {
        _user = User.fromJson(jsonDecode(userData));
      }

      return true;
    }

    return false;
  }

  // Login
  Future<bool> login(String email, String password) async {
    // Ambil device ID untuk mengaitkan percakapan tamu
    final prefs = await SharedPreferences.getInstance();
    final deviceId = prefs.getString('device_id');

    final url = Uri.parse('$baseUrl/login');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'password': password,
        'device_id': deviceId,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data['success']) {
        _token = data['token'];
        _user = User.fromJson(data['data']);

        // Simpan token dan data user
        await prefs.setString('token', _token!);
        await prefs.setString('user', jsonEncode(data['data']));

        return true;
      } else {
        throw Exception(data['message'] ?? 'Login gagal');
      }
    } else {
      throw Exception('Gagal terhubung ke server: ${response.statusCode}');
    }
  }

  // Register
  Future<bool> register(
    String name,
    String email,
    String phone,
    String password,
    String passwordConfirmation,
  ) async {
    final url = Uri.parse('$baseUrl/register');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
        'password_confirmation': passwordConfirmation,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);

      if (data['success']) {
        _token = data['token'];
        _user = User.fromJson(data['data']);

        // Simpan token dan data user
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        await prefs.setString('user', jsonEncode(data['data']));

        return true;
      } else {
        throw Exception(data['message'] ?? 'Registrasi gagal');
      }
    } else {
      final data = jsonDecode(response.body);
      throw Exception(
        data['message'] ?? 'Gagal terhubung ke server: ${response.statusCode}',
      );
    }
  }

  // Logout
  Future<bool> logout() async {
    if (_token == null) {
      return false;
    }

    final url = Uri.parse('$baseUrl/logout');
    final response = await http.post(url, headers: headers);

    if (response.statusCode == 200) {
      _token = null;
      _user = null;

      // Hapus token dan data user
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('user');

      return true;
    } else {
      return false;
    }
  }

  // Ambil profile
  Future<User> getProfile() async {
    if (_token == null) {
      throw Exception('User tidak login');
    }

    final url = Uri.parse('$baseUrl/profile');
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      if (data['success']) {
        _user = User.fromJson(data['data']);

        // Update data user di storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(data['data']));

        return _user!;
      } else {
        throw Exception(data['message'] ?? 'Gagal mendapatkan profil');
      }
    } else {
      throw Exception('Gagal terhubung ke server: ${response.statusCode}');
    }
  }
}
