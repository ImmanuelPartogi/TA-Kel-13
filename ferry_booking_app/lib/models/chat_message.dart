import 'package:intl/intl.dart';

class ChatMessage {
  final int id;
  final bool isFromUser;
  final String message;
  final DateTime createdAt;
  final String? messageStatus; // Menambahkan field status pesan

  ChatMessage({
    required this.id,
    required this.isFromUser,
    required this.message,
    required this.createdAt,
    this.messageStatus, // Status: 'pending', 'failed', 'delivered', 'offline', dll
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    try {
      // Coba parse dengan format ISO
      parsedDate = DateTime.parse(json['created_at']);
    } catch (e) {
      // Fallback ke format lain jika gagal
      try {
        final formatter = DateFormat('yyyy-MM-dd HH:mm:ss');
        parsedDate = formatter.parse(json['created_at']);
      } catch (e) {
        // Gunakan waktu saat ini jika tetap gagal
        parsedDate = DateTime.now();
      }
    }

    return ChatMessage(
      id: json['id'],
      isFromUser: json['is_from_user'] == 1 || json['is_from_user'] == true,
      message: json['message'],
      createdAt: parsedDate,
      messageStatus: json['status'], // Ambil status dari respons API jika ada
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'is_from_user': isFromUser ? 1 : 0,
      'message': message,
      'created_at': createdAt.toIso8601String(),
      'status': messageStatus,
    };
  }
}