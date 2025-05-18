import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/notification.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({Key? key}) : super(key: key);

  @override
  _NotificationScreenState createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  @override
  void initState() {
    super.initState();
    
    // Initialize animation controllers
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );
    
    // Delay start of animation slightly for better UX
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });
    
    // Gunakan Future.microtask untuk menunda pemanggilan
    // hingga build selesai
    Future.microtask(() => _loadNotifications());
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    await notificationProvider.getNotifications();
  }

  Future<void> _refreshNotifications() async {
    await _loadNotifications();
  }

  Future<void> _markAllAsRead() async {
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    await notificationProvider.markAllAsRead();
  }

  Widget _getNotificationIcon(String type, ThemeData theme) {
    IconData iconData;
    List<Color> gradientColors;
    Color iconColor = Colors.white;
    
    switch (type) {
      case 'BOOKING':
        iconData = Icons.confirmation_number_rounded;
        gradientColors = [
          Colors.blue.shade400,
          Colors.blue.shade700,
        ];
        break;
      case 'PAYMENT':
        iconData = Icons.payment_rounded;
        gradientColors = [
          Colors.green.shade400,
          Colors.green.shade700,
        ];
        break;
      case 'SCHEDULE_CHANGE':
        iconData = Icons.schedule_rounded;
        gradientColors = [
          Colors.orange.shade400,
          Colors.orange.shade700,
        ];
        break;
      case 'PROMO':
        iconData = Icons.local_offer_rounded;
        gradientColors = [
          Colors.purple.shade400,
          Colors.purple.shade700,
        ];
        break;
      case 'BOARDING':
        iconData = Icons.directions_boat_rounded;
        gradientColors = [
          Colors.orange.shade400,
          Colors.deepOrange.shade700,
        ];
        break;
      case 'ADMIN_BOARDING':
        iconData = Icons.admin_panel_settings_rounded;
        gradientColors = [
          Colors.indigo.shade400,
          Colors.indigo.shade700,
        ];
        break;
      default:
        iconData = Icons.notifications_rounded;
        gradientColors = [
          Colors.grey.shade400,
          Colors.grey.shade700,
        ];
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: gradientColors[1].withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
            spreadRadius: -2,
          ),
        ],
      ),
      child: Icon(
        iconData,
        color: iconColor,
        size: 20,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final notificationProvider = Provider.of<NotificationProvider>(context);
    final notifications = notificationProvider.notifications;
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Colors.white,
              Colors.blue.shade50,
              Colors.blue.shade100.withOpacity(0.4),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Background elements
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),
            Positioned(
              bottom: -80,
              left: -80,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),
            
            // Small boat icons in the background
            Positioned(
              top: size.height * 0.15,
              left: size.width * 0.1,
              child: Icon(
                Icons.sailing_outlined,
                size: 20,
                color: theme.primaryColor.withOpacity(0.2),
              ),
            ),
            Positioned(
              top: size.height * 0.3,
              right: size.width * 0.15,
              child: Icon(
                Icons.directions_boat_outlined,
                size: 25,
                color: theme.primaryColor.withOpacity(0.15),
              ),
            ),
            Positioned(
              bottom: size.height * 0.25,
              left: size.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 22,
                color: theme.primaryColor.withOpacity(0.1),
              ),
            ),
            
            // Main Content
            SafeArea(
              child: Column(
                children: [
                  // Custom App Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Back Button
                        Container(
                          width: 45,
                          height: 45,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            borderRadius: BorderRadius.circular(15),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(15),
                              onTap: () => Navigator.pop(context),
                              child: const Icon(
                                Icons.arrow_back_ios_new_rounded,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                        
                        // Title
                        Text(
                          'Notifikasi',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        
                        // Mark all as read button
                        if (notifications != null && notifications.isNotEmpty)
                          Container(
                            width: 45,
                            height: 45,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Material(
                              color: Colors.transparent,
                              borderRadius: BorderRadius.circular(15),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(15),
                                onTap: notifications != null && notifications.isNotEmpty 
                                  ? _markAllAsRead 
                                  : null,
                                child: Tooltip(
                                  message: 'Tandai semua sebagai dibaca',
                                  child: Icon(
                                    Icons.done_all_rounded,
                                    size: 20,
                                    color: notifications != null && notifications.isNotEmpty 
                                      ? theme.primaryColor 
                                      : Colors.grey.shade400,
                                  ),
                                ),
                              ),
                            ),
                          )
                        else
                          SizedBox(width: 45),
                      ],
                    ),
                  ),
                  
                  // Main content
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: _refreshNotifications,
                      color: theme.primaryColor,
                      child: FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
                          child: notificationProvider.isLoading
                            ? const Center(
                                child: CircularProgressIndicator(),
                              )
                            : notifications == null || notifications.isEmpty
                            ? _buildEmptyNotifications(theme)
                            : ListView.builder(
                                padding: const EdgeInsets.all(24.0),
                                itemCount: notifications.length,
                                itemBuilder: (context, index) {
                                  final notification = notifications[index];
                                  return _buildNotificationItem(notification, theme);
                                },
                              ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyNotifications(ThemeData theme) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Container(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: theme.primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.notifications_off_outlined,
                  size: 70,
                  color: theme.primaryColor,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Tidak Ada Notifikasi',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Anda belum memiliki notifikasi saat ini. Notifikasi akan muncul disini saat ada pembaruan terkait perjalanan Anda.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 30),
              TextButton.icon(
                onPressed: _refreshNotifications,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
                style: TextButton.styleFrom(
                  foregroundColor: theme.primaryColor,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationItem(UserNotification notification, ThemeData theme) {
    // Format datetime
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
    final createdAt = DateTime.parse(notification.createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
            spreadRadius: -5,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () {
            if (!notification.isRead) {
              final notificationProvider = Provider.of<NotificationProvider>(
                context,
                listen: false,
              );
              notificationProvider.markAsRead(notification.id);
            }

            // Handle notification action if any
            if (notification.data != null && notification.data!['action'] != null) {
              switch (notification.data!['action']) {
                case 'VIEW_BOOKING':
                  if (notification.data!['booking_code'] != null) {
                    // Navigate to booking detail
                  }
                  break;
              }
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _getNotificationIcon(notification.type, theme),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontWeight: !notification.isRead 
                                  ? FontWeight.bold 
                                  : FontWeight.w600,
                                fontSize: 16,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                          if (!notification.isRead)
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: theme.primaryColor,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: theme.primaryColor.withOpacity(0.3),
                                    blurRadius: 4,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        notification.message,
                        style: TextStyle(
                          color: Colors.grey[700],
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12, 
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.access_time_rounded,
                              size: 14,
                              color: Colors.grey[600],
                            ),
                            const SizedBox(width: 6),
                            Text(
                              dateFormat.format(createdAt),
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}