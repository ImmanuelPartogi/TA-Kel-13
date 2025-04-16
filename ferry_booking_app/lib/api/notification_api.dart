// lib/api/notification_api.dart
import 'package:ferry_booking_app/api/api_service.dart';
import 'package:ferry_booking_app/models/notification.dart';

class NotificationApi {
  final ApiService _apiService = ApiService();

  // Get all notifications
  Future<List<UserNotification>> getNotifications() async {
    final response = await _apiService.get('notifications');

    if (response['success']) {
      return (response['data'] as List)
          .map((json) => UserNotification.fromJson(json))
          .toList();
    } else {
      throw Exception(response['message']);
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
    final response = await _apiService.post('notifications/$notificationId/read', {});

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