// lib/models/notification.dart
import 'dart:convert';

class UserNotification {
  final int id;
  final String title;
  final String message;
  final String type;
  final int? userId;
  final int? bookingId;
  final bool isRead;
  final String createdAt;
  final String updatedAt;
  final Map<String, dynamic>? data; // Tambahkan properti data

  UserNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.userId,
    this.bookingId,
    required this.isRead,
    required this.createdAt,
    required this.updatedAt,
    this.data, // Tambahkan properti data ke constructor
  });

  factory UserNotification.fromJson(Map<String, dynamic> json) {
    return UserNotification(
      id: json['id'],
      title: json['title'],
      message: json['message'],
      type: json['type'],
      userId: json['user_id'],
      bookingId: json['booking_id'],
      isRead: json['is_read'] == 1 || json['is_read'] == true,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      data: json['data'] != null 
            ? json['data'] is String 
                ? jsonDecode(json['data']) 
                : Map<String, dynamic>.from(json['data'])
            : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'user_id': userId,
      'booking_id': bookingId,
      'is_read': isRead,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'data': data,
    };
  }
}