import 'dart:convert';

class UserNotification {
  final int id;
  final int userId;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final String priority;
  final Map<String, dynamic>? data;
  final String? sentVia;
  final String createdAt;
  final String updatedAt;

  UserNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.priority,
    this.data,
    this.sentVia,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserNotification.fromJson(Map<String, dynamic> json) {
    return UserNotification(
      id: json['id'],
      userId: json['user_id'],
      title: json['title'],
      message: json['message'],
      type: json['type'],
      isRead: json['is_read'] == 1 || json['is_read'] == true,
      priority: json['priority'],
      data: json['data'] != null 
          ? json['data'] is String 
              ? jsonDecode(json['data']) 
              : json['data']
          : null,
      sentVia: json['sent_via'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}