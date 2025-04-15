import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/notification_api.dart';
import 'package:ferry_booking_app/models/notification.dart';

class NotificationProvider extends ChangeNotifier {
  final NotificationApi _notificationApi = NotificationApi();
  
  bool _isLoading = false;
  String? _errorMessage;
  List<UserNotification>? _notifications;
  
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<UserNotification>? get notifications => _notifications;
  
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
      notifyListeners();
    }
  }
  
  // Mark notification as read
  Future<void> markAsRead(int notificationId) async {
    try {
      await _notificationApi.markAsRead(notificationId);
      
      // Update notification in the list
      if (_notifications != null) {
        final index = _notifications!.indexWhere((n) => n.id == notificationId);
        if (index != -1) {
          final notification = _notifications![index];
          _notifications![index] = UserNotification(
            id: notification.id,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: true,
            priority: notification.priority,
            data: notification.data,
            sentVia: notification.sentVia,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
          );
          notifyListeners();
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Mark all notifications as read
  Future<void> markAllAsRead() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      await _notificationApi.markAllAsRead();
      
      // Update all notifications in the list
      if (_notifications != null) {
        _notifications = _notifications!.map((notification) => UserNotification(
          id: notification.id,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: true,
          priority: notification.priority,
          data: notification.data,
          sentVia: notification.sentVia,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
        )).toList();
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Get unread notification count
  int getUnreadCount() {
    if (_notifications == null) return 0;
    return _notifications!.where((n) => !n.isRead).length;
  }
  
  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}