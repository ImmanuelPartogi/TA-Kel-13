import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart'; // Tambahkan import
import 'package:ferry_booking_app/screens/home/home_tab.dart';
import 'package:ferry_booking_app/screens/tickets/ticket_list_screen.dart';
import 'package:ferry_booking_app/screens/profile/profile_screen.dart';
import 'package:ferry_booking_app/widgets/chatbot_fab.dart';
import 'package:ferry_booking_app/widgets/notification_badge.dart'; // Tambahkan import

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  late List<Widget> _tabs;

  @override
  void initState() {
    super.initState();

    // Gunakan ini untuk menunda pemanggilan sampai setelah build selesai
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserData();
      // Muat notifikasi saat aplikasi dibuka
      _loadNotifications();
    });
  }

  Future<void> _loadUserData() async {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    await bookingProvider.getBookings();
  }

  Future<void> _loadNotifications() async {
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    await notificationProvider.getNotifications();
    // Mulai auto-refresh notifikasi
    notificationProvider.startAutoRefresh();
  }

  @override
  Widget build(BuildContext context) {
    // Inisialisasi tabs di sini untuk memastikan context tersedia untuk Provider
    _tabs = [
      const HomeTab(),
      const TicketListScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: _getAppBarTitle(),
        actions: [
          NotificationBadge(
            child: IconButton(
              icon: const Icon(Icons.notifications),
              onPressed: () {
                Navigator.pushNamed(context, '/notifications');
              },
            ),
          ),
          const SizedBox(width: 10),
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
          BottomNavigationBarItem(
            icon: Icon(Icons.confirmation_number),
            label: 'Tiket',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
      floatingActionButton: const ChatbotFAB(),
    );
  }

  // Method untuk mendapatkan judul AppBar berdasarkan tab yang aktif
  Widget _getAppBarTitle() {
    switch (_currentIndex) {
      case 0:
        return const Text('Beranda');
      case 1:
        return const Text('Tiket Saya');
      case 2:
        return const Text('Profil');
      default:
        return const Text('Ferry Booking');
    }
  }

  @override
  void dispose() {
    // Hentikan auto-refresh saat screen dihancurkan
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    notificationProvider.stopAutoRefresh();
    super.dispose();
  }
}