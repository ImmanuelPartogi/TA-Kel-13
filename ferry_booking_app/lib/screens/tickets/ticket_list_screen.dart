import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/ticket_card.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'dart:ui';

class TicketListScreen extends StatefulWidget {
  const TicketListScreen({Key? key}) : super(key: key);

  @override
  _TicketListScreenState createState() => _TicketListScreenState();
}

class _TicketListScreenState extends State<TicketListScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  // Tab indicator position
  double _indicatorWidth = 0.0;
  double _indicatorPosition = 0.0;
  final List<GlobalKey> _tabKeys = [GlobalKey(), GlobalKey()];
  bool _isTabInitialized = false;
  
  // Hover state tracking for tabs
  final Map<int, bool> _isHovering = {0: false, 1: false};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Animation controller setup
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
    
    // Start animation
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });
    
    // Tab controller listener
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        _updateTabIndicator();
      }
    });

    // Use post-frame callback to avoid setState during build
    WidgetsBinding.instance!.addPostFrameCallback((_) {
      _loadBookings();
      // Tambahkan delay sebelum memperbarui indikator tab untuk memastikan widget sudah sepenuhnya dirender
      Future.delayed(const Duration(milliseconds: 100), () {
        _updateTabIndicator();
      });
    });
  }

  void _updateTabIndicator() {
    if (!mounted) return;
    
    // Pastikan context ada sebelum mengakses render object
    if (_tabKeys[_tabController.index].currentContext == null) return;

    try {
      final RenderBox renderBox = _tabKeys[_tabController.index].currentContext!.findRenderObject() as RenderBox;
      final position = renderBox.localToGlobal(Offset.zero);
      
      setState(() {
        _indicatorWidth = renderBox.size.width * 0.8;
        _indicatorPosition = position.dx + (renderBox.size.width - _indicatorWidth) / 2;
        _isTabInitialized = true;
      });
    } catch (e) {
      print("Error updating tab indicator: $e");
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings() async {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    await bookingProvider.getBookings();
  }

  Future<void> _refreshBookings() async {
    await _loadBookings();
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final bookings = bookingProvider.bookings;
    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);

    // Filter bookings by status
    final upcomingBookings =
        bookings
            ?.where(
              (booking) =>
                  // Filter berdasarkan status DAN belum expired
                  (booking.status == 'CONFIRMED' ||
                      booking.status == 'PENDING') &&
                  !booking.isExpired,
            )
            .toList() ??
        [];

    final historyBookings = bookings ?? [];

    // Inisialisasi indikator tab jika belum terinisialisasi
    if (!_isTabInitialized) {
      WidgetsBinding.instance!.addPostFrameCallback((_) {
        _updateTabIndicator();
      });
    }

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
                  Container(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Tiket Saya',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Custom Tab Bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 10),
                    child: Stack(
                      children: [
                        // Tab Container
                        Container(
                          height: 60,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                                spreadRadius: -5,
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              // Tab 1 - Akan Datang
                              Expanded(
                                child: MouseRegion(
                                  onEnter: (_) => setState(() => _isHovering[0] = true),
                                  onExit: (_) => setState(() => _isHovering[0] = false),
                                  child: GestureDetector(
                                    onTap: () {
                                      _tabController.animateTo(0);
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      key: _tabKeys[0],
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: _tabController.index == 0 
                                          ? theme.primaryColor.withOpacity(0.1)
                                          : (_isHovering[0] ?? false) 
                                            ? Colors.grey.withOpacity(0.1)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        'Akan Datang',
                                        style: TextStyle(
                                          fontWeight: _tabController.index == 0
                                              ? FontWeight.bold
                                              : FontWeight.normal,
                                          color: _tabController.index == 0
                                              ? theme.primaryColor
                                              : (_isHovering[0] ?? false)
                                                ? theme.primaryColor.withOpacity(0.8)
                                                : Colors.grey.shade600,
                                          fontSize: 15,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              
                              // Tab 2 - Riwayat
                              Expanded(
                                child: MouseRegion(
                                  onEnter: (_) => setState(() => _isHovering[1] = true),
                                  onExit: (_) => setState(() => _isHovering[1] = false),
                                  child: GestureDetector(
                                    onTap: () {
                                      _tabController.animateTo(1);
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      key: _tabKeys[1],
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: _tabController.index == 1 
                                          ? theme.primaryColor.withOpacity(0.1)
                                          : (_isHovering[1] ?? false) 
                                            ? Colors.grey.withOpacity(0.1)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        'Riwayat',
                                        style: TextStyle(
                                          fontWeight: _tabController.index == 1
                                              ? FontWeight.bold
                                              : FontWeight.normal,
                                          color: _tabController.index == 1
                                              ? theme.primaryColor
                                              : (_isHovering[1] ?? false)
                                                ? theme.primaryColor.withOpacity(0.8)
                                                : Colors.grey.shade600,
                                          fontSize: 15,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Custom indicator dengan animasi yang lebih halus
                        AnimatedPositioned(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeOutCirc,
                          bottom: 0,
                          left: _indicatorPosition,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeOutCirc,
                            width: _indicatorWidth,
                            height: 4,
                            decoration: BoxDecoration(
                              color: _isTabInitialized 
                                ? theme.primaryColor
                                : Colors.transparent, 
                              borderRadius: BorderRadius.circular(2),
                              boxShadow: [
                                BoxShadow(
                                  color: theme.primaryColor.withOpacity(0.3),
                                  blurRadius: 4,
                                  offset: const Offset(0, 1),
                                  spreadRadius: -1,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Tab Content
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Upcoming tickets
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: SlideTransition(
                            position: _slideAnimation,
                            child: RefreshIndicator(
                              onRefresh: _refreshBookings,
                              color: theme.primaryColor,
                              child: bookingProvider.isLoading
                                ? const Center(child: CircularProgressIndicator())
                                : upcomingBookings.isEmpty
                                ? _buildEmptyTickets(
                                  'Tidak ada tiket untuk perjalanan yang akan datang',
                                  theme,
                                )
                                : ListView.builder(
                                  padding: const EdgeInsets.all(24.0),
                                  itemCount: upcomingBookings.length,
                                  itemBuilder: (context, index) {
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 16),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(20),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.grey.withOpacity(0.1),
                                              blurRadius: 15,
                                              offset: const Offset(0, 5),
                                              spreadRadius: -5,
                                            ),
                                          ],
                                        ),
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(20),
                                          child: TicketCard(
                                            booking: upcomingBookings[index],
                                            onTap: () {
                                              Navigator.pushNamed(
                                                context,
                                                '/tickets/detail',
                                                arguments: upcomingBookings[index].id,
                                              );
                                            },
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                            ),
                          ),
                        ),

                        // History tickets - all statuses
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: SlideTransition(
                            position: _slideAnimation,
                            child: RefreshIndicator(
                              onRefresh: _refreshBookings,
                              color: theme.primaryColor,
                              child: bookingProvider.isLoading
                                ? const Center(child: CircularProgressIndicator())
                                : historyBookings.isEmpty
                                ? _buildEmptyTickets('Tidak ada riwayat perjalanan', theme)
                                : ListView.builder(
                                  padding: const EdgeInsets.all(24.0),
                                  itemCount: historyBookings.length,
                                  itemBuilder: (context, index) {
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 16),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(20),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.grey.withOpacity(0.1),
                                              blurRadius: 15,
                                              offset: const Offset(0, 5),
                                              spreadRadius: -5,
                                            ),
                                          ],
                                        ),
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(20),
                                          child: TicketCard(
                                            booking: historyBookings[index],
                                            onTap: () {
                                              Navigator.pushNamed(
                                                context,
                                                '/tickets/detail',
                                                arguments: historyBookings[index].id,
                                              );
                                            },
                                          ),
                                        ),
                                      ),
                                    );
                                  },
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
          ],
        ),
      ),
      floatingActionButton: Container(
        height: 65,
        width: 65,
        margin: const EdgeInsets.only(bottom: 15),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(50),
          boxShadow: [
            BoxShadow(
              color: theme.primaryColor.withOpacity(0.4),
              blurRadius: 15,
              offset: const Offset(0, 8),
              spreadRadius: -5,
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(50),
          child: InkWell(
            onTap: () {
              Navigator.pushNamed(context, '/booking/routes');
            },
            borderRadius: BorderRadius.circular(50),
            child: Ink(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    theme.primaryColor.withBlue(255),
                    theme.primaryColor,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(50),
              ),
              child: Container(
                alignment: Alignment.center,
                child: const Icon(
                  Icons.add_rounded,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyTickets(String message, ThemeData theme) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
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
                  Icons.confirmation_number_outlined,
                  size: 70,
                  color: theme.primaryColor,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                message,
                style: TextStyle(
                  color: Colors.grey[700],
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              Container(
                height: 50,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                      spreadRadius: -5,
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    onTap: () {
                      Navigator.pushNamed(context, '/booking/routes');
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            theme.primaryColor.withBlue(255),
                            theme.primaryColor,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Container(
                        alignment: Alignment.center,
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: const Text(
                          'PESAN TIKET SEKARANG',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}