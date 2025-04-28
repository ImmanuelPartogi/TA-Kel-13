import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/notification.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({Key? key}) : super(key: key);

  @override
  _NotificationScreenState createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  @override
  void initState() {
    super.initState();
    _loadNotifications();
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

  Widget _getNotificationIcon(String type) {
    switch (type) {
      case 'BOOKING':
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.confirmation_number,
            color: Colors.blue[700],
            size: 24,
          ),
        );
      case 'PAYMENT':
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.green[50],
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.payment, color: Colors.green[700], size: 24),
        );
      case 'SCHEDULE_CHANGE':
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.orange[50],
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.schedule, color: Colors.orange[700], size: 24),
        );
      case 'PROMO':
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.purple[50],
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.local_offer, color: Colors.purple[700], size: 24),
        );
      case 'BOARDING':
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.orange[50],
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.directions_boat,
            color: Colors.orange[700],
            size: 24,
          ),
        );
      case 'ADMIN_BOARDING':
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.indigo[50],
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.admin_panel_settings,
            color: Colors.indigo[700],
            size: 24,
          ),
        );
      default:
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[200],
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.notifications, color: Colors.grey[700], size: 24),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final notificationProvider = Provider.of<NotificationProvider>(context);
    final notifications = notificationProvider.notifications;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Notifikasi',
        showBackButton: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed:
                notifications != null && notifications.isNotEmpty
                    ? _markAllAsRead
                    : null,
            tooltip: 'Tandai semua sebagai dibaca',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshNotifications,
        child:
            notificationProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : notifications == null || notifications.isEmpty
                ? _buildEmptyNotifications()
                : ListView.separated(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: notifications.length,
                  separatorBuilder: (context, index) => const Divider(),
                  itemBuilder: (context, index) {
                    final notification = notifications[index];
                    return _buildNotificationItem(notification);
                  },
                ),
      ),
    );
  }

  Widget _buildEmptyNotifications() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_off_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Tidak ada notifikasi',
              style: TextStyle(color: Colors.grey[600], fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationItem(UserNotification notification) {
    // Format datetime
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
    final createdAt = DateTime.parse(notification.createdAt);

    return InkWell(
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
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _getNotificationIcon(notification.type),
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
                            fontWeight:
                                !notification.isRead ? FontWeight.bold : null,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      if (!notification.isRead)
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: Theme.of(context).primaryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.message,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    dateFormat.format(createdAt),
                    style: TextStyle(color: Colors.grey[500], fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
