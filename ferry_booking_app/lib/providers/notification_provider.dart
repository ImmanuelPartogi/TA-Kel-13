// lib/providers/notification_provider.dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/notification_api.dart';
import 'package:ferry_booking_app/models/notification.dart';

class NotificationProvider extends ChangeNotifier {
  final NotificationApi _notificationApi = NotificationApi();

  bool _isLoading = false;
  String? _errorMessage;
  List<UserNotification> _notifications = [];
  Timer? _refreshTimer;

  // Tambahkan flag untuk menandai provider sudah di-dispose
  bool _disposed = false;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<UserNotification> get notifications => _notifications;

  // Override notifyListeners untuk memeriksa flag _disposed
  @override
  void notifyListeners() {
    if (!_disposed) {
      super.notifyListeners();
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _disposed = true; // Set flag sebelum memanggil super.dispose()
    super.dispose();
  }

  void startAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      getNotifications();
    });
  }

  void stopAutoRefresh() {
    _refreshTimer?.cancel();
  }

  // Get all notifications
  Future<void> getNotifications() async {
    if (_isLoading) return;

    // Set loading tanpa notifyListeners
    _isLoading = true;

    try {
      final notifications = await _notificationApi.getNotifications();

      // Update state dan beri tahu listeners setelah operasi async selesai
      _notifications = notifications;
      _isLoading = false;
      _errorMessage = null;
      notifyListeners(); // Panggil sekali saja setelah semua perubahan state
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
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
            data: notification.data, // Tambahkan properti data yang hilang
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
        _notifications =
            _notifications =
                _notifications.map((notification) {
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
                    data:
                        notification
                            .data, // Tambahkan properti data yang hilang
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
