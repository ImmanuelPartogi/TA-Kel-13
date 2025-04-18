// lib/providers/notification_provider.dart
import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/notification_api.dart';
import 'package:ferry_booking_app/models/notification.dart';

class NotificationProvider extends ChangeNotifier {
  final NotificationApi _notificationApi = NotificationApi();
  
  bool _isLoading = false;
  String? _errorMessage;
  List<UserNotification> _notifications = [];
  
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<UserNotification> get notifications => _notifications;
  
  // Get all notifications
  Future<void> getNotifications() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _notifications = await _notificationApi.getNotifications();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      _notifications = [];
      notifyListeners();
    }
  }
  
  // Mark notification as read
  Future<bool> markAsRead(int notificationId) async {
    try {
      final success = await _notificationApi.markAsRead(notificationId);
      
      if (success) {
        // Update local notification
        final index = _notifications.indexWhere((n) => n.id == notificationId);
        if (index != -1) {
          final notification = _notifications[index];
          final updatedNotification = UserNotification(
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            userId: notification.userId,
            bookingId: notification.bookingId,
            isRead: true,
            createdAt: notification.createdAt,
            updatedAt: DateTime.now().toIso8601String(),
          );
          
          _notifications[index] = updatedNotification;
          notifyListeners();
        }
      }
      
      return success;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  // Mark all notifications as read
  Future<bool> markAllAsRead() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final success = await _notificationApi.markAllAsRead();
      
      if (success) {
        // Update all local notifications
        _notifications = _notifications.map((notification) {
          return UserNotification(
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            userId: notification.userId,
            bookingId: notification.bookingId,
            isRead: true,
            createdAt: notification.createdAt,
            updatedAt: DateTime.now().toIso8601String(),
          );
        }).toList();
      }
      
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}