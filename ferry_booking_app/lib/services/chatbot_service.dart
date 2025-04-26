import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io' as io;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/models/conversation.dart';
import 'package:ferry_booking_app/models/chat_message.dart';
import 'package:flutter/material.dart';

class ChatbotService {
  String? token;
  
  // Headers untuk API requests
  Map<String, String> get headers {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'App-Version': AppConfig.appVersion, // Tambahkan informasi versi aplikasi
    };
    
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }
  
  // Mendapatkan device ID untuk pengguna tidak login
  Future<String> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    String? deviceId = prefs.getString('device_id');
    
    if (deviceId == null) {
      // Generate device ID
      if (kIsWeb) {
        // Untuk web, gunakan timestamp sebagai device ID sederhana
        deviceId = DateTime.now().millisecondsSinceEpoch.toString();
      } else {
        // Untuk mobile, gunakan device_info_plus
        final deviceInfo = DeviceInfoPlugin();
        if (io.Platform.isAndroid) {
          final androidInfo = await deviceInfo.androidInfo;
          deviceId = androidInfo.id;
        } else if (io.Platform.isIOS) {
          final iosInfo = await deviceInfo.iosInfo;
          deviceId = iosInfo.identifierForVendor;
        } else {
          deviceId = DateTime.now().millisecondsSinceEpoch.toString();
        }
      }
      
      await prefs.setString('device_id', deviceId!);
    }
    
    return deviceId;
  }
  
  // Mendapatkan percakapan
  Future<Map<String, dynamic>> getConversation() async {
    final deviceId = await getDeviceId();
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/conversation');
    
    try {
      // Buat request body terlebih dahulu
      Map<String, dynamic> body = {
        'device_id': deviceId,
        'platform': kIsWeb ? 'web' : (io.Platform.isAndroid ? 'android' : io.Platform.isIOS ? 'ios' : 'other'),
      };
      
      // Tambahkan app_language jika bukan web (karena Platform._localeName tidak tersedia di web)
      if (!kIsWeb) {
        try {
          body['app_language'] = io.Platform.localeName.split('_')[0];
        } catch (e) {
          // Jika gagal mendapatkan localeName, gunakan default
          body['app_language'] = 'id';
        }
      }
      
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 10)); // Timeout untuk mencegah pemblokiran UI
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        
        if (data['success']) {
          final conversation = Conversation.fromJson(data['data']['conversation']);
          final List<ChatMessage> messages = (data['data']['messages'] as List)
            .map((json) => ChatMessage.fromJson(json))
            .toList();
            
          return {
            'conversation': conversation,
            'messages': messages,
          };
        } else {
          throw Exception(data['message'] ?? 'Gagal mendapatkan percakapan');
        }
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } on io.SocketException {
      throw Exception('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } on http.ClientException catch (e) {
      throw Exception('Kesalahan jaringan: ${e.message}');
    } on TimeoutException {
      throw Exception('Waktu permintaan habis. Server mungkin sedang sibuk.');
    } catch (e) {
      throw Exception('Terjadi kesalahan: $e');
    }
  }
  
  // Membuat percakapan baru
  Future<Map<String, dynamic>> createNewConversation() async {
    final deviceId = await getDeviceId();
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/new-conversation');
    
    try {
      // Buat request body terlebih dahulu
      Map<String, dynamic> body = {
        'device_id': deviceId,
        'platform': kIsWeb ? 'web' : (io.Platform.isAndroid ? 'android' : io.Platform.isIOS ? 'ios' : 'other'),
      };
      
      // Tambahkan app_language jika bukan web
      if (!kIsWeb) {
        try {
          body['app_language'] = io.Platform.localeName.split('_')[0];
        } catch (e) {
          body['app_language'] = 'id';
        }
      }
      
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        
        if (data['success']) {
          final conversation = Conversation.fromJson(data['data']['conversation']);
          return {
            'conversation': conversation,
            'messages': [],
          };
        } else {
          throw Exception(data['message'] ?? 'Gagal membuat percakapan baru');
        }
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan: $e');
    }
  }
  
  // Mengirim pesan
  Future<Map<String, dynamic>> sendMessage(int conversationId, String message) async {
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/send');
    
    try {
      // Catat waktu untuk menghitung latency
      final startTime = DateTime.now();
      
      // Siapkan request body dengan info platform
      Map<String, dynamic> body = {
        'conversation_id': conversationId,
        'message': message,
        'app_version': AppConfig.appVersion,
        'platform': kIsWeb ? 'web' : (io.Platform.isAndroid ? 'android' : io.Platform.isIOS ? 'ios' : 'other'),
      };
      
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15)); // Tambahkan waktu timeout yang lebih lama untuk pesan panjang
      
      // Catat latency
      final endTime = DateTime.now();
      final latency = endTime.difference(startTime).inMilliseconds;
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        
        if (data['success']) {
          final userMessage = ChatMessage.fromJson(data['data']['user_message']);
          final botMessage = ChatMessage.fromJson(data['data']['bot_message']);
          
          // Tambahkan informasi saran pertanyaan jika tersedia
          List<Map<String, dynamic>> suggestedQuestions = [];
          if (data['data'].containsKey('suggested_questions')) {
            suggestedQuestions = List<Map<String, dynamic>>.from(
              data['data']['suggested_questions'] ?? []
            );
          }
            
          return {
            'userMessage': userMessage,
            'botMessage': botMessage,
            'suggestedQuestions': suggestedQuestions,
            'latency': latency,
          };
        } else {
          throw Exception(data['message'] ?? 'Gagal mengirim pesan');
        }
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } on io.SocketException {
      throw Exception('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } on http.ClientException catch (e) {
      throw Exception('Kesalahan jaringan: ${e.message}');
    } on TimeoutException {
      throw Exception('Waktu permintaan habis. Server mungkin sedang sibuk.');
    } catch (e) {
      throw Exception('Terjadi kesalahan: $e');
    }
  }
  
  // Mengirim feedback
  Future<bool> sendFeedback(int messageId, bool isHelpful, {String? feedbackText}) async {
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/feedback');
    
    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'message_id': messageId,
          'is_helpful': isHelpful,
          'feedback_text': feedbackText,
          'app_version': AppConfig.appVersion,
          'platform': kIsWeb ? 'web' : (io.Platform.isAndroid ? 'android' : io.Platform.isIOS ? 'ios' : 'other'),
        }),
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        return data['success'] ?? false;
      } else {
        throw Exception('Gagal mengirim feedback: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error sending feedback: $e');
      return false;
    }
  }
  
  // Mendapatkan kategori chatbot
  Future<List<Map<String, dynamic>>> getChatCategories() async {
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/categories');
    
    try {
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        
        if (data['success']) {
          return List<Map<String, dynamic>>.from(data['data'] ?? []);
        } else {
          throw Exception(data['message'] ?? 'Gagal mendapatkan kategori');
        }
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan: $e');
    }
  }
  
  // Mendapatkan pertanyaan populer
  Future<List<Map<String, dynamic>>> getPopularQuestions() async {
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/popular-questions');
    
    try {
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        
        if (data['success']) {
          return List<Map<String, dynamic>>.from(data['data'] ?? []);
        } else {
          throw Exception(data['message'] ?? 'Gagal mendapatkan pertanyaan populer');
        }
      } else {
        throw Exception('Gagal terhubung ke server: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan: $e');
    }
  }
}

// Definisi TimeoutException karena kita tidak mengimpor package async
class TimeoutException implements Exception {
  final String message;
  TimeoutException(this.message);
  
  @override
  String toString() => message;
}