import 'package:ferry_booking_app/models/booking.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/ticket_status_provider.dart'; // Tambahkan provider baru
import 'package:ferry_booking_app/widgets/booking_card.dart';
import 'package:ferry_booking_app/utils/date_time_helper.dart'; // Tambahkan helper untuk tanggal
import 'dart:async'; // Untuk timer
import 'package:async/async.dart'; // Import package async

class HomeTab extends StatefulWidget {
  const HomeTab({Key? key}) : super(key: key);

  @override
  _HomeTabState createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  // Timer untuk sinkronisasi background
  Timer? _syncTimer;
  Timer? _statusUpdateTimer;
  bool _isSyncing = false;
  bool _isInitialLoading = true; // Flag untuk loading awal
  CancelableOperation? _bookingOperation; // Operation yang dapat dibatalkan
  bool _isActive = true; // Flag untuk menandai apakah tab sedang aktif

  @override
  void initState() {
    super.initState();
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

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );

    // Delay start of animation slightly for better UX
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _animationController.forward();
    });

    // Gunakan post-frame callback untuk loading data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadBookingsInitial();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _syncTimer?.cancel();
    _statusUpdateTimer?.cancel();
    _bookingOperation?.cancel(); // Batalkan operasi yang sedang berjalan
    _isActive = false;
    super.dispose();
  }

  // Method untuk dipanggil dari parent widget (TabController)
  void setActive(bool active) {
    if (_isActive != active) {
      _isActive = active;
      if (_isActive) {
        // Reload data saat tab menjadi aktif kembali
        _loadBookingsInitial();
      } else {
        // Batalkan operasi saat tab tidak aktif
        _bookingOperation?.cancel();
        _syncTimer?.cancel();
      }
    }
  }

  /// Load booking awal dengan loading indicator
  Future<void> _loadBookingsInitial() async {
    if (!mounted) return;

    setState(() {
      _isInitialLoading = true;
    });

    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );

      // PERUBAHAN: Langsung panggil getBookings tanpa CancelableOperation
      await bookingProvider.getBookings().timeout(
        const Duration(seconds: 30), // Perpanjang timeout
        onTimeout: () {
          // debugPrint('Booking fetch operation timed out');
          return;
        },
      );

      if (mounted) {
        setState(() {
          _isInitialLoading = false;
        });

        // PERUBAHAN: Delay setup sinkronisasi untuk mencegah tumpang tindih
        Future.delayed(Duration(seconds: 1), () {
          if (mounted) _setupStatusSynchronization();
        });
      }
    } catch (e) {
      // debugPrint('Error loading bookings: $e');
      if (mounted) {
        setState(() {
          _isInitialLoading = false;
        });
      }
    }
  }

  /// Setup timer untuk sinkronisasi status tiket di background
  void _setupStatusSynchronization() async {
    // PERUBAHAN RADIKAL: Matikan sinkronisasi otomatis!
    // await _synchronizeStatuses();
    // _updateSyncTimer();
    // _statusUpdateTimer = Timer.periodic(...);

    // Ganti dengan single-time sync
    if (mounted) {
      await _synchronizeStatuses();
    }
  }

  /// Update timer sinkronisasi berdasarkan keberangkatan terdekat
  void _updateSyncTimer() {
    if (!mounted) return;

    // PERUBAHAN: Batalkan timer yang ada dengan aman
    _syncTimer?.cancel();

    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final ticketStatusProvider = Provider.of<TicketStatusProvider>(
      context,
      listen: false,
    );

    if (bookingProvider.bookings == null) return;

    // Kategorikan tiket
    final categorized = ticketStatusProvider.categorizeTickets(
      bookingProvider.bookings!,
    );
    final upcomingTickets = categorized['upcoming'] ?? [];

    // Dapatkan waktu keberangkatan terdekat
    final closestDeparture = ticketStatusProvider.getClosestDepartureTime(
      upcomingTickets,
    );

    // PERUBAHAN: Perlambat interval sinkronisasi
    if (closestDeparture != null) {
      final difference = closestDeparture.difference(DateTime.now());

      if (difference.inHours < 2) {
        // Jika kurang dari 2 jam, sync setiap 5 menit (bukan 3 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 5),
          (_) => _synchronizeStatuses(),
        );
      } else if (difference.inHours < 6) {
        // Jika kurang dari 6 jam, sync setiap 10 menit (bukan 5 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 10),
          (_) => _synchronizeStatuses(),
        );
      } else {
        // Jika lebih dari 6 jam, sync setiap 15 menit (bukan 10 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 15),
          (_) => _synchronizeStatuses(),
        );
      }
    } else {
      // Jika tidak ada tiket upcoming, sync setiap 30 menit (bukan 15 menit)
      _syncTimer = Timer.periodic(
        const Duration(minutes: 30),
        (_) => _synchronizeStatuses(),
      );
    }
  }

  /// Metode untuk sinkronisasi status tiket dengan server tanpa mengganggu UI
  Future<void> _synchronizeStatuses() async {
    if (!mounted || _isSyncing || !_isActive) return;

    setState(() {
      _isSyncing = true;
    });

    try {
      // Hanya refresh data booking
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      await bookingProvider.getBookings().timeout(
        const Duration(seconds: 20),
        onTimeout: () {},
      );
    } catch (e) {
      // debugPrint('Error refreshing bookings: $e');
    } finally {
      if (mounted && _isActive) {
        setState(() {
          _isSyncing = false;
        });
      }
    }
  }

  /// Fungsi untuk mengurutkan tiket berdasarkan tanggal keberangkatan
  List<Booking> _sortUpcomingTickets(List<Booking> tickets) {
    return List<Booking>.from(tickets)..sort((a, b) {
      // Mendapatkan tanggal dan waktu keberangkatan untuk tiket a
      final aDepartureDateTime = DateTimeHelper.combineDateAndTime(
        a.departureDate,
        a.schedule?.departureTime ?? "00:00",
      );

      // Mendapatkan tanggal dan waktu keberangkatan untuk tiket b
      final bDepartureDateTime = DateTimeHelper.combineDateAndTime(
        b.departureDate,
        b.schedule?.departureTime ?? "00:00",
      );

      // Jika salah satu atau kedua tanggal tidak valid, tangani kasus ini
      if (aDepartureDateTime == null && bDepartureDateTime == null) {
        return 0; // Keduanya tidak memiliki tanggal valid, anggap sama
      } else if (aDepartureDateTime == null) {
        return 1; // a tidak memiliki tanggal valid, tempatkan di akhir
      } else if (bDepartureDateTime == null) {
        return -1; // b tidak memiliki tanggal valid, tempatkan di akhir
      }

      // Bandingkan tanggal keberangkatan
      return aDepartureDateTime.compareTo(bDepartureDateTime);
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final bookingProvider = Provider.of<BookingProvider>(context);
    final ticketStatusProvider = Provider.of<TicketStatusProvider>(context);
    final user = authProvider.user;
    final bookings = bookingProvider.bookings;
    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);

    // Kategorikan dan urutkan tiket
    List<Booking> upcomingTickets = [];
    if (bookings != null) {
      final categorized = ticketStatusProvider.categorizeTickets(bookings);
      upcomingTickets = _sortUpcomingTickets(categorized['upcoming'] ?? []);

      // Batasi hanya 3 tiket terdekat
      if (upcomingTickets.length > 3) {
        upcomingTickets = upcomingTickets.sublist(0, 3);
      }
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
            // Background elements - similar to LoginScreen
            Positioned(
              top: 90,
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
              bottom: 40,
              left: -90,
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
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: CustomScrollView(
                    slivers: [
                      // Header Section
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(24, 30, 24, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // User greeting with card-like appearance
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      theme.primaryColor.withBlue(245),
                                      theme.primaryColor,
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(
                                      color: theme.primaryColor.withOpacity(
                                        0.3,
                                      ),
                                      blurRadius: 15,
                                      offset: const Offset(0, 8),
                                      spreadRadius: -5,
                                    ),
                                  ],
                                ),
                                padding: const EdgeInsets.all(22),
                                child: Row(
                                  children: [
                                    // Avatar with reflection effect
                                    Stack(
                                      alignment: Alignment.center,
                                      children: [
                                        Container(
                                          width: 60,
                                          height: 60,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withOpacity(
                                                  0.15,
                                                ),
                                                blurRadius: 10,
                                                offset: const Offset(0, 5),
                                                spreadRadius: 0,
                                              ),
                                            ],
                                          ),
                                        ),
                                        Container(
                                          width: 60,
                                          height: 60,
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              user?.name.isNotEmpty == true
                                                  ? user!.name[0].toUpperCase()
                                                  : '?',
                                              style: TextStyle(
                                                fontSize: 24,
                                                fontWeight: FontWeight.bold,
                                                color: theme.primaryColor,
                                              ),
                                            ),
                                          ),
                                        ),
                                        // Reflection effect
                                        Positioned(
                                          top: 0,
                                          left: 0,
                                          child: Container(
                                            width: 30,
                                            height: 20,
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  const BorderRadius.only(
                                                    topLeft: Radius.circular(
                                                      20,
                                                    ),
                                                    topRight: Radius.circular(
                                                      20,
                                                    ),
                                                    bottomRight:
                                                        Radius.circular(20),
                                                  ),
                                              gradient: LinearGradient(
                                                colors: [
                                                  Colors.white.withOpacity(0.5),
                                                  Colors.white.withOpacity(0.1),
                                                ],
                                                begin: Alignment.topLeft,
                                                end: Alignment.bottomRight,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 18),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Halo, ${user?.name.split(' ')[0] ?? 'Pengguna'}',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        Text(
                                          'Mau pergi kemana hari ini?',
                                          style: TextStyle(
                                            color: Colors.white.withOpacity(
                                              0.9,
                                            ),
                                            fontSize: 14,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 10),

                              // Search box with card-like appearance
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.grey.withOpacity(0.1),
                                      blurRadius: 15,
                                      offset: const Offset(0, 8),
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
                                      Navigator.pushNamed(
                                        context,
                                        '/booking/routes',
                                      );
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                        vertical: 16,
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.search_rounded,
                                            color: theme.primaryColor,
                                            size: 24,
                                          ),
                                          const SizedBox(width: 12),
                                          Text(
                                            'Cari rute perjalanan',
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                              fontSize: 16,
                                            ),
                                          ),
                                          const Spacer(),
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: theme.primaryColor
                                                  .withOpacity(0.1),
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            child: Icon(
                                              Icons.travel_explore,
                                              color: theme.primaryColor,
                                              size: 20,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                              const SizedBox(height: 30),
                            ],
                          ),
                        ),
                      ),

                      // Active Bookings Section with View All
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(24, 10, 24, 15),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Perjalanan Aktif',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Active Bookings List - Gunakan loading flag agar tidak mengganggu UI
                      SliverToBoxAdapter(
                        child:
                            _isInitialLoading
                                ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(24.0),
                                    child: CircularProgressIndicator(),
                                  ),
                                )
                                : (upcomingTickets.isEmpty)
                                ? _buildEmptyBookings(context, theme)
                                : Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                  ),
                                  child: Column(
                                    children:
                                        upcomingTickets.map((booking) {
                                          // Hitung waktu keberangkatan untuk setiap tiket
                                          final now = DateTime.now();
                                          final departureDateTime =
                                              DateTimeHelper.combineDateAndTime(
                                                booking.departureDate,
                                                booking
                                                        .schedule
                                                        ?.departureTime ??
                                                    "00:00",
                                              );

                                          final timeDifference =
                                              departureDateTime != null
                                                  ? departureDateTime
                                                      .difference(now)
                                                  : null;

                                          return Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 16,
                                            ),
                                            child: Container(
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.grey
                                                        .withOpacity(0.1),
                                                    blurRadius: 15,
                                                    offset: const Offset(0, 5),
                                                    spreadRadius: -5,
                                                  ),
                                                ],
                                              ),
                                              child: Column(
                                                children: [
                                                  // Timer keberangkatan (jika < 24 jam)
                                                  if (timeDifference != null &&
                                                      !timeDifference
                                                          .isNegative &&
                                                      timeDifference.inHours <
                                                          24)
                                                    Container(
                                                      width: double.infinity,
                                                      padding:
                                                          const EdgeInsets.symmetric(
                                                            vertical: 8,
                                                            horizontal: 16,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        color:
                                                            booking.status ==
                                                                    'PENDING'
                                                                ? Colors.white
                                                                : theme
                                                                    .primaryColor
                                                                    .withOpacity(
                                                                      0.1,
                                                                    ),
                                                        borderRadius:
                                                            booking.status ==
                                                                    'PENDING'
                                                                ? BorderRadius
                                                                    .zero
                                                                : const BorderRadius.only(
                                                                  topLeft:
                                                                      Radius.circular(
                                                                        20,
                                                                      ),
                                                                  topRight:
                                                                      Radius.circular(
                                                                        20,
                                                                      ),
                                                                ),
                                                      ),
                                                      child: Row(
                                                        children: [
                                                          Icon(
                                                            Icons.access_time,
                                                            size: 16,
                                                            color:
                                                                theme
                                                                    .primaryColor,
                                                          ),
                                                          const SizedBox(
                                                            width: 8,
                                                          ),
                                                          Text(
                                                            'Berangkat dalam ${_formatTimeRemaining(timeDifference)}',
                                                            style: TextStyle(
                                                              color:
                                                                  theme
                                                                      .primaryColor,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontSize: 12,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),

                                                  // Ticket Card
                                                  ClipRRect(
                                                    borderRadius:
                                                        _getTicketCardBorderRadius(
                                                          booking,
                                                          timeDifference,
                                                        ),
                                                    child: BookingCard(
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
                                        }).toList(),
                                  ),
                                ),
                      ),

                      // Footer space
                      const SliverToBoxAdapter(child: SizedBox(height: 24)),
                    ],
                  ),
                ),
              ),
            ),

            // Indikator sinkronisasi yang tidak mengganggu UI
            if (_isSyncing && !_isInitialLoading)
              Positioned(
                top: MediaQuery.of(context).padding.top + 10,
                right: 24,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            theme.primaryColor,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Memperbarui...',
                        style: TextStyle(
                          fontSize: 10,
                          color: theme.primaryColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyBookings(BuildContext context, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Container(
        padding: const EdgeInsets.all(30),
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
        child: Column(
          children: [
            Icon(
              Icons.directions_boat_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Belum ada perjalanan aktif',
              style: TextStyle(color: Colors.grey[600], fontSize: 16),
            ),
            const SizedBox(height: 20),
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
                      constraints: const BoxConstraints(minHeight: 50),
                      child: const Text(
                        'PESAN TIKET SEKARANG',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                          color: Colors.white,
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
    );
  }

  /// Mendapatkan border radius untuk card tiket
  BorderRadius _getTicketCardBorderRadius(
    Booking booking,
    Duration? timeDifference,
  ) {
    final showTimeInfo =
        timeDifference != null &&
        timeDifference.inHours < 24 &&
        !timeDifference.isNegative;

    return BorderRadius.only(
      topLeft:
          (booking.status != 'PENDING' && !showTimeInfo)
              ? const Radius.circular(20)
              : Radius.zero,
      topRight:
          (booking.status != 'PENDING' && !showTimeInfo)
              ? const Radius.circular(20)
              : Radius.zero,
      bottomLeft: const Radius.circular(20),
      bottomRight: const Radius.circular(20),
    );
  }

  /// Fungsi untuk memformat sisa waktu
  String _formatTimeRemaining(Duration duration) {
    // Perhitungan yang lebih akurat untuk selisih hari dan jam
    final days = duration.inDays;
    final hours = duration.inHours % 24;
    final minutes = duration.inMinutes % 60;

    if (days > 0) {
      if (hours > 0) {
        return '$days hari $hours jam';
      }
      return '$days hari';
    } else if (hours > 0) {
      if (minutes > 0) {
        return '$hours jam $minutes menit';
      }
      return '$hours jam';
    } else {
      return '$minutes menit';
    }
  }
}
