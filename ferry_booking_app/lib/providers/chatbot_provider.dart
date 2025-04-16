import 'package:flutter/material.dart';
import 'package:ferry_booking_app/models/chat_message.dart';
import 'package:ferry_booking_app/models/conversation.dart';
import 'package:ferry_booking_app/services/chatbot_service.dart';

class ChatbotProvider with ChangeNotifier {
  final ChatbotService _chatbotService = ChatbotService();
  bool _isLoading = false;
  bool _isSending = false;
  Conversation? _conversation;
  List<ChatMessage> _messages = [];

  // Getters
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  Conversation? get conversation => _conversation;
  List<ChatMessage> get messages => _messages;

  // Set token jika pengguna login
  void setToken(String? token) {
    _chatbotService.token = token;
  }

  // Muat percakapan
  Future<void> loadConversation() async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _chatbotService.getConversation();
      _conversation = data['conversation'];
      _messages = data['messages'];
      
      // Tambahkan pesan sambutan jika belum ada pesan
      if (_messages.isEmpty) {
        _messages.add(
          ChatMessage(
            id: 0,
            isFromUser: false,
            message: 'Halo! Ada yang bisa saya bantu terkait layanan feri?',
            createdAt: DateTime.now(),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error loading conversation: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Kirim pesan
  Future<void> sendMessage(String message) async {
    if (message.trim().isEmpty || _conversation == null) return;

    _isSending = true;
    notifyListeners();

    try {
      final result = await _chatbotService.sendMessage(
        _conversation!.id,
        message,
      );
      
      _messages.add(result['userMessage']!);
      _messages.add(result['botMessage']!);
    } catch (e) {
      debugPrint('Error sending message: $e');
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  // Kirim feedback
  Future<bool> sendFeedback(
    int messageId,
    bool isHelpful, {
    String? feedbackText,
  }) async {
    try {
      final result = await _chatbotService.sendFeedback(
        messageId,
        isHelpful,
        feedbackText: feedbackText,
      );
      return result;
    } catch (e) {
      debugPrint('Error sending feedback: $e');
      return false;
    }
  }
}