import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:ferry_booking_app/api/notification_api.dart';
import 'package:ferry_booking_app/models/notification.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalNotificationService {
  static final LocalNotificationService _instance = LocalNotificationService._internal();
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  final NotificationApi _notificationApi = NotificationApi();
  
  Timer? _pollingTimer;
  List<int> _processedNotificationIds = [];
  int _lastCheckedId = 0;
  
  factory LocalNotificationService() {
    return _instance;
  }
  
  LocalNotificationService._internal();
  
  Future<void> init() async {
    // Inisialisasi local notifications
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );
    
    await flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        _selectNotification(response.payload);
      },
    );
    
    // Ambil ID notifikasi terakhir yang diproses dari SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    _lastCheckedId = prefs.getInt('last_checked_notification_id') ?? 0;
    
    // Start polling
    startPolling();
  }
  
  void startPolling() {
    // Polling setiap 1 menit
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(minutes: 1), (_) => _checkNewNotifications());
  }
  
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }
  
  Future<void> _checkNewNotifications() async {
    try {
      // Ambil semua notifikasi
      final notifications = await _notificationApi.getNotifications();
      
      // Filter notifikasi baru yang belum diproses dan urutkan dari yang terlama
      final newNotifications = notifications
          .where((notification) => 
              notification.id > _lastCheckedId && 
              !_processedNotificationIds.contains(notification.id))
          .toList()
        ..sort((a, b) => a.id.compareTo(b.id));
      
      if (newNotifications.isNotEmpty) {
        // Update last checked ID
        _lastCheckedId = newNotifications.last.id;
        
        // Simpan di SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt('last_checked_notification_id', _lastCheckedId);
        
        // Tampilkan notifikasi
        for (var notification in newNotifications) {
          await _showLocalNotification(notification);
          _processedNotificationIds.add(notification.id);
        }
        
        // Batasi ukuran list processed IDs agar tidak terlalu besar
        if (_processedNotificationIds.length > 100) {
          _processedNotificationIds = _processedNotificationIds.sublist(_processedNotificationIds.length - 100);
        }
      }
    } catch (e) {
      print('Error checking new notifications: $e');
    }
  }
  
  Future<void> _selectNotification(String? payload) async {
    if (payload != null) {
      // Tambahkan logika untuk navigasi saat notifikasi di-tap
      print('Notification tapped with payload: $payload');
    }
  }
  
  Future<void> _showLocalNotification(UserNotification notification) async {
    final AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'ferry_notifications',
      'Ferry Notifications',
      channelDescription: 'Notifications for ferry bookings and schedules',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );
    
    final NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: const DarwinNotificationDetails(),
    );
    
    // Dapatkan data dari notifikasi jika ada
    String payload = '';
    if (notification.data != null && notification.data!['booking_code'] != null) {
      payload = notification.data!['booking_code'].toString();
    }
    
    await flutterLocalNotificationsPlugin.show(
      notification.id,
      notification.title,
      notification.message,
      platformChannelSpecifics,
      payload: payload,
    );
  }
  
  // Metode ini dapat dipanggil saat aplikasi dibuka untuk memeriksa notifikasi baru
  Future<void> checkNotificationsOnStartup() async {
    await _checkNewNotifications();
  }
}