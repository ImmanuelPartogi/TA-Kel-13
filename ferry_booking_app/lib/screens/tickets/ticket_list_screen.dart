import 'package:ferry_booking_app/models/booking.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/ticket_card.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'dart:ui';
import 'dart:async';
import 'package:intl/intl.dart';

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

  double _indicatorWidth = 0.0;
  double _indicatorPosition = 0.0;
  final List<GlobalKey> _tabKeys = [GlobalKey(), GlobalKey()];
  bool _isTabInitialized = false;
  Timer? _statusUpdateTimer;

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
        setState(() {});
      }
    });

    // Use post-frame callback to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadBookings();
      
      // Timer untuk refresh status tiket secara periodik (setiap 1 menit)
      _statusUpdateTimer = Timer.periodic(const Duration(minutes: 1), (_) {
        if (mounted) {
          setState(() {
            // Force rebuild untuk update real-time status expired
          });
        }
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    _statusUpdateTimer?.cancel();
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
  
  // Fungsi untuk memeriksa apakah tiket (booking) seharusnya expired
  bool _shouldBeExpired(Booking booking) {
    if (booking.schedule == null) return false;
    
    final now = DateTime.now();
    final departureDate = DateTime.parse(booking.departureDate);
    
    // Gabungkan tanggal dan waktu keberangkatan
    final departureTime = booking.schedule!.departureTime;
    final departureParts = departureTime.split(':');
    
    if (departureParts.length < 2) return false;
    
    final hour = int.tryParse(departureParts[0]) ?? 0;
    final minute = int.tryParse(departureParts[1]) ?? 0;
    
    final departureDateTime = DateTime(
      departureDate.year,
      departureDate.month, 
      departureDate.day,
      hour,
      minute,
    );
    
    // Jadwal keberangkatan sudah lewat
    return now.isAfter(departureDateTime);
  }
  
  // Fungsi untuk mendapatkan status efektif dari booking/tiket
  String _getEffectiveStatus(Booking booking) {
    // Jika status di database sudah final (CANCELLED, EXPIRED, COMPLETED, REFUNDED)
    // maka gunakan status tersebut
    if (['CANCELLED', 'EXPIRED', 'COMPLETED', 'REFUNDED'].contains(booking.status.toUpperCase())) {
      return booking.status;
    }
    
    // Jika status PENDING atau CONFIRMED tapi waktu keberangkatan sudah lewat
    // maka harus dianggap EXPIRED (meskipun belum diupdate di database)
    if (_shouldBeExpired(booking)) {
      return 'EXPIRED';
    }
    
    // Gunakan status asli dari database
    return booking.status;
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final bookings = bookingProvider.bookings;
    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);
    final now = DateTime.now();

    // Lista semua booking dengan status efektif
    final List<Booking> allBookingsWithEffectiveStatus = bookings?.map((booking) {
      // Buat salinan booking dengan status efektif
      final effectiveBooking = booking;
      effectiveBooking.status = _getEffectiveStatus(booking);
      return effectiveBooking;
    }).toList() ?? [];

    // Filter untuk "Akan Datang"
    final upcomingBookings = allBookingsWithEffectiveStatus
        .where((booking) => 
            (booking.status == 'CONFIRMED' || 
             booking.status == 'PENDING') &&
            !_shouldBeExpired(booking))
        .toList();

    // Filter untuk "Riwayat"
    final historyBookings = allBookingsWithEffectiveStatus
        .where((booking) => 
            (booking.status != 'CONFIRMED' && 
             booking.status != 'PENDING') ||
            _shouldBeExpired(booking))
        .toList();

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
                    child: Container(
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
                            child: GestureDetector(
                              onTap: () {
                                _tabController.animateTo(0);
                              },
                              child: Container(
                                key: _tabKeys[0],
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: _tabController.index == 0
                                      ? theme.primaryColor.withOpacity(0.1)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Akan Datang',
                                      style: TextStyle(
                                        fontWeight: _tabController.index == 0
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                        color: _tabController.index == 0
                                            ? theme.primaryColor
                                            : Colors.grey.shade600,
                                        fontSize: 15,
                                      ),
                                    ),
                                    if (upcomingBookings.isNotEmpty) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: theme.primaryColor,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '${upcomingBookings.length}',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          ),
                          
                          // Tab 2 - Riwayat
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                _tabController.animateTo(1);
                              },
                              child: Container(
                                key: _tabKeys[1],
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: _tabController.index == 1
                                      ? theme.primaryColor.withOpacity(0.1)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Riwayat',
                                      style: TextStyle(
                                        fontWeight: _tabController.index == 1
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                        color: _tabController.index == 1
                                            ? theme.primaryColor
                                            : Colors.grey.shade600,
                                        fontSize: 15,
                                      ),
                                    ),
                                    if (historyBookings.isNotEmpty) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: _tabController.index == 1
                                              ? theme.primaryColor
                                              : Colors.grey.shade400,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '${historyBookings.length}',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
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
                                    final booking = upcomingBookings[index];
                                    // Perhitungan waktu keberangkatan
                                    final departureDate = DateTime.parse(booking.departureDate);
                                    final departureTime = booking.schedule?.departureTime ?? "00:00";
                                    final departureParts = departureTime.split(':');
                                    
                                    final departureDateTime = DateTime(
                                      departureDate.year,
                                      departureDate.month,
                                      departureDate.day,
                                      int.tryParse(departureParts[0]) ?? 0,
                                      int.tryParse(departureParts[1]) ?? 0,
                                    );
                                    
                                    final timeDifference = departureDateTime.difference(now);
                                    
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
                                        child: Column(
                                          children: [
                                            // Status indikator (jika PENDING)
                                            if (booking.status == 'PENDING') ...[
                                              Container(
                                                width: double.infinity,
                                                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                                                decoration: BoxDecoration(
                                                  color: Colors.orange.withOpacity(0.2),
                                                  borderRadius: const BorderRadius.only(
                                                    topLeft: Radius.circular(20),
                                                    topRight: Radius.circular(20),
                                                  ),
                                                ),
                                                child: Row(
                                                  children: [
                                                    Icon(
                                                      Icons.warning_amber_rounded,
                                                      size: 16,
                                                      color: Colors.orange.shade800,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Text(
                                                      'Menunggu pembayaran',
                                                      style: TextStyle(
                                                        color: Colors.orange.shade800,
                                                        fontWeight: FontWeight.bold,
                                                        fontSize: 12,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                            
                                            // Timer keberangkatan (jika < 24 jam)
                                            if (timeDifference.inHours < 24) ...[
                                              Container(
                                                width: double.infinity,
                                                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                                                decoration: BoxDecoration(
                                                  color: booking.status == 'PENDING'
                                                      ? Colors.white
                                                      : theme.primaryColor.withOpacity(0.1),
                                                  borderRadius: booking.status == 'PENDING'
                                                      ? BorderRadius.zero
                                                      : const BorderRadius.only(
                                                          topLeft: Radius.circular(20),
                                                          topRight: Radius.circular(20),
                                                        ),
                                                ),
                                                child: Row(
                                                  children: [
                                                    Icon(
                                                      Icons.access_time,
                                                      size: 16,
                                                      color: theme.primaryColor,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Text(
                                                      'Berangkat dalam ${_formatTimeRemaining(timeDifference)}',
                                                      style: TextStyle(
                                                        color: theme.primaryColor,
                                                        fontWeight: FontWeight.bold,
                                                        fontSize: 12,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                            
                                            ClipRRect(
                                              borderRadius: BorderRadius.only(
                                                topLeft: (booking.status != 'PENDING' && 
                                                       timeDifference.inHours >= 24)
                                                    ? const Radius.circular(20)
                                                    : Radius.zero,
                                                topRight: (booking.status != 'PENDING' && 
                                                        timeDifference.inHours >= 24)
                                                    ? const Radius.circular(20)
                                                    : Radius.zero,
                                                bottomLeft: const Radius.circular(20),
                                                bottomRight: const Radius.circular(20),
                                              ),
                                              child: TicketCard(
                                                booking: booking,
                                                onTap: () {
                                                  Navigator.pushNamed(
                                                    context,
                                                    '/tickets/detail',
                                                    arguments: booking.id,
                                                  );
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                            ),
                          ),
                        ),

                        // History tickets with real-time status (TANPA label status di pojok)
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
                                    final booking = historyBookings[index];
                                    final effectiveStatus = booking.status;
                                    
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
                                          child: Opacity(
                                            opacity: ['EXPIRED', 'CANCELLED', 'REFUNDED'].contains(effectiveStatus) ? 0.9 : 1.0,
                                            child: TicketCard(
                                              booking: booking,
                                              onTap: () {
                                                Navigator.pushNamed(
                                                  context,
                                                  '/tickets/detail',
                                                  arguments: booking.id,
                                                );
                                              },
                                            ),
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
    );
  }
  
  // Fungsi untuk memformat sisa waktu
  String _formatTimeRemaining(Duration duration) {
    if (duration.inDays > 0) {
      return '${duration.inDays} hari';
    } else if (duration.inHours > 0) {
      return '${duration.inHours} jam ${duration.inMinutes.remainder(60)} menit';
    } else {
      return '${duration.inMinutes} menit';
    }
  }
  
  // Fungsi untuk mendapatkan warna status
  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.green;
      case 'PENDING':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      case 'EXPIRED':
        return Colors.grey.shade700;
      case 'COMPLETED':
        return Colors.blue;
      case 'REFUNDED':
        return Colors.purple;
      case 'REFUND_PENDING':
        return Colors.pink;
      case 'RESCHEDULED':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }
  
  // Fungsi untuk mendapatkan teks status
  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'Terkonfirmasi';
      case 'PENDING':
        return 'Menunggu Pembayaran';
      case 'CANCELLED':
        return 'Dibatalkan';
      case 'EXPIRED':
        return 'Kadaluarsa';
      case 'COMPLETED':
        return 'Selesai';
      case 'REFUNDED':
        return 'Dana Dikembalikan';
      case 'REFUND_PENDING':
        return 'Refund Diproses';
      case 'RESCHEDULED':
        return 'Dijadwalkan Ulang';
      default:
        return status;
    }
  }

  Widget _buildEmptyTickets(String message, ThemeData theme) {
    // Widget untuk menampilkan pesan kosong (tidak berubah)
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