import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/providers/ticket_status_provider.dart';
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

  String _historyFilter = 'all';
  bool _isSyncing = false;
  Timer? _statusUpdateTimer;
  Timer? _syncTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    // Animation controller setup dengan durasi lebih cepat
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800), // Lebih cepat
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic), // Kurva yang lebih halus
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08), // Pergerakan lebih halus
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
      ),
    );

    // Start animation
    Future.delayed(const Duration(milliseconds: 50), () {
      _animationController.forward();
    });

    // Tab controller listener
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {});
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadBookings();
      _setupStatusSynchronization();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    _statusUpdateTimer?.cancel();
    _syncTimer?.cancel();
    super.dispose();
  }

  void _setupStatusSynchronization() async {
    await _synchronizeStatuses();
    _updateSyncTimer();
    _statusUpdateTimer = Timer.periodic(const Duration(minutes: 10), (_) {
      if (mounted) {
        _updateSyncTimer();
      }
    });
  }

  void _updateSyncTimer() {
    // Logika sama seperti sebelumnya
    // ...
  }

  Future<void> _synchronizeStatuses() async {
    // Logika sama seperti sebelumnya
    // ...
  }

  Future<void> _loadBookings() async {
    // Logika sama seperti sebelumnya
    // ...
  }

  Future<void> _refreshBookings() async {
    return _synchronizeStatuses();
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

    final upcomingTickets = categorizedTickets['upcoming'] ?? [];
    final allHistoryTickets = categorizedTickets['history'] ?? [];
    final historyTickets = ticketStatusProvider.filterHistoryTickets(
      allHistoryTickets,
      _historyFilter,
    );

    return Scaffold(
      body: Container(
        // Gradien yang lebih halus dan profesional
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Colors.white,
              Colors.blue.shade50,
              Colors.blue.shade100.withOpacity(0.3),
            ],
            stops: const [0.1, 0.6, 1.0], // Kontrol gradien lebih baik
          ),
        ),
        child: Stack(
          children: [
            // Elemen background dengan desain yang lebih halus
            Positioned(
              top: -60,
              right: -60,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.08), // Transparansi lebih halus
                ),
              ),
            ),
            Positioned(
              bottom: -90,
              left: -90,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.07),
                ),
              ),
            ),

            // Ikon kapal yang lebih subtle
            Positioned(
              top: size.height * 0.15,
              left: size.width * 0.1,
              child: Icon(
                Icons.sailing_outlined,
                size: 22,
                color: theme.primaryColor.withOpacity(0.15),
              ),
            ),
            Positioned(
              top: size.height * 0.3,
              right: size.width * 0.15,
              child: Icon(
                Icons.directions_boat_outlined,
                size: 26,
                color: theme.primaryColor.withOpacity(0.12),
              ),
            ),
            Positioned(
              bottom: size.height * 0.25,
              left: size.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 24,
                color: theme.primaryColor.withOpacity(0.09),
              ),
            ),

            // Main Content
            SafeArea(
              child: Column(
                children: [
                  // Custom App Bar dengan shadow halus
                  Container(
                    padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Tiket Saya',
                          style: TextStyle(
                            fontSize: 24, // Ukuran font yang lebih besar
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            letterSpacing: -0.5, // Kerning yang lebih rapat
                          ),
                        ),
                        const Spacer(),
                        // Indikator sinkronisasi yang diperbarui
                        _buildSyncIndicator(),
                      ],
                    ),
                  ),

                  // Custom Tab Bar yang diperbarui
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 12),
                    child: Container(
                      height: 62,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24), // Radius yang lebih besar
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.08),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                            spreadRadius: -2,
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(4.0), // Padding dalam
                        child: Row(
                          children: [
                            // Tab 1 - Akan Datang
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  _tabController.animateTo(0);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
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
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: theme.primaryColor,
                                            borderRadius: BorderRadius.circular(10),
                                            boxShadow: [
                                              BoxShadow(
                                                color: theme.primaryColor.withOpacity(0.2),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                                spreadRadius: -2,
                                              ),
                                            ],
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
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
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
                                        const SizedBox(width: 8),
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
                                            borderRadius: BorderRadius.circular(10),
                                            boxShadow: [
                                              BoxShadow(
                                                color: (_tabController.index == 1 ? theme.primaryColor : Colors.grey.shade400).withOpacity(0.2),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                                spreadRadius: -2,
                                              ),
                                            ],
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
                                  bookingProvider.isLoading
                                      ? Center(
                                        child: SizedBox(
                                          width: 40, 
                                          height: 40,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 3,
                                            valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                                          ),
                                        ),
                                      )
                                      : upcomingTickets.isEmpty
                                      ? _buildEmptyState('upcoming')
                                      : ListView.builder(
                                        padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
                                        itemCount: upcomingTickets.length,
                                        itemBuilder: (context, index) {
                                          final booking = upcomingTickets[index];
                                          final now = DateTime.now().toLocal();
                                          
                                          final departureDateTime =
                                              DateTimeHelper.combineDateAndTime(
                                                booking.departureDate,
                                                booking.schedule?.departureTime ?? "00:00",
                                              );
                                          
                                          final timeDifference =
                                              departureDateTime != null
                                                  ? departureDateTime.difference(now)
                                                  : null;

                                          return Padding(
                                            padding: const EdgeInsets.only(bottom: 20),
                                            child: Container(
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(24), // Radius yang lebih besar
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.grey.withOpacity(0.07),
                                                    blurRadius: 20,
                                                    offset: const Offset(0, 8),
                                                    spreadRadius: -2,
                                                  ),
                                                ],
                                              ),
                                              child: Column(
                                                children: [
                                                  // Status indikator yang diperbarui
                                                  _buildStatusBanner(
                                                    booking,
                                                    ticketStatusProvider,
                                                  ),

                                                  // Timer keberangkatan dengan desain yang lebih baik
                                                  if (timeDifference != null &&
                                                      !timeDifference.isNegative)
                                                    Container(
                                                      width: double.infinity,
                                                      padding: const EdgeInsets.symmetric(
                                                        vertical: 10,
                                                        horizontal: 18,
                                                      ),
                                                      decoration: BoxDecoration(
                                                        color:
                                                            booking.status == 'PENDING'
                                                                ? Colors.white
                                                                : theme.primaryColor.withOpacity(0.08),
                                                        borderRadius:
                                                            booking.status == 'PENDING'
                                                                ? BorderRadius.zero
                                                                : const BorderRadius.only(
                                                                  topLeft: Radius.circular(24),
                                                                  topRight: Radius.circular(24),
                                                                ),
                                                      ),
                                                      child: Row(
                                                        children: [
                                                          Icon(
                                                            Icons.access_time_rounded, // Icon yang lebih bulat
                                                            size: 16,
                                                            color: theme.primaryColor,
                                                          ),
                                                          const SizedBox(width: 10),
                                                          Text(
                                                            'Berangkat dalam ${_formatTimeRemaining(timeDifference)}',
                                                            style: TextStyle(
                                                              color: theme.primaryColor,
                                                              fontWeight: FontWeight.bold,
                                                              fontSize: 13, // Sedikit lebih besar
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),

                                                  // Ticket Card
                                                  ClipRRect(
                                                    borderRadius: _getTicketCardBorderRadius(
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

                        // History tickets
                        FadeTransition(
                          opacity: _fadeAnimation,
                          child: SlideTransition(
                            position: _slideAnimation,
                            child: RefreshIndicator(
                              onRefresh: _refreshBookings,
                              color: theme.primaryColor,
                              child: Column(
                                children: [
                                  // Filter chip yang ditingkatkan
                                  if (allHistoryTickets.isNotEmpty)
                                    _buildHistoryFilters(),

                                  // Content
                                  Expanded(
                                    child:
                                        bookingProvider.isLoading
                                            ? Center(
                                              child: SizedBox(
                                                width: 40, 
                                                height: 40,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 3,
                                                  valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                                                ),
                                              ),
                                            )
                                            : historyTickets.isEmpty
                                            ? _buildEmptyState(
                                              _historyFilter != 'all'
                                                  ? 'filtered_history'
                                                  : 'history',
                                            )
                                            : ListView.builder(
                                              padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
                                              itemCount: historyTickets.length,
                                              itemBuilder: (context, index) {
                                                final booking = historyTickets[index];
                                                final statusInfo =
                                                    ticketStatusProvider
                                                        .getStatusInfo(booking);

                                                return Padding(
                                                  padding: const EdgeInsets.only(bottom: 20),
                                                  child: Container(
                                                    decoration: BoxDecoration(
                                                      color: Colors.white,
                                                      borderRadius: BorderRadius.circular(24),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Colors.grey.withOpacity(0.07),
                                                          blurRadius: 20,
                                                          offset: const Offset(0, 8),
                                                          spreadRadius: -2,
                                                        ),
                                                      ],
                                                    ),
                                                    child: Column(
                                                      children: [
                                                        // Status banner yang ditingkatkan
                                                        _buildStatusBanner(
                                                          booking,
                                                          ticketStatusProvider,
                                                        ),

                                                        // Ticket Card
                                                        ClipRRect(
                                                          borderRadius: BorderRadius.only(
                                                            topLeft:
                                                                booking.status == 'PENDING' ||
                                                                        booking.status == 'CONFIRMED'
                                                                    ? Radius.zero
                                                                    : const Radius.circular(24),
                                                            topRight:
                                                                booking.status == 'PENDING' ||
                                                                        booking.status == 'CONFIRMED'
                                                                    ? Radius.zero
                                                                    : const Radius.circular(24),
                                                            bottomLeft: const Radius.circular(24),
                                                            bottomRight: const Radius.circular(24),
                                                          ),
                                                          child: Opacity(
                                                            opacity:
                                                                ['EXPIRED', 'CANCELLED', 'REFUNDED'].contains(booking.status)
                                                                    ? 0.75 // Sedikit lebih transparan
                                                                    : 1.0,
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
          ],
        ),
      ),
    );
  }

  /// Membangun indikator sinkronisasi yang lebih profesional
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
                  horizontal: 14,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(30), // Lebih bulat
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blue.shade100.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                      spreadRadius: -2,
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
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue.shade500),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Memperbarui...',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade600,
                        fontWeight: FontWeight.w500, // Lebih tebal
                      ),
                    ),
                  ],
                ),
              )
              : Tooltip(
                message:
                    'Terakhir diperbarui: ${DateTimeHelper.formatDate(lastSyncTime.toIso8601String())} ${formattedTime}',
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: Colors.grey.shade200, width: 1),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.update_rounded,
                        size: 12,
                        color: Colors.grey.shade500,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        formattedTime,
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
    );
  }

  /// Filter history yang diperbarui dengan tampilan lebih modern
  Widget _buildHistoryFilters() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        children: [
          _buildFilterChip('Semua', _historyFilter == 'all'),
          _buildFilterChip('Selesai', _historyFilter == 'completed'),
          _buildFilterChip('Kadaluarsa', _historyFilter == 'expired'),
          _buildFilterChip('Dibatalkan', _historyFilter == 'cancelled'),
          _buildFilterChip('Refund', _historyFilter == 'refunded'),
        ],
      ),
    );
  }

  /// Chip filter yang diperbarui dengan desain yang lebih modern
  Widget _buildFilterChip(String label, bool isSelected) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(right: 10.0),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: isSelected 
              ? theme.primaryColor.withOpacity(0.1) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected 
                ? theme.primaryColor.withOpacity(0.3) 
                : Colors.grey.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: InkWell(
          onTap: () {
            setState(
              () => _historyFilter =
                  label.toLowerCase() == 'semua'
                      ? 'all'
                      : label.toLowerCase(),
            );
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? theme.primaryColor : Colors.grey[700],
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 13,
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Banner status yang diperbarui dengan desain yang lebih modern
  Widget _buildStatusBanner(Booking booking, TicketStatusProvider provider) {
    final statusInfo = provider.getStatusInfo(booking);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 18),
      decoration: BoxDecoration(
        color: statusInfo.color.withOpacity(0.1),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
        boxShadow: [
          BoxShadow(
            color: statusInfo.color.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 1),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: statusInfo.color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              statusInfo.icon, 
              size: 14, 
              color: statusInfo.color,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            statusInfo.label,
            style: TextStyle(
              color: statusInfo.color,
              fontWeight: FontWeight.bold,
              fontSize: 13,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  /// Border radius untuk card tiket
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
              ? const Radius.circular(24)
              : Radius.zero,
      topRight:
          (booking.status != 'PENDING' && !showTimeInfo)
              ? const Radius.circular(24)
              : Radius.zero,
      bottomLeft: const Radius.circular(24),
      bottomRight: const Radius.circular(24),
    );
  }

  /// Empty state yang diperbarui
  Widget _buildEmptyState(String type) {
    final theme = Theme.of(context);

    IconData icon;
    String title;
    String message;

    switch (type) {
      case 'upcoming':
        icon = Icons.flight_takeoff_rounded;
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
              // Ikon dengan efek elevasi yang ditingkatkan
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: theme.primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      theme.primaryColor.withOpacity(0.15),
                      theme.primaryColor.withOpacity(0.05),
                    ],
                    radius: 0.8,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.05),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Icon(
                  icon, 
                  size: 70, 
                  color: theme.primaryColor.withOpacity(0.7),
                ),
              ),
              const SizedBox(height: 28),
              Text(
                title,
                style: TextStyle(
                  color: Colors.grey[800],
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 14),
              Text(
                message,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 16,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 35),
              // Tombol dengan efek hover dan shadow yang lebih halus
              Container(
                height: 54,
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
                        padding: const EdgeInsets.symmetric(horizontal: 28),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'PESAN TIKET SEKARANG',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(
                              Icons.arrow_forward_rounded,
                              color: Colors.white,
                              size: 18,
                            ),
                          ],
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

  /// Format waktu
  String _formatTimeRemaining(Duration duration) {
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