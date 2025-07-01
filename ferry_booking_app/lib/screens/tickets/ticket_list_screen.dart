import 'dart:math';

import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/providers/ticket_status_provider.dart'; // Provider baru
import 'package:ferry_booking_app/utils/date_time_helper.dart';
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

  String _historyFilter = 'all'; // Filter untuk riwayat tiket
  bool _isSyncing = false; // Status sinkronisasi
  Timer? _statusUpdateTimer;
  Timer? _syncTimer;
  bool _isInitialDataLoaded = false;

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

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
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

    _historyFilter = 'all';
    debugPrint('Filter awal: $_historyFilter');

    // Mulai animasi
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });

    // Gunakan satu post-frame callback untuk inisialisasi data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData(); // Ini sudah termasuk memanggil _setupStatusSynchronization()
    });
  }

  @override
  void dispose() {
    // Batalkan semua timer
    _statusUpdateTimer?.cancel();
    _syncTimer?.cancel();

    // Dispose controller
    _tabController.dispose();
    _animationController.dispose();

    super.dispose();
  }

  /// Setup timer untuk sinkronisasi status tiket
  void _setupStatusSynchronization() async {
    if (!mounted) return;

    // Sinkronisasi pertama kali dengan pemeriksaan mounted
    await _synchronizeStatuses();

    // Periksa mounted lagi setelah operasi asinkron
    if (!mounted) return;

    // Atur timer dengan pemeriksaan mounted
    _updateSyncTimer();

    // Setup timer untuk periodik
    _statusUpdateTimer = Timer.periodic(const Duration(minutes: 10), (_) {
      if (mounted) {
        _updateSyncTimer();
      }
    });
  }

  /// Update timer sinkronisasi berdasarkan keberangkatan terdekat
  void _updateSyncTimer() {
    if (!mounted) return;

    // Cancel timer yang ada
    _syncTimer?.cancel();

    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final ticketStatusProvider = Provider.of<TicketStatusProvider>(
      context,
      listen: false,
    );

    if (bookingProvider.bookings == null || bookingProvider.bookings!.isEmpty) {
      // PERBAIKAN: Jika tidak ada booking, atur interval sinkronisasi yang lebih lama
      _syncTimer = Timer.periodic(
        const Duration(minutes: 60), // Diperpanjang dari 30 menjadi 60 menit
        (_) => _synchronizeStatuses(),
      );
      return;
    }

    // Kategorikan tiket
    final categorized = ticketStatusProvider.categorizeTickets(
      bookingProvider.bookings!,
    );
    final upcomingTickets = categorized['upcoming'] ?? [];

    // PERBAIKAN: Jika tidak ada tiket upcoming, jangan terlalu sering sinkronisasi
    if (upcomingTickets.isEmpty) {
      _syncTimer = Timer.periodic(
        const Duration(minutes: 60), // Diperpanjang dari 30 menjadi 60 menit
        (_) => _synchronizeStatuses(),
      );
      return;
    }

    // Dapatkan waktu keberangkatan terdekat
    final closestDeparture = ticketStatusProvider.getClosestDepartureTime(
      upcomingTickets,
    );

    // PERBAIKAN: Atur interval sinkronisasi berdasarkan kedekatan waktu keberangkatan
    // dengan interval yang lebih panjang untuk mengurangi beban server
    if (closestDeparture != null) {
      final difference = closestDeparture.difference(DateTime.now());

      // PERBAIKAN: Kurangi frekuensi sinkronisasi untuk mengurangi beban server
      if (difference.inHours < 2) {
        // Jika kurang dari 2 jam, sync setiap 5 menit (bukan 2 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 5),
          (_) => _synchronizeStatuses(),
        );
      } else if (difference.inHours < 6) {
        // Jika kurang dari 6 jam, sync setiap 15 menit (bukan 5 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 15),
          (_) => _synchronizeStatuses(),
        );
      } else if (difference.inHours < 24) {
        // Jika kurang dari 24 jam, sync setiap 30 menit (bukan 15 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 30),
          (_) => _synchronizeStatuses(),
        );
      } else {
        // Jika lebih dari 24 jam, sync setiap 60 menit (bukan 30 menit)
        _syncTimer = Timer.periodic(
          const Duration(minutes: 60),
          (_) => _synchronizeStatuses(),
        );
      }
    } else {
      // Jika tidak ada tiket upcoming, sync setiap 60 menit (bukan 30 menit)
      _syncTimer = Timer.periodic(
        const Duration(minutes: 60),
        (_) => _synchronizeStatuses(),
      );
    }
  }

  /// Sinkronisasi status tiket dengan server
  Future<void> _synchronizeStatuses() async {
    if (!mounted || _isSyncing) return;

    // Set flag syncing
    if (mounted) {
      setState(() {
        _isSyncing = true;
      });
    }

    // PERBAIKAN: Tambahkan counter untuk membatasi percobaan ulang
    int _failedAttempts = 0;
    DateTime _lastErrorTime = DateTime.now().subtract(
      const Duration(minutes: 30),
    );

    // PERBAIKAN: Hentikan sinkronisasi jika terlalu banyak error dalam waktu singkat
    final now = DateTime.now();
    if (_failedAttempts > 3 && now.difference(_lastErrorTime).inMinutes < 10) {
      debugPrint(
        'Terlalu banyak kegagalan sinkronisasi. Menunggu sebelum mencoba lagi.',
      );
      if (mounted) {
        setState(() {
          _isSyncing = false;
        });
      }
      return;
    }

    try {
      // Dapatkan provider sebelum operasi asinkron
      final ticketStatusProvider =
          mounted
              ? Provider.of<TicketStatusProvider>(context, listen: false)
              : null;

      // Jika provider null, keluar dari fungsi
      if (ticketStatusProvider == null) return;

      // PERBAIKAN: Log percobaan sinkronisasi
      debugPrint('Mencoba sinkronisasi status tiket...');

      // Sinkronisasi dengan timeout
      await ticketStatusProvider.synchronizeTicketStatuses().timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          throw Exception('Sinkronisasi status melebihi batas waktu');
        },
      );

      // PERBAIKAN: Reset counter jika sukses
      _failedAttempts = 0;

      // Periksa mounted sebelum memuat ulang booking
      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 500));
        await _loadBookings();
      }
    } catch (e) {
      // PERBAIKAN: Catat waktu error dan tambah counter
      _lastErrorTime = DateTime.now();
      _failedAttempts++;

      debugPrint('Error synchronizing statuses: $e');
      debugPrint('Percobaan gagal ke-$_failedAttempts');

      // PERBAIKAN: Tambahkan penanganan khusus untuk error format JSON
      if (e.toString().contains('FormatException')) {
        debugPrint(
          'Terdeteksi error format JSON. Mengurangi frekuensi sinkronisasi.',
        );

        // Modifikasi timer sinkronisasi untuk mengurangi beban server
        _syncTimer?.cancel();
        _syncTimer = Timer.periodic(
          const Duration(minutes: 60), // Memperpanjang waktu ke 60 menit
          (_) => _synchronizeStatuses(),
        );
      }
    } finally {
      // Reset flag syncing hanya jika masih mounted
      if (mounted) {
        setState(() {
          _isSyncing = false;
        });
      }
    }
  }

  Future<void> _loadBookings() async {
    if (!mounted) return;

    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    await bookingProvider.getBookings();

    // Log hanya jika masih mounted
    if (mounted && bookingProvider.bookings != null) {
      debugPrint('Loaded ${bookingProvider.bookings!.length} bookings');
    }
  }

  Future<void> _refreshBookings() async {
    return _synchronizeStatuses();
  }

  Future<void> _loadInitialData() async {
    if (!mounted) return;

    try {
      // Dapatkan provider saat widget masih mounted
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );

      // Panggil getBookings dengan try-catch dan pemeriksaan mounted
      try {
        await bookingProvider.getBookings().timeout(
          const Duration(seconds: 10),
          onTimeout: () {
            throw Exception('Timeout saat memuat data tiket');
          },
        );

        // Periksa mounted sebelum update state
        if (mounted) {
          setState(() {
            _isInitialDataLoaded = true;
          });
        }
      } catch (error) {
        debugPrint('Error loading bookings: $error');
        if (mounted) {
          setState(() {
            _isInitialDataLoaded = true;
          });
        }
      }

      // Periksa mounted sebelum setup sinkronisasi
      if (mounted) {
        _setupStatusSynchronization();
      }
    } catch (e) {
      debugPrint('Error loading initial data: $e');
      if (mounted) {
        setState(() {
          _isInitialDataLoaded = true;
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

      // PERBAIKAN: Validasi tanggal yang lebih kuat
      if (aDepartureDateTime == null && bDepartureDateTime == null) {
        // Jika keduanya null, gunakan ID booking untuk tetap konsisten
        return a.id.compareTo(b.id);
      } else if (aDepartureDateTime == null) {
        return 1; // Tempatkan yang null di akhir
      } else if (bDepartureDateTime == null) {
        return -1; // Tempatkan yang null di akhir
      }

      return aDepartureDateTime.compareTo(bDepartureDateTime);
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final ticketStatusProvider = Provider.of<TicketStatusProvider>(context);
    final bookings = bookingProvider.bookings;
    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);
    final now = DateTime.now();

    // Kategorikan tiket
    final Map<String, List<Booking>> categorizedTickets =
        bookings != null
            ? ticketStatusProvider.categorizeTickets(bookings)
            : {'upcoming': [], 'history': []};

    // Mendapatkan dan mengurutkan tiket yang akan datang
    final List<Booking> upcomingTickets = _sortUpcomingTickets(
      categorizedTickets['upcoming'] ?? [],
    );

    final allHistoryTickets = categorizedTickets['history'] ?? [];

    // Filter tiket riwayat berdasarkan pilihan filter
    final historyTickets = ticketStatusProvider.filterHistoryTickets(
      allHistoryTickets,
      _historyFilter,
    );

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
            // Background elements (tidak berubah)
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

            // Small boat icons in the background (tidak berubah)
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
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color:
                                      _tabController.index == 0
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
                                        fontWeight:
                                            _tabController.index == 0
                                                ? FontWeight.bold
                                                : FontWeight.normal,
                                        color:
                                            _tabController.index == 0
                                                ? theme.primaryColor
                                                : Colors.grey.shade600,
                                        fontSize: 15,
                                      ),
                                    ),
                                    if (upcomingTickets.isNotEmpty) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: theme.primaryColor,
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                        ),
                                        child: Text(
                                          '${upcomingTickets.length}',
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
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color:
                                      _tabController.index == 1
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
                                        fontWeight:
                                            _tabController.index == 1
                                                ? FontWeight.bold
                                                : FontWeight.normal,
                                        color:
                                            _tabController.index == 1
                                                ? theme.primaryColor
                                                : Colors.grey.shade600,
                                        fontSize: 15,
                                      ),
                                    ),
                                    if (allHistoryTickets.isNotEmpty) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color:
                                              _tabController.index == 1
                                                  ? theme.primaryColor
                                                  : Colors.grey.shade400,
                                          borderRadius: BorderRadius.circular(
                                            10,
                                          ),
                                        ),
                                        child: Text(
                                          '${allHistoryTickets.length}',
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
                              child:
                                  upcomingTickets.isEmpty
                                      ? _buildEmptyState('upcoming')
                                      : ListView.builder(
                                        padding: const EdgeInsets.all(24.0),
                                        itemCount: upcomingTickets.length,
                                        itemBuilder: (context, index) {
                                          final booking =
                                              upcomingTickets[index];

                                          // Perhitungan waktu keberangkatan
                                          final now = DateTime.now().toLocal();
                                          debugPrint(
                                            'Format tanggal keberangkatan: ${booking.departureDate}',
                                          );
                                          debugPrint(
                                            'Format waktu keberangkatan: ${booking.schedule?.departureTime}',
                                          );

                                          final departureDateTime =
                                              DateTimeHelper.combineDateAndTime(
                                                booking.departureDate,
                                                booking
                                                        .schedule
                                                        ?.departureTime ??
                                                    "00:00", // Gunakan waktu default jika null
                                              );
                                          debugPrint(
                                            'Tanggal keberangkatan: ${departureDateTime?.toString()}',
                                          );

                                          if (departureDateTime != null) {
                                            final difference = departureDateTime
                                                .difference(now);
                                            debugPrint(
                                              'Selisih dalam hari: ${difference.inDays}',
                                            );
                                            debugPrint(
                                              'Selisih dalam jam: ${difference.inHours}',
                                            );
                                            debugPrint(
                                              'Selisih dalam menit: ${difference.inMinutes}',
                                            );
                                            debugPrint(
                                              'Format waktu: ${_formatTimeRemaining(difference)}',
                                            );
                                          }

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
                                                          .isNegative)
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

                        // History tickets with filtering
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: SlideTransition(
                            position: _slideAnimation,
                            child: RefreshIndicator(
                              onRefresh: _refreshBookings,
                              color: theme.primaryColor,
                              child: Column(
                                children: [
                                  // History filter chips
                                  if (allHistoryTickets.isNotEmpty)
                                    _buildHistoryFilters(),

                                  // Content
                                  Expanded(
                                    child:
                                        historyTickets.isEmpty
                                            ? _buildEmptyState(
                                              _historyFilter != 'all'
                                                  ? 'filtered_history'
                                                  : 'history',
                                            )
                                            : ListView.builder(
                                              padding: const EdgeInsets.all(
                                                24.0,
                                              ),
                                              itemCount: historyTickets.length,
                                              itemBuilder: (context, index) {
                                                final booking =
                                                    historyTickets[index];
                                                ticketStatusProvider
                                                    .getStatusInfo(booking);

                                                return Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                        bottom: 16,
                                                      ),
                                                  child: Container(
                                                    decoration: BoxDecoration(
                                                      color: Colors.white,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            20,
                                                          ),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Colors.grey
                                                              .withOpacity(0.1),
                                                          blurRadius: 15,
                                                          offset: const Offset(
                                                            0,
                                                            5,
                                                          ),
                                                          spreadRadius: -5,
                                                        ),
                                                      ],
                                                    ),
                                                    child: Column(
                                                      children: [
                                                        // Ticket Card
                                                        ClipRRect(
                                                          borderRadius: BorderRadius.only(
                                                            topLeft:
                                                                booking.status ==
                                                                            'PENDING' ||
                                                                        booking.status ==
                                                                            'CONFIRMED'
                                                                    ? Radius
                                                                        .zero
                                                                    : const Radius.circular(
                                                                      20,
                                                                    ),
                                                            topRight:
                                                                booking.status ==
                                                                            'PENDING' ||
                                                                        booking.status ==
                                                                            'CONFIRMED'
                                                                    ? Radius
                                                                        .zero
                                                                    : const Radius.circular(
                                                                      20,
                                                                    ),
                                                            bottomLeft:
                                                                const Radius.circular(
                                                                  20,
                                                                ),
                                                            bottomRight:
                                                                const Radius.circular(
                                                                  20,
                                                                ),
                                                          ),
                                                          child: Column(
                                                            children: [
                                                              // Ticket card dengan opacity yang disesuaikan
                                                              Opacity(
                                                                opacity:
                                                                    [
                                                                              'EXPIRED',
                                                                              'CANCELLED',
                                                                              'REFUNDED',
                                                                            ].contains(
                                                                              booking.status,
                                                                            ) ||
                                                                            (DateTimeHelper.isExpired(
                                                                                  booking.departureDate,
                                                                                  booking.schedule?.departureTime ??
                                                                                      '',
                                                                                ) &&
                                                                                [
                                                                                  'CONFIRMED',
                                                                                  'PENDING',
                                                                                ].contains(
                                                                                  booking.status,
                                                                                ))
                                                                        ? 0.7
                                                                        : 1.0,
                                                                child: TicketCard(
                                                                  booking:
                                                                      booking,
                                                                  onTap: () {
                                                                    Navigator.pushNamed(
                                                                      context,
                                                                      '/tickets/detail',
                                                                      arguments:
                                                                          booking
                                                                              .id,
                                                                    );
                                                                  },
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                );
                                              },
                                            ),
                                  ),
                                ],
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
            // Indikator sinkronisasi kecil di sudut kanan atas
            if (_isSyncing)
              Positioned(
                top: MediaQuery.of(context).padding.top + 8,
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
                        width: 10,
                        height: 10,
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

  /// Membangun indikator sinkronisasi
  Widget _buildSyncIndicator() {
    final ticketStatusProvider = Provider.of<TicketStatusProvider>(
      context,
      listen: false,
    );
    final lastSyncTime = ticketStatusProvider.lastSyncTime;
    final formattedTime = DateTimeHelper.formatTime(
      lastSyncTime.toIso8601String(),
    );

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child:
          _isSyncing
              ? Container(
                key: const ValueKey('syncing'),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 12,
                      height: 12,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Memperbarui...',
                      style: TextStyle(fontSize: 12, color: Colors.blue),
                    ),
                  ],
                ),
              )
              : Tooltip(
                message:
                    'Terakhir diperbarui: ${DateTimeHelper.formatDate(lastSyncTime.toIso8601String())} ${formattedTime}',
                child: const SizedBox.shrink(key: ValueKey('not_syncing')),
              ),
    );
  }

  /// Membangun filter untuk riwayat tiket
  Widget _buildHistoryFilters() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
        child: Row(
          children: [
            _buildFilterChip('Semua', _historyFilter == 'all'),
            _buildFilterChip('Selesai', _historyFilter == 'completed'),
            _buildFilterChip('Kadaluarsa', _historyFilter == 'expired'),
            _buildFilterChip('Dibatalkan', _historyFilter == 'cancelled'),
            _buildFilterChip('Refund', _historyFilter == 'refunded'),
          ],
        ),
      ),
    );
  }

  /// Membangun chip filter dengan badge jumlah tiket
  Widget _buildFilterChip(String label, bool isSelected) {
    final theme = Theme.of(context);
    final bookingProvider = Provider.of<BookingProvider>(context);
    final ticketStatusProvider = Provider.of<TicketStatusProvider>(context);
    final bookings = bookingProvider.bookings;

    // Mapping label UI ke nilai filter
    final String filterValue = _getFilterValueFromLabel(label);

    // Hitung jumlah tiket untuk setiap kategori
    int count = 0;
    if (bookings != null) {
      final categorized = ticketStatusProvider.categorizeTickets(bookings);
      final historyTickets = categorized['history'] ?? [];

      if (filterValue == 'all') {
        count = historyTickets.length;
      } else {
        count =
            ticketStatusProvider
                .filterHistoryTickets(historyTickets, filterValue)
                .length;
      }
    }

    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label),
            if (count > 0) ...[
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? theme.primaryColor : Colors.grey[400],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        selected: isSelected,
        selectedColor: theme.primaryColor.withOpacity(0.2),
        labelStyle: TextStyle(
          color: isSelected ? theme.primaryColor : Colors.grey[700],
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        onSelected: (selected) {
          if (selected) {
            setState(() {
              _historyFilter = filterValue;
              debugPrint('Filter diubah ke: $_historyFilter');
            });
          }
        },
      ),
    );
  }

  String _getFilterValueFromLabel(String label) {
    switch (label) {
      case 'Semua':
        return 'all';
      case 'Selesai':
        return 'completed';
      case 'Kadaluarsa':
        return 'expired';
      case 'Dibatalkan':
        return 'cancelled';
      case 'Refund':
        return 'refunded';
      default:
        return 'all';
    }
  }

  /// Membangun banner status
  Widget _buildStatusBanner(Booking booking, TicketStatusProvider provider) {
    final statusInfo = provider.getStatusInfo(booking);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: statusInfo.color.withOpacity(0.1),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          Icon(statusInfo.icon, size: 16, color: statusInfo.color),
          const SizedBox(width: 8),
          Text(
            statusInfo.label,
            style: TextStyle(
              color: statusInfo.color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
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

  /// Membangun tampilan kosong
  Widget _buildEmptyState(String type) {
    final theme = Theme.of(context);

    IconData icon;
    String title;
    String message;

    switch (type) {
      case 'upcoming':
        icon = Icons.directions_ferry;
        title = 'Belum Ada Tiket';
        message =
            'Belum ada tiket untuk perjalanan mendatang.\nJelajahi tujuan baru dan pesan tiket sekarang!';
        break;
      case 'filtered_history':
        icon = Icons.filter_list_rounded;
        title = 'Tidak Ada Data';
        message =
            'Tidak ada tiket dengan filter yang dipilih.\nCoba pilih filter lain untuk melihat riwayat perjalanan.';
        break;
      case 'history':
      default:
        icon = Icons.history_rounded;
        title = 'Belum Ada Riwayat';
        message =
            'Belum ada riwayat perjalanan.\nMulai petualangan pertama Anda dengan memesan tiket!';
        break;
    }

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
                child: Icon(icon, size: 70, color: theme.primaryColor),
              ),
              const SizedBox(height: 24),
              Text(
                title,
                style: TextStyle(
                  color: Colors.grey[800],
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
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

  /// Fungsi untuk memformat sisa waktu
  String _formatTimeRemaining(Duration duration) {
    // PERBAIKAN: Penanganan durasi negatif
    if (duration.isNegative) {
      return "Jadwal keberangkatan terlewat";
    }

    // Perhitungan yang lebih akurat untuk selisih hari dan jam
    final days = duration.inDays;
    final hours = duration.inHours % 24;
    final minutes = duration.inMinutes % 60;

    // PERBAIKAN: Format yang lebih mudah dibaca
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
    } else if (minutes > 0) {
      return '$minutes menit';
    } else {
      return 'kurang dari 1 menit';
    }
  }
}
