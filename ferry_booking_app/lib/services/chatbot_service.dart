import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/models/conversation.dart';
import 'package:ferry_booking_app/models/chat_message.dart';

class ChatbotService {
  String? token;
  
  // Headers untuk API requests
  Map<String, String> get headers {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
      final deviceInfo = DeviceInfoPlugin();
      if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        deviceId = androidInfo.id;
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        deviceId = iosInfo.identifierForVendor;
      } else {
        deviceId = DateTime.now().millisecondsSinceEpoch.toString();
      }
      
      await prefs.setString('device_id', deviceId!);
    }
    
    return deviceId;
  }
  
  // Mendapatkan percakapan
  Future<Map<String, dynamic>> getConversation() async {
    final deviceId = await getDeviceId();
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/conversation');
    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode({'device_id': deviceId}),
    );
    
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
  }
  
  // Mengirim pesan
  Future<Map<String, ChatMessage>> sendMessage(int conversationId, String message) async {
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/send');
    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode({
        'conversation_id': conversationId,
        'message': message,
      }),
    );
    
    if (response.statusCode == 200) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      
      if (data['success']) {
        final userMessage = ChatMessage.fromJson(data['data']['user_message']);
        final botMessage = ChatMessage.fromJson(data['data']['bot_message']);
          
        return {
          'userMessage': userMessage,
          'botMessage': botMessage,
        };
      } else {
        throw Exception(data['message'] ?? 'Gagal mengirim pesan');
      }
    } else {
      throw Exception('Gagal terhubung ke server: ${response.statusCode}');
    }
  }
  
  // Mengirim feedback
  Future<bool> sendFeedback(int messageId, bool isHelpful, {String? feedbackText}) async {
    final url = Uri.parse('${AppConfig.apiBaseUrl}/chatbot/feedback');
    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode({
        'message_id': messageId,
        'is_helpful': isHelpful,
        'feedback_text': feedbackText,
      }),
    );
    
    if (response.statusCode == 200) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      return data['success'] ?? false;
    } else {
      throw Exception('Gagal mengirim feedback: ${response.statusCode}');
    }
  }
}