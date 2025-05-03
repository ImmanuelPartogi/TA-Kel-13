// lib/api/notification_api.dart
import 'dart:convert';

import 'package:ferry_booking_app/services/api_service.dart';
import 'package:ferry_booking_app/models/notification.dart';

class NotificationApi {
  final ApiService _apiService = ApiService();

  // Get all notifications
  // Get all notifications
 Future<List<UserNotification>> getNotifications() async {
  try {
    final response = await _apiService.get('notifications');
    
    if (response['success']) {
      // Akses array data di dalam objek paginasi
      final paginationData = response['data'];
      if (paginationData != null && paginationData['data'] != null) {
        final List<dynamic> notificationData = paginationData['data'];
        return notificationData
            .map((item) => UserNotification.fromJson(item))
            .toList();
      }
      return [];
    } else {
      throw Exception(response['message'] ?? 'Failed to get notifications');
    }
  } catch (e) {
    print('Error fetching notifications: $e');
    throw Exception('Failed to load notifications: $e');
  }
}

  // Get notification details
  Future<UserNotification> getNotificationDetails(int notificationId) async {
    final response = await _apiService.get('notifications/$notificationId');

    if (response['success']) {
      return UserNotification.fromJson(response['data']);
    } else {
      throw Exception(response['message']);
    }
  }

  // Mark notification as read
  Future<bool> markAsRead(int notificationId) async {
    final response = await _apiService.post(
      'notifications/$notificationId/read',
      {},
    );

    if (response['success']) {
      return true;
    } else {
      throw Exception(response['message']);
    }
  }

  // Mark all notifications as read
  Future<bool> markAllAsRead() async {
    final response = await _apiService.post('notifications/mark-all-read', {});

    if (response['success']) {
      return true;
    } else {
      throw Exception(response['message']);
    }
  }
}
