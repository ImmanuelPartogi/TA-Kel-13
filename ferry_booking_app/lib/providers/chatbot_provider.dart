import 'package:flutter/material.dart';
import 'package:ferry_booking_app/models/chat_message.dart';
import 'package:ferry_booking_app/models/conversation.dart';
import 'package:ferry_booking_app/services/chatbot_service.dart';
import 'dart:async';
import 'dart:io' as io;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:ferry_booking_app/providers/auth_provider.dart';

class ChatbotProvider with ChangeNotifier {
  final ChatbotService _chatbotService = ChatbotService();
  bool _isLoading = false;
  bool _isSending = false;
  Conversation? _conversation;
  List<ChatMessage> _messages = [];
  bool _isTyping = false; // Status mengetik untuk efek visual
  Timer? _typingTimer;
  bool _isOffline = false;
  List<Map<String, dynamic>> _pendingMessages = [];
  List<Map<String, dynamic>> _suggestedQuestions = [];
  StreamSubscription? _connectivitySubscription;
  bool _isFirstLoad = true; // Flag untuk menandai load pertama kali

  // Getters
  bool get isLoading => _isLoading;
  bool get isSending => _isSending;
  bool get isTyping => _isTyping;
  bool get isOffline => _isOffline;
  Conversation? get conversation => _conversation;
  List<ChatMessage> get messages => _messages;
  List<Map<String, dynamic>> get suggestedQuestions => _suggestedQuestions;
  late AuthProvider _authProvider;
  int? _currentUserId;
  String? _deviceId;
  String? _token;

  ChatbotProvider(AuthProvider authProvider) {
    _authProvider = authProvider;
    _authProvider.addListener(_handleAuthChanges);
    _initConnectivity();
  }

  // Inisialisasi koneksi dengan penanganan khusus web vs mobile
  void _initConnectivity() {
    try {
      // Pantau koneksi internet
      _connectivitySubscription = Connectivity().onConnectivityChanged.listen(
        _updateConnectionStatus,
      );

      // Periksa status koneksi saat inisialisasi
      checkConnectivity();
    } catch (e) {
      // debugPrint('Error initializing connectivity: $e');
      // Asumsikan online jika ada error
      _isOffline = false;
    }
  }

  // Helper untuk menangani hasil connectivity berdasarkan platform
  void _updateConnectionStatus(dynamic result) {
    try {
      if (result is List<ConnectivityResult>) {
        // Untuk API terbaru yang mengembalikan List
        if (result.isEmpty) {
          _handleConnectivityChange(ConnectivityResult.none);
        } else {
          _handleConnectivityChange(result.first);
        }
      } else if (result is ConnectivityResult) {
        // Untuk API lama yang mengembalikan single result
        _handleConnectivityChange(result);
      }
    } catch (e) {
      // debugPrint('Error handling connectivity change: $e');
      // Asumsikan online jika ada error
      _isOffline = false;
      notifyListeners();
    }
  }

  // Method untuk menangani perubahan status autentikasi
  void _handleAuthChanges() {
    final newUserId = _authProvider.user?.id;

    // Periksa apakah user berubah
    if (_currentUserId != newUserId) {
      // Simpan user sebelumnya untuk menghapus data lokal nanti
      final previousUserId = _currentUserId;
      _currentUserId = newUserId;

      // Jika user baru login atau user berubah
      if (newUserId != null) {
        // Set token dari user baru
        setToken(_authProvider.token);

        // Hapus data percakapan lokal dari user sebelumnya jika ada
        if (previousUserId != null) {
          _clearLocalConversationData(previousUserId);
        }

        // Reset state dan muat percakapan baru
        _isFirstLoad = true;
        _messages = [];
        _conversation = null;
        loadConversation();
      } else if (previousUserId != null) {
        // Jika user logout
        _clearLocalConversationData(previousUserId);
        _token = null;
        _messages = [];
        _conversation = null;
        notifyListeners();
      }
    }
  }

  Future<String> getDeviceId() async {
    // Caching device ID untuk mengurangi panggilan ke service
    if (_deviceId != null) return _deviceId!;

    _deviceId = await _chatbotService.getDeviceId();
    return _deviceId!;
  }

  // Metode untuk menghapus data percakapan lokal
  Future<void> _clearLocalConversationData(int userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('conversation_id_$userId');
      await prefs.remove('conversation_messages_$userId');
      await prefs.remove('conversation_last_updated_$userId');
    } catch (e) {
      // debugPrint('Error clearing conversation data: $e');
    }
  }

  // Periksa koneksi internet
  Future<void> checkConnectivity() async {
    try {
      final result = await Connectivity().checkConnectivity();
      if (result is List<ConnectivityResult>) {
        // Untuk API terbaru
        if (result.isEmpty) {
          _handleConnectivityChange(ConnectivityResult.none);
        } else {
          _handleConnectivityChange(result.first);
        }
      } else {
        // Untuk API lama
        _handleConnectivityChange(result as ConnectivityResult);
      }
    } catch (e) {
      // debugPrint('Error checking connectivity: $e');
      // Asumsikan online jika ada error
      _isOffline = false;
      notifyListeners();
    }
  }

  // Tangani perubahan koneksi
  void _handleConnectivityChange(ConnectivityResult result) {
    final wasOffline = _isOffline;
    _isOffline = result == ConnectivityResult.none;

    // Jika baru online, coba kirim pesan yang tertunda
    if (wasOffline && !_isOffline && _pendingMessages.isNotEmpty) {
      _processPendingMessages();
    }

    notifyListeners();
  }

  // Proses pesan yang tertunda saat koneksi kembali
  Future<void> _processPendingMessages() async {
    if (_pendingMessages.isEmpty) return;

    final pendingMessages = List<Map<String, dynamic>>.from(_pendingMessages);
    _pendingMessages.clear();

    for (final pendingMessage in pendingMessages) {
      await sendMessage(pendingMessage['message'], retrying: true);
    }
  }

  // Set token jika pengguna login
  void setToken(String? token) {
    _token = token;
    _chatbotService.token = token;
  }

  // Simpan percakapan ke storage lokal
  Future<void> _saveConversationToLocal() async {
    if (_conversation == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();

      // Gunakan ID pengguna untuk kunci penyimpanan jika login, atau device ID jika tidak
      final storageKey =
          _authProvider.isLoggedIn && _authProvider.user != null
              ? 'user_${_authProvider.user!.id}'
              : 'device_${await getDeviceId()}';

      // Simpan ID percakapan dengan kunci unik per pengguna
      await prefs.setInt('conversation_id_$storageKey', _conversation!.id);

      // Simpan daftar pesan dengan kunci unik
      final messagesToSave =
          _messages.length > 50
              ? _messages.sublist(_messages.length - 50)
              : _messages;
      final messagesJson = messagesToSave.map((m) => m.toJson()).toList();
      await prefs.setString(
        'conversation_messages_$storageKey',
        jsonEncode(messagesJson),
      );

      // Simpan waktu terakhir update
      await prefs.setString(
        'conversation_last_updated_$storageKey',
        DateTime.now().toIso8601String(),
      );

      // debugPrint('Conversation saved to local storage with key: $storageKey');
    } catch (e) {
      // debugPrint('Error saving conversation to local: $e');
    }
  }

  // Muat percakapan dari storage lokal
  Future<bool> _loadConversationFromLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Gunakan ID pengguna untuk kunci penyimpanan jika login, atau device ID jika tidak
      final storageKey =
          _authProvider.isLoggedIn && _authProvider.user != null
              ? 'user_${_authProvider.user!.id}'
              : 'device_${await getDeviceId()}';

      // Cek apakah ada percakapan tersimpan untuk pengguna ini
      if (!prefs.containsKey('conversation_id_$storageKey')) return false;

      final conversationId = prefs.getInt('conversation_id_$storageKey');
      final messagesJson = prefs.getString('conversation_messages_$storageKey');

      if (conversationId == null || messagesJson == null) return false;

      // Parse pesan
      final List<dynamic> messagesData = jsonDecode(messagesJson);
      _messages =
          messagesData.map((json) => ChatMessage.fromJson(json)).toList();

      // Cek apakah pesan tidak kosong
      if (_messages.isEmpty) return false;

      // Buat objek conversation
      _conversation = Conversation(
        id: conversationId,
        userId: _authProvider.user?.id, // Set user ID jika login
        sessionId: await _chatbotService.getDeviceId(),
      );

      // debugPrint(
      //   'Conversation loaded from local storage with key: $storageKey',
      // );
      return true;
    } catch (e) {
      // debugPrint('Error loading conversation from local: $e');
      return false;
    }
  }

  // Muat percakapan
  Future<void> loadConversation() async {
    if (_isLoading) return;

    _isLoading = true;
    notifyListeners();

    try {
      // Coba muat dari lokal storage dulu jika bukan load pertama kali
      bool loadedFromLocal = false;
      if (!_isFirstLoad) {
        loadedFromLocal = await _loadConversationFromLocal();
      }

      // Jika gagal muat dari lokal atau ini adalah load pertama, muat dari server
      if (!loadedFromLocal) {
        // Set token jika user login
        if (_authProvider.isLoggedIn) {
          _chatbotService.token = _authProvider.token;
        }

        final data = await _chatbotService.getConversation();
        _conversation = data['conversation'];
        _messages = data['messages'];

        // Simpan ke lokal storage
        await _saveConversationToLocal();
      }

      // Tambahkan pesan sambutan hanya jika benar-benar belum ada pesan
      // dan ini adalah load pertama kali
      if (_messages.isEmpty && _isFirstLoad) {
        _messages.add(
          ChatMessage(
            id: 0,
            isFromUser: false,
            message:
                'Halo! Selamat datang di layanan chatbot Ferry Booking. Ada yang bisa saya bantu terkait layanan feri?',
            createdAt: DateTime.now(),
          ),
        );
      }

      _isFirstLoad = false;
    } catch (e) {
      // debugPrint('Error loading conversation: $e');
      // Tambahkan pesan error untuk pengguna
      _messages.add(
        ChatMessage(
          id: 0,
          isFromUser: false,
          message:
              'Maaf, terjadi kesalahan saat memuat percakapan. Silakan coba lagi nanti.',
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

  // Tambahkan pesan pengguna dengan status (untuk offline/pending)
  void _addUserMessageWithStatus(String message, String messageStatus) {
    final userMessage = ChatMessage(
      id: -1, // ID sementara negatif untuk pesan lokal
      isFromUser: true,
      message: message,
      createdAt: DateTime.now(),
      messageStatus: messageStatus,
    );

    _messages.add(userMessage);
    notifyListeners();
  }

  // Tampilkan efek mengetik dengan durasi yang realistis
  void _showTypingEffect(String responseText) {
    _isTyping = true;
    notifyListeners();

    // Hitung durasi berdasarkan panjang respons (simulasi waktu berpikir dan mengetik)
    final responseLength = responseText.length;

    // Rumus: 300ms base + 30ms per karakter, dengan maksimum 3 detik
    int typingDuration = 300 + (responseLength * 30);
    typingDuration = typingDuration.clamp(500, 3000); // Min 0.5s, Max 3s

    // Batalkan timer yang ada jika masih berjalan
    _typingTimer?.cancel();

    // Atur timer baru
    _typingTimer = Timer(Duration(milliseconds: typingDuration), () {
      _hideTypingEffect();
    });
  }

  // Sembunyikan efek mengetik
  void _hideTypingEffect() {
    _isTyping = false;
    notifyListeners();
  }

  // Kirim pesan
  Future<void> sendMessage(String message, {bool retrying = false}) async {
    if (message.trim().isEmpty) return;
    // debugPrint('Mengirim pesan: $message');

    // Kosongkan saran pertanyaan ketika pengguna mengirim pesan baru
    _suggestedQuestions = [];

    // Cek koneksi internet
    if (_isOffline && !retrying) {
      // Tambahkan pesan pengguna ke UI dengan indikator offline
      _addUserMessageWithStatus(message, 'pending');

      // Simpan pesan untuk dikirim nanti
      _pendingMessages.add({'message': message});

      // Tambahkan pesan notifikasi
      _messages.add(
        ChatMessage(
          id: -2,
          isFromUser: false,
          message:
              'Pesan Anda akan dikirim ketika koneksi internet tersedia kembali.',
          createdAt: DateTime.now(),
          messageStatus: 'offline',
        ),
      );

      notifyListeners();
      return;
    }

    // Upaya membuat percakapan jika belum ada
    if (_conversation == null) {
      try {
        final data = await _chatbotService.createNewConversation();
        _conversation = data['conversation'];
      } catch (e) {
        // debugPrint('Error creating new conversation: $e');
        _messages.add(
          ChatMessage(
            id: -1,
            isFromUser: false,
            message:
                'Maaf, gagal membuat percakapan baru. Coba refresh halaman.',
            createdAt: DateTime.now(),
          ),
        );
        notifyListeners();
        return;
      }
    }

    // Tambahkan pesan pengguna ke UI segera
    _addUserMessage(message);

    _isSending = true;
    notifyListeners();

    // Simulasi response sementara untuk typing indicator
    String tempResponsePreview =
        "Saya sedang mencari jawaban terbaik untuk Anda...";
    _showTypingEffect(tempResponsePreview);

    try {
      final result = await _chatbotService.sendMessage(
        _conversation!.id,
        message,
      );

      // Hapus pesan pengguna sementara dan tambahkan respon dari server
      _messages.removeLast();
      _messages.add(result['userMessage']!);

      // Tambahkan saran pertanyaan jika ada
      if (result.containsKey('suggestedQuestions')) {
        _suggestedQuestions = result['suggestedQuestions'] ?? [];
      }

      // Proses respons bot sebelum menampilkan
      final botMessage = result['botMessage']!;

      // Tambahkan respons bot
      _messages.add(botMessage);

      // Simpan percakapan ke storage lokal
      await _saveConversationToLocal();
    } catch (e) {
      // debugPrint('Error sending message: $e');

      // Tampilkan detail error ke log untuk debugging
      final errorMessage = e.toString();
      // debugPrint('Detail error: $errorMessage');

      // Hapus pesan pengguna sementara
      _messages.removeLast();

      // Tambahkan pesan pengguna kembali (sebagai gagal)
      _addUserMessageWithStatus(message, 'failed');

      // Tambahkan pesan error yang lebih informatif
      _messages.add(
        ChatMessage(
          id: -1,
          isFromUser: false,
          message:
              'Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.',
          createdAt: DateTime.now(),
        ),
      );
    } finally {
      _isSending = false;
      notifyListeners();
    }
  }

  // Kirim pesan menggunakan saran pertanyaan
  Future<void> sendSuggestedQuestion(String question) async {
    // Kosongkan daftar saran pertanyaan
    _suggestedQuestions = [];
    notifyListeners();

    // Kirim pertanyaan yang disarankan
    await sendMessage(question);
  }

  // Coba kirim ulang pesan yang gagal
  Future<void> resendMessage(String message) async {
    // Hapus pesan yang gagal dan pesan error
    for (int i = _messages.length - 1; i >= 0; i--) {
      if (_messages[i].messageStatus == 'failed' ||
          (!_messages[i].isFromUser && _messages[i].id < 0)) {
        _messages.removeAt(i);
      }
    }

    notifyListeners();

    // Kirim ulang pesan
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
      // debugPrint('Error sending feedback: $e');
      return false;
    }
  }

  // Hapus percakapan atau mulai ulang
  Future<void> clearConversation() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simpan ID conversation lama
      final oldConversationId = _conversation?.id;
      final userId = _authProvider.user?.id;

      // Buat percakapan baru melalui API
      final data = await _chatbotService.createNewConversation();
      _conversation = data['conversation'];

      // Hapus semua pesan lama
      _messages.clear();

      // Tambahkan pesan sambutan
      _messages.add(
        ChatMessage(
          id: 0,
          isFromUser: false,
          message: 'Halo! Ada yang bisa saya bantu terkait layanan feri?',
          createdAt: DateTime.now(),
        ),
      );

      // Reset saran pertanyaan
      _suggestedQuestions = [];

      // Hapus percakapan lama dari penyimpanan lokal jika user login
      if (userId != null) {
        await _clearLocalConversationData(userId);
      }

      // Simpan percakapan baru ke storage lokal
      await _saveConversationToLocal();
    } catch (e) {
      // debugPrint('Error clearing conversation: $e');
      _messages.add(
        ChatMessage(
          id: -1,
          isFromUser: false,
          message: 'Maaf, terjadi kesalahan saat memulai percakapan baru.',
          createdAt: DateTime.now(),
        ),
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _typingTimer?.cancel();
    _connectivitySubscription?.cancel();
    // Jangan lupa hapus listener untuk AuthProvider
    _authProvider.removeListener(_handleAuthChanges);
    super.dispose();
  }
}
