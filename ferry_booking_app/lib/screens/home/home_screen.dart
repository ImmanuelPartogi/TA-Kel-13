import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart';
import 'package:ferry_booking_app/screens/home/home_tab.dart';
import 'package:ferry_booking_app/screens/tickets/ticket_list_screen.dart';
import 'package:ferry_booking_app/screens/profile/profile_screen.dart';
import 'package:ferry_booking_app/widgets/chatbot_fab.dart';
import 'package:ferry_booking_app/widgets/notification_badge.dart';
import 'dart:ui';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int _currentIndex = 0;
  late List<Widget> _tabs;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {
          _currentIndex = _tabController.index;
        });
      }
    });

    // Gunakan ini untuk menunda pemanggilan sampai setelah build selesai
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserData();
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
    notificationProvider.startAutoRefresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    // Inisialisasi tabs di sini untuk memastikan context tersedia untuk Provider
    _tabs = [
      const HomeTab(),
      const TicketListScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      extendBody: true, // Biarkan konten mengalir di bawah bottom navigation bar
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
            // Background elements - serupa dengan login screen
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
            
            // Main content
            SafeArea(
              child: Column(
                children: [
                  // Custom AppBar
                  _buildAppBar(),
                  
                  // Tab content
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      physics: const NeverScrollableScrollPhysics(), // Disable swipe
                      children: _tabs,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              offset: const Offset(0, -5),
              blurRadius: 10,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(30.0),
            topRight: Radius.circular(30.0),
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
                _tabController.animateTo(index);
              });
            },
            elevation: 0,
            backgroundColor: Colors.white,
            selectedItemColor: theme.primaryColor,
            unselectedItemColor: Colors.grey.shade600,
            selectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
            unselectedLabelStyle: const TextStyle(
              fontSize: 12,
            ),
            type: BottomNavigationBarType.fixed,
            items: [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home_rounded),
                label: 'Beranda',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.confirmation_number_outlined),
                activeIcon: Icon(Icons.confirmation_number_rounded),
                label: 'Tiket',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person_outline_rounded),
                activeIcon: Icon(Icons.person_rounded),
                label: 'Profil',
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: const ChatbotFAB(),
    );
  }

  // Custom AppBar dengan desain elevated
  Widget _buildAppBar() {
    final titles = ['Beranda', 'Tiket Saya', 'Profil'];
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // App Logo and Title
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).primaryColor.withBlue(245),
                      Theme.of(context).primaryColor,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Theme.of(context).primaryColor.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.directions_boat_rounded,
                  size: 24,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                titles[_currentIndex],
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          
          // Action buttons
          Row(
            children: [
              NotificationBadge(
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.notifications_outlined,
                      size: 20,
                    ),
                    color: Colors.grey.shade700,
                    onPressed: () {
                      Navigator.pushNamed(context, '/notifications');
                    },
                  ),
                ),
              ),
              const SizedBox(width: 10),
            ],
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    final notificationProvider = Provider.of<NotificationProvider>(
      context,
      listen: false,
    );
    notificationProvider.stopAutoRefresh();
    super.dispose();
  }
}