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
  bool _isTyping = false; // Status mengetik untuk efek visual
  
  // Getters
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  bool get isTyping => _isTyping;
  Conversation? get conversation => _conversation;
  List<ChatMessage> get messages => _messages;

  // Set token jika pengguna login
  void setToken(String? token) {
    _chatbotService.token = token;
  }

  // Muat percakapan
  Future<void> loadConversation() async {
    // Cek jika sedang loading, jangan lakukan operasi berulang
    if (_isLoading) return;

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
      // Tambahkan pesan error untuk pengguna
      _messages.add(
        ChatMessage(
          id: 0,
          isFromUser: false,
          message: 'Maaf, terjadi kesalahan saat memuat percakapan. Silakan coba lagi nanti.',
          createdAt: DateTime.now(),
        ),
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Tambahkan pesan pengguna ke daftar pesan
  void _addUserMessage(String message) {
    final userMessage = ChatMessage(
      id: 0, // ID sementara, akan diupdate setelah respon server
      isFromUser: true,
      message: message,
      createdAt: DateTime.now(),
    );
    
    _messages.add(userMessage);
    notifyListeners();
  }
  
  // Tampilkan efek mengetik
  void _showTypingEffect() {
    _isTyping = true;
    notifyListeners();
  }
  
  // Sembunyikan efek mengetik
  void _hideTypingEffect() {
    _isTyping = false;
    notifyListeners();
  }

  // Kirim pesan
  Future<void> sendMessage(String message) async {
    if (message.trim().isEmpty || _conversation == null) return;

    // Tambahkan pesan pengguna ke UI segera
    _addUserMessage(message);
    
    _isSending = true;
    // Tampilkan efek mengetik
    _showTypingEffect();
    notifyListeners();

    try {
      final result = await _chatbotService.sendMessage(
        _conversation!.id,
        message,
      );

      // Hapus pesan pengguna sementara dan tambahkan respon dari server
      _messages.removeLast();
      _messages.add(result['userMessage']!);
      _messages.add(result['botMessage']!);
    } catch (e) {
      debugPrint('Error sending message: $e');
      
      // Hapus pesan pengguna sementara
      _messages.removeLast();
      
      // Tambahkan pesan pengguna kembali (sebagai gagal)
      _messages.add(
        ChatMessage(
          id: -1,
          isFromUser: true,
          message: message,
          createdAt: DateTime.now(),
        ),
      );
      
      // Tambahkan pesan error
      _messages.add(
        ChatMessage(
          id: -1,
          isFromUser: false,
          message: 'Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.',
          createdAt: DateTime.now(),
        ),
      );
    } finally {
      _isSending = false;
      _hideTypingEffect();
      notifyListeners();
    }
  }

  // Coba kirim ulang pesan yang gagal
  Future<void> resendMessage(String message) async {
    await sendMessage(message);
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