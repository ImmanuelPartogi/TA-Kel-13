import 'dart:async';
import 'dart:convert';

import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'dart:typed_data';
import 'package:flutter/services.dart';

class TicketDetailScreen extends StatefulWidget {
  final int bookingId;

  const TicketDetailScreen({Key? key, required this.bookingId})
    : super(key: key);

  @override
  _TicketDetailScreenState createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen>
    with SingleTickerProviderStateMixin {
  bool _isLoading = false;
  int _selectedTicketIndex = 0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _showTicketDetails = false;
  Timer? _paymentStatusTimer;
  bool _isCheckingStatus = false;

  @override
  void initState() {
    super.initState();
    _loadTicketDetails();

    // Start auto-refresh for pending payment status
    _startPaymentStatusTimer();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    // Delay showing ticket details for smoother animation
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) {
        setState(() {
          _showTicketDetails = true;
        });
        _animationController.forward();
      }
    });
  }

  @override
  void dispose() {
    _paymentStatusTimer?.cancel();
    _animationController.dispose();
    super.dispose();
  }

  void _startPaymentStatusTimer() {
    // Check booking status every 30 seconds if still pending
    _paymentStatusTimer = Timer.periodic(const Duration(seconds: 30), (
      timer,
    ) async {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final booking = bookingProvider.currentBooking;

      if (booking != null && booking.status == 'PENDING') {
        // Refresh without loading indicator
        await bookingProvider.refreshPaymentStatus(booking.bookingCode);
      } else {
        // Stop timer if booking is no longer pending
        timer.cancel();
      }
    });
  }

  Future<void> _loadTicketDetails() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      await bookingProvider.getBookingDetails(widget.bookingId);
    } catch (e) {
      _showSnackBar('Gagal memuat detail tiket: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _cancelBooking() async {
    final result =
        await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24.0),
                ),
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.cancel_outlined,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Flexible(child: Text('Batalkan Pemesanan?')),
                  ],
                ),
                content: const Text(
                  'Apakah Anda yakin ingin membatalkan pemesanan ini? Proses ini tidak dapat dibatalkan.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Tidak'),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.grey[600],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.red,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                    ),
                    child: const Text('Ya, Batalkan'),
                  ),
                ],
              ),
        ) ??
        false;

    if (result) {
      setState(() {
        _isLoading = true;
      });

      try {
        final bookingProvider = Provider.of<BookingProvider>(
          context,
          listen: false,
        );
        final success = await bookingProvider.cancelBooking(widget.bookingId);

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: const [
                  Icon(Icons.check_circle, color: Colors.white),
                  SizedBox(width: 10),
                  Text('Pemesanan berhasil dibatalkan'),
                ],
              ),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  void _showSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.info_outline, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(child: Text(message)),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          margin: const EdgeInsets.all(10),
          duration: const Duration(seconds: 3),
          backgroundColor: Colors.black87,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    final isSmallScreen = size.width < 360;

    // Ukuran responsif untuk font dan padding
    final headerTitleSize = isSmallScreen ? 20.0 : 22.0;
    final standardPadding = isSmallScreen ? 16.0 : 20.0;
    final standardFontSize = isSmallScreen ? 15.0 : 16.0;

    if (_isLoading) {
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
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
                ),
                const SizedBox(height: 20),
                Text(
                  'Memuat detail tiket...',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (booking == null) {
      return Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          title: const Text('Detail Tiket'),
          backgroundColor: Colors.transparent,
          elevation: 0,
          foregroundColor: Colors.black87,
          leading: IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.arrow_back),
            ),
            onPressed: () => Navigator.pop(context),
          ),
        ),
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
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(25),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.error_outline_rounded,
                    size: 70,
                    color: Colors.grey[400],
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Tiket tidak ditemukan',
                  style: TextStyle(
                    color: Colors.grey[800],
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  child: Text(
                    'Maaf, kami tidak dapat menemukan detail tiket yang Anda cari',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey[600], fontSize: 16),
                  ),
                ),
                const SizedBox(height: 30),
                ElevatedButton.icon(
                  onPressed: _loadTicketDetails,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Coba Lagi'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Format date
    final locale = 'id_ID';
    final dateFormat = DateFormat('dd MMMM yyyy', locale);
    final timeFormat = DateFormat('HH:mm', locale);
    final bookingDate = DateTime.parse(booking.departureDate).toLocal();
    // Parse departureTime menjadi DateTime jika formatnya ISO
    final departureTimeString = booking.schedule?.departureTime ?? '';
    DateTime? parseDateTime(String dateStr, String timeStr) {
      try {
        final date = DateTime.parse(dateStr);

        // Standarisasi format waktu
        if (timeStr.contains('T')) {
          // Format ISO
          final time = DateTime.parse(timeStr);
          return DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        } else if (timeStr.contains(':')) {
          // Format HH:MM atau HH:MM:SS
          final parts = timeStr.split(':');
          if (parts.length >= 2) {
            final hour = int.tryParse(parts[0]) ?? 0;
            final minute = int.tryParse(parts[1]) ?? 0;

            return DateTime(date.year, date.month, date.day, hour, minute);
          }
        }

        // Fallback ke tanggal saja jika waktu tidak bisa di-parse
        return date;
      } catch (e) {
        print("Error parsing date/time: $e");
        return null;
      }
    }

    // Gunakan fungsi ini di build:
    DateTime? departureDateTime = DateTimeHelper.combineDateAndTime(
      booking.departureDate,
      departureTimeString,
    );

    // Check if can be cancelled
    final now = DateTime.now();
    final isWithin24Hours = bookingDate.difference(now).inHours <= 24;
    final canCancel = booking.status == 'PENDING' && !isWithin24Hours;
    final canRefund = booking.status == 'CONFIRMED' && !isWithin24Hours;

    // Get all tickets
    final tickets = booking.tickets ?? [];
    final hasMultipleTickets = tickets.length > 1;

    // Get selected ticket
    final selectedTicket =
        tickets.isNotEmpty && _selectedTicketIndex < tickets.length
            ? tickets[_selectedTicketIndex]
            : null;

    // Check if booking is still in PENDING status
    final isPending = booking.status == 'PENDING';

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(
          'Detail Perjalanan',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back, color: Colors.white),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              _getStatusColorGradient(booking.status),
              _getStatusColorGradient(booking.status).withOpacity(0.8),
              Colors.white,
            ],
            stops: const [0.0, 0.4, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // Background decorative elements
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
            ),

            Positioned(
              bottom: -80,
              left: -80,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.05),
                ),
              ),
            ),

            // Boat icons in background
            Positioned(
              top: size.height * 0.2,
              left: size.width * 0.1,
              child: Icon(
                Icons.sailing_outlined,
                size: 24,
                color: Colors.white.withOpacity(0.2),
              ),
            ),

            Positioned(
              top: size.height * 0.4,
              right: size.width * 0.15,
              child: Icon(
                Icons.directions_boat_outlined,
                size: 28,
                color: Colors.white.withOpacity(0.15),
              ),
            ),

            Positioned(
              bottom: size.height * 0.25,
              left: size.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 24,
                color: theme.primaryColor.withOpacity(0.1),
              ),
            ),

            // Main content
            CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // Header with status
                SliverToBoxAdapter(
                  child: Container(
                    padding: EdgeInsets.only(
                      top: MediaQuery.of(context).padding.top + 70,
                      bottom: 24,
                      left: standardPadding,
                      right: standardPadding,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                _getStatusIcon(booking.status),
                                color: Colors.white,
                                size: 30,
                              ),
                            ),
                            const SizedBox(width: 20),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _getStatusText(booking.status),
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: headerTitleSize,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    _getStatusDescription(booking.status),
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.95),
                                      fontSize: 14,
                                    ),
                                    maxLines: 2, // Lebih baik dari truncate
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 30),

                        // Kode Booking Info
                        Center(
                          child: LayoutBuilder(
                            // Menggunakan LayoutBuilder untuk adaptivitas
                            builder: (context, constraints) {
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.3),
                                    width: 1,
                                  ),
                                ),
                                child:
                                    constraints.maxWidth < 280
                                        ? Column(
                                          // Mode vertikal untuk layar sempit
                                          children: [
                                            const Text(
                                              'Kode Booking:',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 14,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              booking.bookingCode,
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                              ),
                                            ),
                                          ],
                                        )
                                        : Text(
                                          // Mode reguler
                                          'Kode Booking: ${booking.bookingCode}',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                              );
                            },
                          ),
                        ),

                        const SizedBox(height: 30),

                        // Journey Card
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              // Route Info - Layout responsif
                              LayoutBuilder(
                                builder: (context, constraints) {
                                  // Jika layar sangat sempit, gunakan layout vertikal
                                  if (constraints.maxWidth < 250) {
                                    return Column(
                                      children: [
                                        // Origin
                                        Column(
                                          children: [
                                            Text(
                                              booking.schedule?.route?.origin ??
                                                  '',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                                color: Colors.black87,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                            const SizedBox(height: 4),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 3,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: theme.primaryColor
                                                    .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                              child: Text(
                                                'Keberangkatan',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                  color: theme.primaryColor,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),

                                        // Arrow
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 12.0,
                                          ),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              Container(
                                                height: 2,
                                                width: 60,
                                                decoration: BoxDecoration(
                                                  color: theme.primaryColor
                                                      .withOpacity(0.3),
                                                  borderRadius:
                                                      BorderRadius.circular(1),
                                                ),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: theme.primaryColor
                                                      .withOpacity(0.1),
                                                  shape: BoxShape.circle,
                                                ),
                                                child: Icon(
                                                  Icons
                                                      .arrow_downward, // Arah panah berubah jadi ke bawah
                                                  color: theme.primaryColor,
                                                  size: 20,
                                                ),
                                              ),
                                              Container(
                                                height: 2,
                                                width: 60,
                                                decoration: BoxDecoration(
                                                  color: theme.primaryColor
                                                      .withOpacity(0.3),
                                                  borderRadius:
                                                      BorderRadius.circular(1),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),

                                        // Destination
                                        Column(
                                          children: [
                                            Text(
                                              booking
                                                      .schedule
                                                      ?.route
                                                      ?.destination ??
                                                  '',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                                color: Colors.black87,
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                            const SizedBox(height: 4),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 3,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: theme.primaryColor
                                                    .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                              child: Text(
                                                'Tujuan',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                  color: theme.primaryColor,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    );
                                  } else {
                                    // Layout horizontal standar untuk layar normal
                                    return Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                booking
                                                        .schedule
                                                        ?.route
                                                        ?.origin ??
                                                    '',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 18,
                                                  color: Colors.black87,
                                                ),
                                                maxLines:
                                                    2, // Biarkan lebih dari satu baris jika perlu
                                              ),
                                              const SizedBox(height: 4),
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 3,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: theme.primaryColor
                                                      .withOpacity(0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                ),
                                                child: Text(
                                                  'Keberangkatan',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w500,
                                                    color: theme.primaryColor,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),

                                        // Arrow
                                        Column(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(10),
                                              decoration: BoxDecoration(
                                                color: theme.primaryColor
                                                    .withOpacity(0.1),
                                                shape: BoxShape.circle,
                                              ),
                                              child: Icon(
                                                Icons.arrow_forward,
                                                color: theme.primaryColor,
                                                size: 20,
                                              ),
                                            ),
                                            const SizedBox(height: 5),
                                            Container(
                                              height: 2,
                                              width: 60,
                                              decoration: BoxDecoration(
                                                color: theme.primaryColor
                                                    .withOpacity(0.3),
                                                borderRadius:
                                                    BorderRadius.circular(1),
                                              ),
                                            ),
                                          ],
                                        ),

                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.end,
                                            children: [
                                              Text(
                                                booking
                                                        .schedule
                                                        ?.route
                                                        ?.destination ??
                                                    '',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 18,
                                                  color: Colors.black87,
                                                ),
                                                textAlign: TextAlign.right,
                                                maxLines:
                                                    2, // Biarkan lebih dari satu baris jika perlu
                                              ),
                                              const SizedBox(height: 4),
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 8,
                                                      vertical: 3,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: theme.primaryColor
                                                      .withOpacity(0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                ),
                                                child: Text(
                                                  'Tujuan',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w500,
                                                    color: theme.primaryColor,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    );
                                  }
                                },
                              ),

                              const SizedBox(height: 24),

                              // Date and Time - Layout responsif yang ditingkatkan
                              LayoutBuilder(
                                builder: (context, constraints) {
                                  // Gunakan layout vertikal untuk layar sangat sempit
                                  if (constraints.maxWidth < 270) {
                                    return Column(
                                      children: [
                                        // Date Card - Desain yang ditingkatkan
                                        Container(
                                          padding: const EdgeInsets.all(16),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withOpacity(
                                                  0.05,
                                                ),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                            border: Border.all(
                                              color: theme.primaryColor
                                                  .withOpacity(0.1),
                                              width: 1.5,
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  gradient: LinearGradient(
                                                    colors: [
                                                      theme.primaryColor
                                                          .withOpacity(0.8),
                                                      theme.primaryColor
                                                          .withOpacity(0.6),
                                                    ],
                                                    begin: Alignment.topLeft,
                                                    end: Alignment.bottomRight,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: theme.primaryColor
                                                          .withOpacity(0.2),
                                                      blurRadius: 5,
                                                      offset: const Offset(
                                                        0,
                                                        2,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.calendar_today_rounded,
                                                  color: Colors.white,
                                                  size: 20,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      'Tanggal',
                                                      style: TextStyle(
                                                        color: Colors.grey[600],
                                                        fontSize: 13,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 4),
                                                    Text(
                                                      dateFormat.format(
                                                        bookingDate,
                                                      ),
                                                      style: TextStyle(
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 16,
                                                        color: Colors.grey[800],
                                                        letterSpacing: 0.5,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),

                                        const SizedBox(height: 12),

                                        // Time Card - Desain yang ditingkatkan
                                        Container(
                                          padding: const EdgeInsets.all(16),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withOpacity(
                                                  0.05,
                                                ),
                                                blurRadius: 8,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                            border: Border.all(
                                              color: theme.primaryColor
                                                  .withOpacity(0.1),
                                              width: 1.5,
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  gradient: LinearGradient(
                                                    colors: [
                                                      theme.primaryColor
                                                          .withOpacity(0.8),
                                                      theme.primaryColor
                                                          .withOpacity(0.6),
                                                    ],
                                                    begin: Alignment.topLeft,
                                                    end: Alignment.bottomRight,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: theme.primaryColor
                                                          .withOpacity(0.2),
                                                      blurRadius: 5,
                                                      offset: const Offset(
                                                        0,
                                                        2,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.access_time_rounded,
                                                  color: Colors.white,
                                                  size: 20,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      'Waktu',
                                                      style: TextStyle(
                                                        color: Colors.grey[600],
                                                        fontSize: 13,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 4),
                                                    Text(
                                                      departureDateTime != null
                                                          ? timeFormat.format(
                                                            departureDateTime,
                                                          )
                                                          : DateTimeHelper.formatTime(
                                                            departureTimeString,
                                                          ),
                                                      style: TextStyle(
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        fontSize: 16,
                                                        color: Colors.grey[800],
                                                        letterSpacing: 0.5,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    );
                                  } else {
                                    // Layout horizontal dengan desain yang ditingkatkan
                                    return Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(16),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(
                                              0.05,
                                            ),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                            spreadRadius: 1,
                                          ),
                                        ],
                                        border: Border.all(
                                          color: theme.primaryColor.withOpacity(
                                            0.1,
                                          ),
                                          width: 1.5,
                                        ),
                                      ),
                                      child: IntrinsicHeight(
                                        child: Row(
                                          children: [
                                            // Date Section
                                            Expanded(
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.all(
                                                          10,
                                                        ),
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        colors: [
                                                          theme.primaryColor
                                                              .withOpacity(0.8),
                                                          theme.primaryColor
                                                              .withOpacity(0.6),
                                                        ],
                                                        begin:
                                                            Alignment.topLeft,
                                                        end:
                                                            Alignment
                                                                .bottomRight,
                                                      ),
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            12,
                                                          ),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: theme
                                                              .primaryColor
                                                              .withOpacity(0.2),
                                                          blurRadius: 5,
                                                          offset: const Offset(
                                                            0,
                                                            2,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    child: const Icon(
                                                      Icons
                                                          .calendar_today_rounded,
                                                      color: Colors.white,
                                                      size: 20,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      children: [
                                                        Text(
                                                          'Tanggal',
                                                          style: TextStyle(
                                                            color:
                                                                Colors
                                                                    .grey[600],
                                                            fontSize: 13,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                        const SizedBox(
                                                          height: 4,
                                                        ),
                                                        Text(
                                                          dateFormat.format(
                                                            bookingDate,
                                                          ),
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            fontSize: 16,
                                                            color:
                                                                Colors
                                                                    .grey[800],
                                                            letterSpacing: 0.5,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),

                                            // Divider
                                            Container(
                                              height: 45,
                                              width: 1.5,
                                              margin:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 16,
                                                  ),
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  colors: [
                                                    Colors.grey.withOpacity(
                                                      0.05,
                                                    ),
                                                    Colors.grey.withOpacity(
                                                      0.3,
                                                    ),
                                                    Colors.grey.withOpacity(
                                                      0.05,
                                                    ),
                                                  ],
                                                  begin: Alignment.topCenter,
                                                  end: Alignment.bottomCenter,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(1),
                                              ),
                                            ),

                                            // Time Section
                                            Expanded(
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.all(
                                                          10,
                                                        ),
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        colors: [
                                                          theme.primaryColor
                                                              .withOpacity(0.8),
                                                          theme.primaryColor
                                                              .withOpacity(0.6),
                                                        ],
                                                        begin:
                                                            Alignment.topLeft,
                                                        end:
                                                            Alignment
                                                                .bottomRight,
                                                      ),
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            12,
                                                          ),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: theme
                                                              .primaryColor
                                                              .withOpacity(0.2),
                                                          blurRadius: 5,
                                                          offset: const Offset(
                                                            0,
                                                            2,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    child: const Icon(
                                                      Icons.access_time_rounded,
                                                      color: Colors.white,
                                                      size: 20,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      children: [
                                                        Text(
                                                          'Waktu',
                                                          style: TextStyle(
                                                            color:
                                                                Colors
                                                                    .grey[600],
                                                            fontSize: 13,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                          ),
                                                        ),
                                                        const SizedBox(
                                                          height: 4,
                                                        ),
                                                        Text(
                                                          departureDateTime !=
                                                                  null
                                                              ? timeFormat.format(
                                                                departureDateTime,
                                                              )
                                                              : departureTimeString,
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            fontSize: 16,
                                                            color:
                                                                Colors
                                                                    .grey[800],
                                                            letterSpacing: 0.5,
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
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Content
                SliverToBoxAdapter(
                  child: AnimatedBuilder(
                    animation: _fadeAnimation,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _showTicketDetails ? _fadeAnimation.value : 0,
                        child: child,
                      );
                    },
                    child: Container(
                      decoration: const BoxDecoration(color: Colors.white),
                      padding: EdgeInsets.symmetric(
                        horizontal: standardPadding,
                        vertical: 24,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Travel Info Card
                          _buildSectionHeader(
                            'Informasi Perjalanan',
                            Icons.directions_boat_rounded,
                          ),
                          const SizedBox(height: 16),

                          Card(
                            elevation: 0,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: BorderSide(
                                color: Colors.grey[200]!,
                                width: 1.5,
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 52,
                                        height: 52,
                                        decoration: BoxDecoration(
                                          color: theme.primaryColor.withOpacity(
                                            0.1,
                                          ),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          Icons.directions_boat_rounded,
                                          color: theme.primaryColor,
                                          size: 26,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              booking.schedule?.ferry?.name ??
                                                  'Kapal Ferry',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 18,
                                                color: Colors.black87,
                                              ),
                                              maxLines:
                                                  2, // Biarkan nama ferry panjang bisa 2 baris
                                            ),
                                            Text(
                                              'Keberangkatan: ${dateFormat.format(bookingDate)}, ${departureDateTime != null ? timeFormat.format(departureDateTime) : (booking.schedule?.departureTime ?? '')}',
                                              style: TextStyle(
                                                color: Colors.grey[700],
                                                fontSize: 14,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 20),

                                  const Divider(),

                                  // Passenger & Vehicle
                                  LayoutBuilder(
                                    builder: (context, constraints) {
                                      // Jika layar sangat sempit, gunakan layout vertikal
                                      if (constraints.maxWidth < 300) {
                                        return Column(
                                          children: [
                                            // Passenger
                                            Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    vertical: 10.0,
                                                  ),
                                              child: Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.center,
                                                children: [
                                                  Container(
                                                    padding:
                                                        const EdgeInsets.all(
                                                          10,
                                                        ),
                                                    decoration: BoxDecoration(
                                                      color: theme.primaryColor
                                                          .withOpacity(0.1),
                                                      shape: BoxShape.circle,
                                                    ),
                                                    child: Icon(
                                                      Icons.people_alt_rounded,
                                                      color: theme.primaryColor,
                                                      size: 20,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          'Penumpang',
                                                          style: TextStyle(
                                                            color:
                                                                Colors
                                                                    .grey[600],
                                                            fontSize: 12,
                                                          ),
                                                        ),
                                                        const SizedBox(
                                                          height: 4,
                                                        ),
                                                        Text(
                                                          '${booking.passengerCount} orang',
                                                          style: const TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            fontSize: 15,
                                                            color:
                                                                Colors.black87,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),

                                            // Vehicle (if any)
                                            if (booking.vehicleCount > 0)
                                              Padding(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      vertical: 10.0,
                                                    ),
                                                child: Row(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  children: [
                                                    Container(
                                                      padding:
                                                          const EdgeInsets.all(
                                                            10,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        color: theme
                                                            .primaryColor
                                                            .withOpacity(0.1),
                                                        shape: BoxShape.circle,
                                                      ),
                                                      child: Icon(
                                                        Icons
                                                            .directions_car_rounded,
                                                        color:
                                                            theme.primaryColor,
                                                        size: 20,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 12),
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            'Kendaraan',
                                                            style: TextStyle(
                                                              color:
                                                                  Colors
                                                                      .grey[600],
                                                              fontSize: 12,
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                            height: 4,
                                                          ),
                                                          Text(
                                                            '${booking.vehicleCount} unit',
                                                            style: const TextStyle(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontSize: 15,
                                                              color:
                                                                  Colors
                                                                      .black87,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                          ],
                                        );
                                      } else {
                                        // Layout horizontal standar untuk layar normal
                                        return Padding(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 14.0,
                                          ),
                                          child: Row(
                                            children: [
                                              Expanded(
                                                child: Row(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.center,
                                                  children: [
                                                    Container(
                                                      padding:
                                                          const EdgeInsets.all(
                                                            10,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        color: theme
                                                            .primaryColor
                                                            .withOpacity(0.1),
                                                        shape: BoxShape.circle,
                                                      ),
                                                      child: Icon(
                                                        Icons
                                                            .people_alt_rounded,
                                                        color:
                                                            theme.primaryColor,
                                                        size: 20,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 12),
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            'Penumpang',
                                                            style: TextStyle(
                                                              color:
                                                                  Colors
                                                                      .grey[600],
                                                              fontSize: 12,
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                            height: 4,
                                                          ),
                                                          Text(
                                                            '${booking.passengerCount} orang',
                                                            style: const TextStyle(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontSize: 15,
                                                              color:
                                                                  Colors
                                                                      .black87,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              if (booking.vehicleCount > 0)
                                                Expanded(
                                                  child: Row(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .center,
                                                    children: [
                                                      Container(
                                                        padding:
                                                            const EdgeInsets.all(
                                                              10,
                                                            ),
                                                        decoration:
                                                            BoxDecoration(
                                                              color: theme
                                                                  .primaryColor
                                                                  .withOpacity(
                                                                    0.1,
                                                                  ),
                                                              shape:
                                                                  BoxShape
                                                                      .circle,
                                                            ),
                                                        child: Icon(
                                                          Icons
                                                              .directions_car_rounded,
                                                          color:
                                                              theme
                                                                  .primaryColor,
                                                          size: 20,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 12),
                                                      Expanded(
                                                        child: Column(
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Text(
                                                              'Kendaraan',
                                                              style: TextStyle(
                                                                color:
                                                                    Colors
                                                                        .grey[600],
                                                                fontSize: 12,
                                                              ),
                                                            ),
                                                            const SizedBox(
                                                              height: 4,
                                                            ),
                                                            Text(
                                                              '${booking.vehicleCount} unit',
                                                              style: const TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                fontSize: 15,
                                                                color:
                                                                    Colors
                                                                        .black87,
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
                                        );
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // PAYMENT INFORMATION SECTION
                          const SizedBox(height: 28),
                          _buildSectionHeader(
                            'Informasi Pembayaran',
                            Icons.payment_rounded,
                          ),
                          const SizedBox(height: 16),

                          Card(
                            elevation: 0,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: BorderSide(
                                color: Colors.grey[200]!,
                                width: 1.5,
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                children: [
                                  _buildInfoRow(
                                    'Status Pembayaran',
                                    _getPaymentStatus(booking),
                                    Icons.payment_rounded,
                                    valueColor: _getPaymentStatusColor(booking),
                                    valueIcon: _getPaymentStatusIcon(booking),
                                  ),
                                  const Divider(height: 28),
                                  _buildInfoRow(
                                    'Total Pembayaran',
                                    _formatCurrency(booking.totalAmount),
                                    Icons.monetization_on_rounded,
                                    valueColor: theme.primaryColor,
                                  ),
                                  if (booking.status == 'CANCELLED') ...[
                                    const Divider(height: 28),
                                    _buildInfoRow(
                                      'Alasan Pembatalan',
                                      booking.cancellationReason ?? '-',
                                      Icons.info_outline_rounded,
                                      valueColor: Colors.red,
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),

                          // SHOW PAYMENT INSTRUCTIONS SECTION IF STATUS IS PENDING
                          if (isPending) ...[
                            const SizedBox(height: 28),
                            _buildPaymentInstructionsCard(booking),
                          ],

                          // SHOW TICKET SECTION ONLY IF STATUS IS NOT PENDING
                          if (!isPending) ...[
                            // Multiple Tickets
                            const SizedBox(height: 28),
                            _buildSectionHeader(
                              'Tiket Perjalanan',
                              Icons.confirmation_number_rounded,
                            ),
                            const SizedBox(height: 16),

                            if (hasMultipleTickets)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 16.0),
                                child: SizedBox(
                                  height: 56,
                                  child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    itemCount: tickets.length,
                                    itemBuilder: (context, index) {
                                      final isSelected =
                                          index == _selectedTicketIndex;

                                      return Padding(
                                        padding: const EdgeInsets.only(
                                          right: 12.0,
                                        ),
                                        child: GestureDetector(
                                          onTap: () {
                                            setState(() {
                                              _selectedTicketIndex = index;
                                            });
                                          },
                                          child: AnimatedContainer(
                                            duration: const Duration(
                                              milliseconds: 300,
                                            ),
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 18.0,
                                              vertical: 10.0,
                                            ),
                                            decoration: BoxDecoration(
                                              color:
                                                  isSelected
                                                      ? theme.primaryColor
                                                      : Colors.grey[100],
                                              borderRadius:
                                                  BorderRadius.circular(28),
                                              boxShadow:
                                                  isSelected
                                                      ? [
                                                        BoxShadow(
                                                          color: theme
                                                              .primaryColor
                                                              .withOpacity(0.4),
                                                          blurRadius: 10,
                                                          offset: const Offset(
                                                            0,
                                                            4,
                                                          ),
                                                        ),
                                                      ]
                                                      : null,
                                              border: Border.all(
                                                color:
                                                    isSelected
                                                        ? theme.primaryColor
                                                        : Colors.grey[300]!,
                                                width: 1.5,
                                              ),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  tickets[index].vehicleId !=
                                                          null
                                                      ? Icons
                                                          .directions_car_rounded
                                                      : Icons.person_rounded,
                                                  size: 18,
                                                  color:
                                                      isSelected
                                                          ? Colors.white
                                                          : Colors.grey[700],
                                                ),
                                                const SizedBox(width: 10),
                                                Text(
                                                  'Tiket ${index + 1}',
                                                  style: TextStyle(
                                                    color:
                                                        isSelected
                                                            ? Colors.white
                                                            : Colors.black87,
                                                    fontWeight:
                                                        isSelected
                                                            ? FontWeight.bold
                                                            : FontWeight.w500,
                                                    fontSize: 15,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ),

                            // Selected Ticket Card - Responsif
                            if (selectedTicket != null)
                              Card(
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(
                                    color: theme.primaryColor.withOpacity(0.3),
                                    width: 1.5,
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(24.0),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Ticket Header with Type Badge - Layout responsif
                                      LayoutBuilder(
                                        builder: (context, constraints) {
                                          // Layout vertikal untuk layar sempit
                                          if (constraints.maxWidth < 280) {
                                            return Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Container(
                                                      padding:
                                                          const EdgeInsets.all(
                                                            12,
                                                          ),
                                                      decoration: BoxDecoration(
                                                        color: theme
                                                            .primaryColor
                                                            .withOpacity(0.1),
                                                        shape: BoxShape.circle,
                                                      ),
                                                      child: Icon(
                                                        selectedTicket
                                                                    .vehicleId !=
                                                                null
                                                            ? Icons
                                                                .directions_car_rounded
                                                            : Icons
                                                                .person_rounded,
                                                        color:
                                                            theme.primaryColor,
                                                        size: 24,
                                                      ),
                                                    ),
                                                    const SizedBox(width: 16),
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            hasMultipleTickets
                                                                ? 'Tiket #${_selectedTicketIndex + 1}'
                                                                : 'Tiket Perjalanan',
                                                            style: const TextStyle(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontSize: 18,
                                                              color:
                                                                  Colors
                                                                      .black87,
                                                            ),
                                                          ),
                                                          const SizedBox(
                                                            height: 4,
                                                          ),
                                                          Text(
                                                            'Kode: ${selectedTicket.ticketCode}',
                                                            style: TextStyle(
                                                              color:
                                                                  Colors
                                                                      .grey[700],
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 12),
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 12,
                                                        vertical: 6,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: theme.primaryColor
                                                        .withOpacity(0.1),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          20,
                                                        ),
                                                    border: Border.all(
                                                      color: theme.primaryColor
                                                          .withOpacity(0.3),
                                                      width: 1.5,
                                                    ),
                                                  ),
                                                  child: Text(
                                                    _getTicketTypeText(
                                                      selectedTicket.ticketType,
                                                    ),
                                                    style: TextStyle(
                                                      color: theme.primaryColor,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            );
                                          } else {
                                            // Layout horizontal standar untuk layar normal
                                            return Row(
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.all(
                                                    12,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: theme.primaryColor
                                                        .withOpacity(0.1),
                                                    shape: BoxShape.circle,
                                                  ),
                                                  child: Icon(
                                                    selectedTicket.vehicleId !=
                                                            null
                                                        ? Icons
                                                            .directions_car_rounded
                                                        : Icons.person_rounded,
                                                    color: theme.primaryColor,
                                                    size: 24,
                                                  ),
                                                ),
                                                const SizedBox(width: 16),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        hasMultipleTickets
                                                            ? 'Tiket #${_selectedTicketIndex + 1}'
                                                            : 'Tiket Perjalanan',
                                                        style: const TextStyle(
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          fontSize: 18,
                                                          color: Colors.black87,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        'Kode: ${selectedTicket.ticketCode}',
                                                        style: TextStyle(
                                                          color:
                                                              Colors.grey[700],
                                                          fontSize: 14,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                const SizedBox(width: 10),
                                                Container(
                                                  padding: EdgeInsets.symmetric(
                                                    horizontal:
                                                        isSmallScreen
                                                            ? 8.0
                                                            : 12.0,
                                                    vertical: 6.0,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: theme.primaryColor
                                                        .withOpacity(0.1),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          20,
                                                        ),
                                                    border: Border.all(
                                                      color: theme.primaryColor
                                                          .withOpacity(0.3),
                                                      width: 1.5,
                                                    ),
                                                  ),
                                                  child: Text(
                                                    _getTicketTypeText(
                                                      selectedTicket.ticketType,
                                                    ),
                                                    style: TextStyle(
                                                      color: theme.primaryColor,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      fontSize:
                                                          isSmallScreen
                                                              ? 11
                                                              : 12,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            );
                                          }
                                        },
                                      ),

                                      const SizedBox(height: 24),
                                      const Divider(),
                                      const SizedBox(height: 16),

                                      // Status Check-in
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color:
                                              selectedTicket.checkedIn
                                                  ? Colors.green.withOpacity(
                                                    0.1,
                                                  )
                                                  : Colors.orange.withOpacity(
                                                    0.1,
                                                  ),
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                          border: Border.all(
                                            color:
                                                selectedTicket.checkedIn
                                                    ? Colors.green.withOpacity(
                                                      0.3,
                                                    )
                                                    : Colors.orange.withOpacity(
                                                      0.3,
                                                    ),
                                            width: 1,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color:
                                                    selectedTicket.checkedIn
                                                        ? Colors.green
                                                            .withOpacity(0.2)
                                                        : Colors.orange
                                                            .withOpacity(0.2),
                                                shape: BoxShape.circle,
                                              ),
                                              child: Icon(
                                                selectedTicket.checkedIn
                                                    ? Icons.check_rounded
                                                    : Icons.access_time_rounded,
                                                color:
                                                    selectedTicket.checkedIn
                                                        ? Colors.green
                                                        : Colors.orange,
                                                size: 24,
                                              ),
                                            ),
                                            const SizedBox(width: 16),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    selectedTicket.checkedIn
                                                        ? 'Sudah Check-In'
                                                        : 'Belum Check-In',
                                                    style: TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color:
                                                          selectedTicket
                                                                  .checkedIn
                                                              ? Colors.green
                                                              : Colors.orange,
                                                      fontSize: 16,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    selectedTicket.checkedIn
                                                        ? 'Anda sudah melakukan check-in'
                                                        : 'Silakan lakukan check-in di lokasi keberangkatan',
                                                    style: TextStyle(
                                                      color: Colors.grey[700],
                                                      fontSize: 14,
                                                    ),
                                                    maxLines:
                                                        2, // Lebih baik dari ellipsis
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      const SizedBox(height: 16),

                                      // Boarding Status
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[50],
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                          border: Border.all(
                                            color: Colors.grey[200]!,
                                            width: 1,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color: theme.primaryColor
                                                    .withOpacity(0.1),
                                                shape: BoxShape.circle,
                                              ),
                                              child: Icon(
                                                Icons.directions_boat_rounded,
                                                color: theme.primaryColor,
                                                size: 24,
                                              ),
                                            ),
                                            const SizedBox(width: 16),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    'Status Boarding',
                                                    style: TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Colors.black87,
                                                      fontSize: 16,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    selectedTicket
                                                        .boardingStatus,
                                                    style: TextStyle(
                                                      color: Colors.grey[700],
                                                      fontSize: 14,
                                                    ),
                                                    maxLines:
                                                        2, // Lebih baik dari ellipsis
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

                            // List of All Tickets
                            if (hasMultipleTickets) ...[
                              const SizedBox(height: 28),
                              _buildSectionHeader(
                                'Daftar Tiket',
                                Icons.list_alt_rounded,
                                hidden: true,
                              ),
                              const SizedBox(height: 16),

                              Card(
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(
                                    color: Colors.grey[200]!,
                                    width: 1.5,
                                  ),
                                ),
                                child: Theme(
                                  data: Theme.of(
                                    context,
                                  ).copyWith(dividerColor: Colors.transparent),
                                  child: ExpansionTile(
                                    tilePadding: const EdgeInsets.symmetric(
                                      horizontal: 20,
                                      vertical: 5,
                                    ),
                                    childrenPadding: EdgeInsets.zero,
                                    title: const Text(
                                      'Semua Tiket Perjalanan',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Colors.black87,
                                      ),
                                    ),
                                    subtitle: Text(
                                      'Lihat semua tiket dalam pemesanan ini',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                    leading: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: theme.primaryColor.withOpacity(
                                          0.1,
                                        ),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.confirmation_number_rounded,
                                        color: theme.primaryColor,
                                        size: 20,
                                      ),
                                    ),
                                    children: [
                                      const Divider(height: 1),
                                      ListView.separated(
                                        physics:
                                            const NeverScrollableScrollPhysics(),
                                        shrinkWrap: true,
                                        itemCount: tickets.length,
                                        separatorBuilder:
                                            (context, index) =>
                                                const Divider(height: 1),
                                        itemBuilder: (context, index) {
                                          final ticket = tickets[index];
                                          final isSelected =
                                              index == _selectedTicketIndex;

                                          return ListTile(
                                            selected: isSelected,
                                            selectedTileColor: theme
                                                .primaryColor
                                                .withOpacity(0.05),
                                            contentPadding:
                                                const EdgeInsets.symmetric(
                                                  horizontal: 20,
                                                  vertical: 5,
                                                ),
                                            leading: Container(
                                              width: 42,
                                              height: 42,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color:
                                                    isSelected
                                                        ? theme.primaryColor
                                                        : Colors.grey[200],
                                              ),
                                              child: Center(
                                                child: Text(
                                                  '${index + 1}',
                                                  style: TextStyle(
                                                    color:
                                                        isSelected
                                                            ? Colors.white
                                                            : Colors.black87,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            title: Text(
                                              'Tiket #${ticket.ticketCode}',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w600,
                                                fontSize: 15,
                                                color: Colors.black87,
                                              ),
                                              maxLines: 1,
                                            ),
                                            subtitle: Text(
                                              _getTicketTypeDescription(ticket),
                                              style: TextStyle(
                                                color: Colors.grey[600],
                                                fontSize: 13,
                                              ),
                                              maxLines: 1,
                                            ),
                                            trailing: LayoutBuilder(
                                              builder: (context, constraints) {
                                                // Untuk layar sangat sempit, hanya tampilkan ikon status check-in
                                                if (constraints.maxWidth < 80) {
                                                  return Icon(
                                                    ticket.checkedIn
                                                        ? Icons
                                                            .check_circle_rounded
                                                        : Icons
                                                            .access_time_rounded,
                                                    color:
                                                        ticket.checkedIn
                                                            ? Colors.green
                                                            : theme
                                                                .primaryColor,
                                                    size: 24,
                                                  );
                                                } else {
                                                  // Layout normal dengan badge
                                                  return Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      Container(
                                                        padding:
                                                            const EdgeInsets.symmetric(
                                                              horizontal: 8,
                                                              vertical: 4,
                                                            ),
                                                        decoration: BoxDecoration(
                                                          color:
                                                              ticket.checkedIn
                                                                  ? Colors.green
                                                                      .withOpacity(
                                                                        0.1,
                                                                      )
                                                                  : theme
                                                                      .primaryColor
                                                                      .withOpacity(
                                                                        0.1,
                                                                      ),
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                12,
                                                              ),
                                                        ),
                                                        child: Row(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          children: [
                                                            Icon(
                                                              ticket.checkedIn
                                                                  ? Icons
                                                                      .check_circle_rounded
                                                                  : Icons
                                                                      .access_time_rounded,
                                                              color:
                                                                  ticket.checkedIn
                                                                      ? Colors
                                                                          .green
                                                                      : theme
                                                                          .primaryColor,
                                                              size: 14,
                                                            ),
                                                            const SizedBox(
                                                              width: 4,
                                                            ),
                                                            Text(
                                                              ticket.checkedIn
                                                                  ? 'Checked-in'
                                                                  : 'Belum',
                                                              style: TextStyle(
                                                                fontSize: 11,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                color:
                                                                    ticket.checkedIn
                                                                        ? Colors
                                                                            .green
                                                                        : theme
                                                                            .primaryColor,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                      const SizedBox(width: 8),
                                                      Icon(
                                                        Icons
                                                            .arrow_forward_ios_rounded,
                                                        size: 14,
                                                        color: Colors.grey[400],
                                                      ),
                                                    ],
                                                  );
                                                }
                                              },
                                            ),
                                            onTap: () {
                                              setState(() {
                                                _selectedTicketIndex = index;
                                              });
                                            },
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ],

                          const SizedBox(height: 35),

                          // Action Buttons
                          if (canCancel || canRefund) ...[
                            const Divider(),
                            const SizedBox(height: 20),
                            _buildSectionHeader(
                              'Aksi Pemesanan',
                              Icons.settings,
                            ),
                            const SizedBox(height: 20),

                            // Refund button (for CONFIRMED)
                            if (canRefund)
                              Container(
                                margin: const EdgeInsets.only(bottom: 15),
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  icon: const Icon(
                                    Icons.monetization_on_rounded,
                                  ),
                                  label: const Text('Minta Refund'),
                                  style: ElevatedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    backgroundColor: Colors.orange[700],
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    elevation: 0,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                  ),
                                  onPressed: _showRefundDialog,
                                ),
                              ),

                            // Cancel Button (if applicable)
                            if (canCancel)
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.cancel_rounded),
                                  label: const Text('Batalkan Pemesanan'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.red,
                                    side: const BorderSide(
                                      color: Colors.red,
                                      width: 1.5,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                  ),
                                  onPressed: _cancelBooking,
                                ),
                              ),
                          ],

                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // BAGIAN WIDGET HELPER

  // Widget section header yang responsif
  Widget _buildSectionHeader(
    String title,
    IconData icon, {
    bool hidden = false,
  }) {
    if (hidden) return Container();

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Theme.of(context).primaryColor.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Theme.of(context).primaryColor, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: Colors.grey[800],
            ),
            maxLines: 1, // Biarkan judul terlihat utuh, tidak terpotong
          ),
        ),
      ],
    );
  }

  // Method untuk pembayaran yang ditingkatkan
  Widget _buildPaymentInstructionsCard(booking) {
    // Get payment data from booking
    final payment =
        booking.payments?.isNotEmpty == true ? booking.payments?.first : null;

    // UI untuk tidak ada data pembayaran
    if (payment == null) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.grey[200]!, width: 1.5),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.payment_rounded,
                  size: 48,
                  color: Colors.orange,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Mohon lakukan pembayaran untuk melihat tiket Anda',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Pilih metode pembayaran yang tersedia untuk melanjutkan perjalanan Anda',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 28),
              ElevatedButton.icon(
                icon: const Icon(Icons.payments_rounded),
                label: const Text('Pilih Metode Pembayaran'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    vertical: 16,
                    horizontal: 28,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                onPressed: () {
                  // Navigate to payment page here
                },
              ),
            ],
          ),
        ),
      );
    }

    // UI untuk data pembayaran ada
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.orange.withOpacity(0.3), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header pembayaran
            Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.payments_rounded,
                    color: Colors.orange,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Menunggu Pembayaran',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                          color: Colors.orange,
                        ),
                      ),
                      if (payment.expiryTime != null)
                        Row(
                          children: [
                            const Icon(
                              Icons.timer_rounded,
                              size: 14,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 5),
                            Expanded(
                              child: Text(
                                'Bayar sebelum ${DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(payment.expiryTime!)}',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                                maxLines: 2, // Biarkan teks lengkap terlihat
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(),

            // Payment Method - Layout yang lebih baik
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 14.0),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  // Jika layar sempit, gunakan layout vertikal
                  if (constraints.maxWidth < 260) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.account_balance_rounded,
                              size: 18,
                              color: Colors.grey[600],
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'Metode Pembayaran',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.blue.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            _getReadablePaymentMethod(
                              payment.paymentMethod,
                              payment.paymentType,
                            ),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    );
                  } else {
                    // Layout horizontal standar untuk layar normal
                    return Row(
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.account_balance_rounded,
                              size: 18,
                              color: Colors.grey[600],
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'Metode Pembayaran',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.blue.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            _getReadablePaymentMethod(
                              payment.paymentMethod,
                              payment.paymentType,
                            ),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    );
                  }
                },
              ),
            ),

            // Virtual Account Number - Layout yang ditingkatkan
            if (payment.virtualAccountNumber != null &&
                payment.virtualAccountNumber!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.numbers_rounded,
                          size: 18,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Nomor Virtual Account',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          Clipboard.setData(
                            ClipboardData(text: payment.virtualAccountNumber!),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Row(
                                children: const [
                                  Icon(Icons.copy_all, color: Colors.white),
                                  SizedBox(width: 10),
                                  Text('Nomor Virtual Account telah disalin'),
                                ],
                              ),
                              behavior: SnackBarBehavior.floating,
                              duration: const Duration(seconds: 2),
                              backgroundColor: Colors.black87,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Ink(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.blue.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Tampilkan nomor VA yang bisa dipilih (selectable)
                              SelectableText(
                                payment.virtualAccountNumber!,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  letterSpacing: 1.2,
                                  color: Colors.black87,
                                ),
                                textAlign:
                                    TextAlign.center, // Lebih rapi di tengah
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment
                                        .center, // Tombol salin di tengah
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: Colors.blue.withOpacity(0.3),
                                        width: 1,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: const [
                                        Icon(
                                          Icons.copy_rounded,
                                          color: Colors.blue,
                                          size: 16,
                                        ),
                                        SizedBox(width: 8),
                                        Text(
                                          'Salin Nomor',
                                          style: TextStyle(
                                            color: Colors.blue,
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 28),
            const Divider(),
            const SizedBox(height: 20),

            // Tombol instruksi dan bayar - Layout responsif
            LayoutBuilder(
              builder: (context, constraints) {
                // Jika layar sempit, gunakan layout vertikal
                if (constraints.maxWidth < 340) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      ElevatedButton.icon(
                        icon: const Icon(Icons.help_outline_rounded, size: 18),
                        label: const Text('Cara Pembayaran'),
                        onPressed: () {
                          _showPaymentInstructions(context, payment);
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                      ),

                      if (payment.deepLinkUrl != null &&
                          payment.deepLinkUrl!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          icon: const Icon(Icons.open_in_new_rounded, size: 18),
                          label: const Text('Buka Aplikasi'),
                          onPressed: () {
                            // Open deep link
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            side: BorderSide(
                              color: Theme.of(context).primaryColor,
                              width: 1.5,
                            ),
                            foregroundColor: Theme.of(context).primaryColor,
                          ),
                        ),
                      ],
                    ],
                  );
                } else {
                  // Layout horizontal standar untuk layar normal
                  return Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: const Icon(
                            Icons.help_outline_rounded,
                            size: 18,
                          ),
                          label: const Text('Cara Pembayaran'),
                          onPressed: () {
                            _showPaymentInstructions(context, payment);
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                        ),
                      ),

                      if (payment.deepLinkUrl != null &&
                          payment.deepLinkUrl!.isNotEmpty) ...[
                        const SizedBox(width: 16),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(
                              Icons.open_in_new_rounded,
                              size: 18,
                            ),
                            label: const Text('Buka Aplikasi'),
                            onPressed: () {
                              // Open deep link
                            },
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              side: BorderSide(
                                color: Theme.of(context).primaryColor,
                                width: 1.5,
                              ),
                              foregroundColor: Theme.of(context).primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ],
                  );
                }
              },
            ),

            const SizedBox(height: 20),

            // Check Payment Status Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon:
                    _isCheckingStatus
                        ? SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Theme.of(context).primaryColor,
                            ),
                          ),
                        )
                        : const Icon(Icons.refresh_rounded),
                label: Text(
                  _isCheckingStatus
                      ? 'Memeriksa...'
                      : 'Periksa Status Pembayaran',
                ),
                onPressed:
                    _isCheckingStatus
                        ? null
                        : () {
                          setState(() {
                            _isCheckingStatus = true;
                          });
                          _refreshPaymentStatus(booking.bookingCode).then((_) {
                            if (mounted) {
                              setState(() {
                                _isCheckingStatus = false;
                              });
                            }
                          });
                        },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  foregroundColor: Theme.of(context).primaryColor,
                  side: BorderSide(
                    color: Theme.of(context).primaryColor,
                    width: 1.5,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Metode yang ditingkatkan untuk pembayaran
  String _getReadablePaymentMethod(String method, String type) {
    final methodLower = method.toLowerCase();
    final typeLower = type.toLowerCase();

    if (methodLower.contains('virtual_account')) {
      if (typeLower.contains('bca')) return 'BCA Virtual Account';
      if (typeLower.contains('bni')) return 'BNI Virtual Account';
      if (typeLower.contains('bri')) return 'BRI Virtual Account';
      if (typeLower.contains('mandiri')) return 'Mandiri Virtual Account';
      return 'Virtual Account';
    } else if (methodLower.contains('e_wallet')) {
      if (typeLower.contains('gopay')) return 'GoPay';
      if (typeLower.contains('shopeepay')) return 'ShopeePay';
      if (typeLower.contains('dana')) return 'DANA';
      if (typeLower.contains('ovo')) return 'OVO';
      return 'E-Wallet';
    } else if (methodLower.contains('credit_card')) {
      return 'Kartu Kredit';
    }

    return method;
  }

  // Metode refund dialog yang ditingkatkan
  Future<void> _showRefundDialog() async {
    TextEditingController reasonController = TextEditingController();
    TextEditingController bankNameController = TextEditingController();
    TextEditingController accountNameController = TextEditingController();
    TextEditingController accountNumberController = TextEditingController();

    final result =
        await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.orange[700]!.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.monetization_on_rounded,
                        color: Colors.orange[700],
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Flexible(child: Text('Minta Refund')),
                  ],
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.blue[100]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.info_outline_rounded,
                              color: Colors.blue,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Permintaan refund akan diproses dalam waktu 3-5 hari kerja. Dana akan dikembalikan sesuai kebijakan refund.',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey[800],
                                  height: 1.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      Text(
                        'Alasan Refund:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: reasonController,
                        decoration: InputDecoration(
                          hintText: 'Masukkan alasan refund',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          contentPadding: const EdgeInsets.all(16),
                          hintStyle: TextStyle(
                            color: Colors.grey[400],
                            fontSize: 14,
                          ),
                          filled: true,
                          fillColor: Colors.grey[50],
                        ),
                        maxLines: 3,
                        style: const TextStyle(fontSize: 15),
                      ),

                      const SizedBox(height: 24),
                      Text(
                        'Informasi Rekening:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                          fontSize: 15,
                        ),
                      ),

                      const SizedBox(height: 12),
                      TextField(
                        controller: bankNameController,
                        decoration: InputDecoration(
                          labelText: 'Nama Bank',
                          prefixIcon: Icon(
                            Icons.account_balance_rounded,
                            size: 20,
                            color: Colors.grey[600],
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          contentPadding: const EdgeInsets.all(16),
                          filled: true,
                          fillColor: Colors.grey[50],
                          labelStyle: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                        style: const TextStyle(fontSize: 15),
                      ),

                      const SizedBox(height: 12),
                      TextField(
                        controller: accountNameController,
                        decoration: InputDecoration(
                          labelText: 'Nama Pemilik Rekening',
                          prefixIcon: Icon(
                            Icons.person_rounded,
                            size: 20,
                            color: Colors.grey[600],
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          contentPadding: const EdgeInsets.all(16),
                          filled: true,
                          fillColor: Colors.grey[50],
                          labelStyle: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                        style: const TextStyle(fontSize: 15),
                      ),

                      const SizedBox(height: 12),
                      TextField(
                        controller: accountNumberController,
                        decoration: InputDecoration(
                          labelText: 'Nomor Rekening',
                          prefixIcon: Icon(
                            Icons.numbers_rounded,
                            size: 20,
                            color: Colors.grey[600],
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          contentPadding: const EdgeInsets.all(16),
                          filled: true,
                          fillColor: Colors.grey[50],
                          labelStyle: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                        keyboardType: TextInputType.number,
                        style: const TextStyle(fontSize: 15),
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Batal'),
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.grey[600],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Validation
                      if (reasonController.text.isEmpty ||
                          bankNameController.text.isEmpty ||
                          accountNameController.text.isEmpty ||
                          accountNumberController.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: const [
                                Icon(Icons.error_outline, color: Colors.white),
                                SizedBox(width: 10),
                                Expanded(
                                  child: Text('Semua field harus diisi'),
                                ),
                              ],
                            ),
                            behavior: SnackBarBehavior.floating,
                            backgroundColor: Colors.red,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        );
                        return;
                      }
                      Navigator.pop(context, true);
                    },
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.orange[700],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    child: const Text('Ajukan Refund'),
                  ),
                ],
              ),
        ) ??
        false;

    if (result) {
      setState(() {
        _isLoading = true;
      });

      try {
        final bookingProvider = Provider.of<BookingProvider>(
          context,
          listen: false,
        );

        // Call requestRefund and save the result
        final Map<String, dynamic> response = await bookingProvider
            .requestRefund(
              widget.bookingId,
              reasonController.text,
              bankNameController.text,
              accountNameController.text,
              accountNumberController.text,
            );

        if (mounted) {
          // Access properties in Map
          final bool success = response['success'] ?? false;
          final bool isManualProcess =
              response['requires_manual_process'] ?? true;

          if (success) {
            final String message =
                isManualProcess
                    ? 'Permintaan refund berhasil dikirim dan akan diproses secara manual oleh tim kami dalam 3-7 hari kerja. Dana akan dikembalikan ke rekening yang Anda berikan.'
                    : 'Permintaan refund berhasil dikirim dan sedang diproses. Status refund akan diperbarui secara otomatis.';

            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.white),
                    const SizedBox(width: 10),
                    Expanded(child: Text(message)),
                  ],
                ),
                duration: const Duration(seconds: 6),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                backgroundColor: Colors.green,
              ),
            );

            // Refresh booking details to show new status
            _loadTicketDetails();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.white),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Gagal mengajukan refund. ${response['error'] ?? 'Silakan coba lagi nanti.'}',
                      ),
                    ),
                  ],
                ),
                backgroundColor: Colors.red,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.white),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Gagal mengajukan refund: ${e.toString()}. Silakan hubungi customer service kami.',
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  // Metode untuk menampilkan instruksi pembayaran
  Future<void> _showPaymentInstructions(
    BuildContext context,
    dynamic payment,
  ) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final String paymentMethod = payment.paymentMethod;
      final String paymentType = payment.paymentType;

      // Get payment instructions from API
      final instructions = await bookingProvider.getPaymentInstructions(
        paymentMethod,
        paymentType,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        // Show instructions in bottom sheet
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          backgroundColor: Colors.white,
          builder:
              (context) => DraggableScrollableSheet(
                initialChildSize: 0.65,
                minChildSize: 0.4,
                maxChildSize: 0.9,
                expand: false,
                builder:
                    (context, scrollController) => SingleChildScrollView(
                      controller: scrollController,
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Center(
                              child: Container(
                                width: 60,
                                height: 5,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Theme.of(
                                      context,
                                    ).primaryColor.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.help_outline_rounded,
                                    color: Theme.of(context).primaryColor,
                                    size: 24,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    instructions['title'] ?? 'Cara Pembayaran',
                                    style: const TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                    maxLines: 2,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            const Divider(),
                            const SizedBox(height: 20),

                            // Display steps with better formatting
                            Column(
                              children: List.generate(
                                (instructions['steps'] as List<dynamic>).length,
                                (index) => Padding(
                                  padding: const EdgeInsets.only(bottom: 20.0),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          color: Theme.of(
                                            context,
                                          ).primaryColor.withOpacity(0.1),
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: Theme.of(
                                              context,
                                            ).primaryColor.withOpacity(0.3),
                                            width: 1.5,
                                          ),
                                        ),
                                        child: Center(
                                          child: Text(
                                            '${index + 1}',
                                            style: TextStyle(
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).primaryColor,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Text(
                                          instructions['steps'][index],
                                          style: const TextStyle(
                                            fontSize: 15,
                                            height: 1.5,
                                            color: Colors.black87,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                child: const Text('Tutup'),
                                onPressed: () => Navigator.pop(context),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  backgroundColor:
                                      Theme.of(context).primaryColor,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),
              ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _showSnackBar('Gagal memuat instruksi pembayaran: $e');
      }
    }
  }

  // Function to check payment status
  Future<void> _refreshPaymentStatus(String bookingCode) async {
    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final success = await bookingProvider.refreshPaymentStatus(bookingCode);

      if (mounted) {
        if (success) {
          // If successful, reload booking details to get latest data
          await _loadTicketDetails();
          _showSnackBar('Status pembayaran berhasil diperbarui');
        } else {
          _showSnackBar('Gagal memperbarui status pembayaran');
        }
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('Error: $e');
      }
    }
  }

  // Method yang diperbarui untuk menampilkan row informasi
  Widget _buildInfoRow(
    String label,
    String value,
    IconData icon, {
    Color? valueColor,
    IconData? valueIcon,
  }) {
    // Ambil ukuran layar
    final Size screenSize = MediaQuery.of(context).size;
    final bool isSmallScreen = screenSize.width < 340;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Layout vertikal untuk layar sangat sempit
          if (constraints.maxWidth < 250 || isSmallScreen) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Label dan ikon
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        icon,
                        color: Theme.of(context).primaryColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        label,
                        style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      ),
                    ),
                  ],
                ),

                // Spasi
                const SizedBox(height: 8),

                // Nilai dengan ikon jika ada
                Padding(
                  padding: const EdgeInsets.only(left: 40.0), // Indentasi
                  child: Row(
                    children: [
                      if (valueIcon != null) ...[
                        Icon(valueIcon, color: valueColor, size: 16),
                        const SizedBox(width: 6),
                      ],
                      Expanded(
                        child: Text(
                          value,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: valueColor ?? Colors.black87,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          } else {
            // Layout horizontal untuk layar normal
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    color: Theme.of(context).primaryColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          if (valueIcon != null) ...[
                            Icon(valueIcon, color: valueColor, size: 16),
                            const SizedBox(width: 6),
                          ],
                          Expanded(
                            child: Text(
                              value,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: valueColor ?? Colors.black87,
                                fontSize: 16,
                              ),
                              maxLines: 2, // Mengizinkan 2 baris teks
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            );
          }
        },
      ),
    );
  }

  // Helper methods for status display
  IconData _getPaymentStatusIcon(booking) {
    final status = _getPaymentStatus(booking);
    switch (status) {
      case 'Berhasil':
        return Icons.check_circle_outline;
      case 'Menunggu Pembayaran':
        return Icons.pending_outlined;
      case 'Gagal':
      case 'Kedaluwarsa':
        return Icons.cancel_outlined;
      case 'Dikembalikan':
        return Icons.assignment_return_outlined;
      default:
        return Icons.help_outline;
    }
  }

  Color _getPaymentStatusColor(booking) {
    final status = _getPaymentStatus(booking);
    switch (status) {
      case 'Berhasil':
        return Colors.green[700]!; // Green
      case 'Menunggu Pembayaran':
        return Colors.orange[700]!; // Yellow
      case 'Gagal':
      case 'Kedaluwarsa':
        return Colors.red[700]!; // Red
      case 'Dikembalikan':
        return Colors.blue[700]!; // Blue
      default:
        return Colors.grey[700]!; // Grey
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green[700]!;
      case 'COMPLETED':
        return Colors.blue[700]!;
      case 'CANCELLED':
      case 'REFUNDED':
        return Colors.red[700]!;
      case 'PENDING':
        return Colors.orange[700]!;
      default:
        return Colors.grey[700]!;
    }
  }

  Color _getStatusColorGradient(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green[600]!;
      case 'COMPLETED':
        return Colors.blue[600]!;
      case 'CANCELLED':
      case 'REFUNDED':
        return Colors.red[600]!;
      case 'PENDING':
        return Colors.orange[600]!;
      default:
        return Colors.grey[600]!;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Icons.check_circle_rounded;
      case 'COMPLETED':
        return Icons.done_all_rounded;
      case 'CANCELLED':
      case 'REFUNDED':
        return Icons.cancel_rounded;
      case 'PENDING':
        return Icons.pending_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 'Terkonfirmasi';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      case 'REFUNDED':
        return 'Refund';
      case 'PENDING':
        return 'Menunggu Pembayaran';
      default:
        return status;
    }
  }

  String _getStatusDescription(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 'Tiket Anda telah dikonfirmasi dan siap digunakan';
      case 'COMPLETED':
        return 'Perjalanan Anda telah selesai';
      case 'CANCELLED':
        return 'Tiket ini telah dibatalkan';
      case 'REFUNDED':
        return 'Pembayaran telah dikembalikan';
      case 'PENDING':
        return 'Menunggu pembayaran dari Anda';
      default:
        return '';
    }
  }

  String _getPaymentStatus(booking) {
    final payments = booking.payments;
    if (payments == null || payments.isEmpty) {
      return 'Belum Dibayar';
    }

    final latestPayment = payments.first;
    switch (latestPayment.status) {
      case 'SUCCESS':
        return 'Berhasil';
      case 'PENDING':
        return 'Menunggu Pembayaran';
      case 'FAILED':
        return 'Gagal';
      case 'EXPIRED':
        return 'Kedaluwarsa';
      case 'REFUNDED':
        return 'Dikembalikan';
      default:
        return latestPayment.status;
    }
  }

  String _formatCurrency(double amount) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return currencyFormat.format(amount);
  }

  String _getTicketTypeText(String type) {
    switch (type.toUpperCase()) {
      case 'PASSENGER':
        return 'Penumpang';
      case 'VEHICLE':
        return 'Kendaraan';
      case 'PASSENGER_VEHICLE':
        return 'Penumpang & Kendaraan';
      default:
        return type;
    }
  }

  String _getTicketTypeDescription(ticket) {
    if (ticket.vehicleId != null) {
      return 'Tiket Kendaraan';
    } else if (ticket.ticketType.toUpperCase().contains('PASSENGER')) {
      return 'Tiket Penumpang';
    } else {
      return 'Tiket ${ticket.ticketType}';
    }
  }
}
