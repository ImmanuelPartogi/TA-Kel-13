import 'dart:async';
import 'dart:convert';

import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/refund_provider.dart'; // Import RefundProvider
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
  bool _initialLoadDone = false;
  int _selectedTicketIndex = 0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _showTicketDetails = false;
  Timer? _paymentStatusTimer;
  bool _isCheckingStatus = false;

  @override
  void initState() {
    super.initState();
    // Tidak memanggil _loadTicketDetails() di sini untuk menghindari duplicate build
    _startPaymentStatusTimer();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

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
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Load data hanya sekali setelah widget dibangun dengan benar
    if (!_isLoading && !_initialLoadDone) {
      _loadTicketDetails();
      _initialLoadDone = true;
    }
  }

  @override
  void dispose() {
    _paymentStatusTimer?.cancel();
    _animationController.dispose();
    super.dispose();
  }

  void _startPaymentStatusTimer() {
    _paymentStatusTimer = Timer.periodic(const Duration(seconds: 30), (
      timer,
    ) async {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final booking = bookingProvider.currentBooking;

      if (booking != null && booking.status == 'PENDING') {
        await bookingProvider.refreshPaymentStatus(booking.bookingCode);
      } else {
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

      // Jika status booking adalah REFUND_PENDING atau REFUNDED, load refund details dan history
      final booking = bookingProvider.currentBooking;
      if (booking != null &&
          (booking.status == 'REFUND_PENDING' ||
              booking.status == 'REFUNDED')) {
        final refundProvider = Provider.of<RefundProvider>(
          context,
          listen: false,
        );

        // Gunakan metode yang diperbarui untuk mendapatkan riwayat dan refund terbaru
        await refundProvider.getRefundHistoryByBookingId(
          widget.bookingId,
          isMounted: () => mounted,
        );
      }
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
                  borderRadius: BorderRadius.circular(20.0),
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
                    onPressed: () => Navigator.of(context).pop(false),
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
                    onPressed: () => Navigator.of(context).pop(true),
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

  // Method untuk pembatalan refund
  Future<void> _cancelRefund(int refundId) async {
    final result =
        await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text('Batalkan Refund?'),
                content: const Text(
                  'Apakah Anda yakin ingin membatalkan permintaan refund ini?',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    child: const Text('Tidak'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
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
        final refundProvider = Provider.of<RefundProvider>(
          context,
          listen: false,
        );
        final success = await refundProvider.cancelRefund(
          refundId,
          isMounted: () => mounted,
        );

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Refund berhasil dibatalkan'),
              backgroundColor: Colors.green,
            ),
          );
          _loadTicketDetails();
        }
      } catch (e) {
        if (mounted) {
          _showSnackBar('Terjadi kesalahan: $e');
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

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final refundProvider = Provider.of<RefundProvider>(context);
    final booking = bookingProvider.currentBooking;
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    if (_isLoading) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [theme.primaryColor.withOpacity(0.7), Colors.white],
            ),
          ),
          child: const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
      );
    }

    if (booking == null) {
      return Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back, color: Colors.black87),
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline_rounded,
                size: 80,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 24),
              Text(
                'Tiket tidak ditemukan',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  'Maaf, kami tidak dapat menemukan tiket yang Anda cari',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadTicketDetails,
                icon: const Icon(Icons.refresh),
                label: const Text('Coba Lagi'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Get data
    DateTime? departureDateTime = DateTimeHelper.combineDateAndTime(
      booking.departureDate,
      booking.schedule?.departureTime ?? '',
    );

    final departureDiff = departureDateTime?.difference(DateTime.now());
    final isWithin2Days =
        departureDiff != null ? departureDiff.inDays < 2 : false;
    final canCancel = booking.status == 'PENDING' && !isWithin2Days;
    final canRefund = booking.status == 'CONFIRMED' && !isWithin2Days;
    final tickets = booking.tickets ?? [];
    final hasMultipleTickets = tickets.length > 1;
    final selectedTicket =
        tickets.isNotEmpty && _selectedTicketIndex < tickets.length
            ? tickets[_selectedTicketIndex]
            : null;
    final isPending = booking.status == 'PENDING';
    final payment =
        booking.payments?.isNotEmpty == true ? booking.payments?.first : null;
    final refund = refundProvider.currentRefund;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            stretch: true,
            backgroundColor: _getStatusColor(booking.status),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'Detail Perjalanan',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                    colors: [
                      _getStatusColor(booking.status).withOpacity(0.8),
                      _getStatusColor(booking.status),
                    ],
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: -20,
                      right: -20,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                    ),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 60,
                      child: Center(
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                'Kode Booking: ${booking.bookingCode}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white),
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),

          // Status Section
          SliverToBoxAdapter(
            child: Container(
              color: _getStatusColor(booking.status),
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 24),
              child: Card(
                margin: EdgeInsets.zero,
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _getStatusColor(
                            booking.status,
                          ).withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _getStatusIcon(booking.status),
                          color: _getStatusColor(booking.status),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getStatusText(booking.status),
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: _getStatusColor(booking.status),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _getStatusDescription(booking.status),
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey[600],
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
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Journey Card
                  _buildSectionCard(
                    title: 'Informasi Perjalanan',
                    icon: Icons.directions_boat_rounded,
                    child: Column(
                      children: [
                        // Route Information
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    booking.schedule?.route?.origin ?? '',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    'Keberangkatan',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: theme.primaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: 50,
                              height: 24,
                              decoration: BoxDecoration(
                                color: theme.primaryColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                Icons.arrow_forward,
                                size: 16,
                                color: theme.primaryColor,
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    booking.schedule?.route?.destination ?? '',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    textAlign: TextAlign.right,
                                  ),
                                  Text(
                                    'Tujuan',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: theme.primaryColor,
                                    ),
                                    textAlign: TextAlign.right,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const Divider(height: 30),

                        // Date & Time
                        Row(
                          children: [
                            Expanded(
                              child: _buildInfoItem(
                                icon: Icons.calendar_today_rounded,
                                title: 'Tanggal',
                                value: DateTimeHelper.formatDate(
                                  booking.departureDate,
                                ),
                                iconColor: theme.primaryColor,
                              ),
                            ),
                            Container(
                              height: 40,
                              width: 1,
                              color: Colors.grey[200],
                              margin: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                            ),
                            Expanded(
                              child: _buildInfoItem(
                                icon: Icons.access_time_rounded,
                                title: 'Waktu',
                                value: DateTimeHelper.formatTime(
                                  booking.schedule?.departureTime ?? '',
                                ),
                                iconColor: theme.primaryColor,
                              ),
                            ),
                          ],
                        ),

                        const Divider(height: 30),

                        // Ferry & Passengers
                        Row(
                          children: [
                            Expanded(
                              child: _buildInfoItem(
                                icon: Icons.directions_boat_filled_rounded,
                                title: 'Kapal',
                                value:
                                    booking.schedule?.ferry?.name ??
                                    'Kapal Ferry',
                                iconColor: theme.primaryColor,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Baris penumpang dan jumlah kendaraan
                        Row(
                          children: [
                            Expanded(
                              child: _buildInfoItem(
                                icon: Icons.people_alt_rounded,
                                title: 'Penumpang',
                                value: '${booking.passengerCount} orang',
                                iconColor: theme.primaryColor,
                              ),
                            ),
                            if (booking.vehicleCount > 0) ...[
                              Container(
                                height: 40,
                                width: 1,
                                color: Colors.grey[200],
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                              ),
                              Expanded(
                                child: _buildInfoItem(
                                  icon: Icons.directions_car_rounded,
                                  title: 'Kendaraan',
                                  value: '${booking.vehicleCount} unit',
                                  iconColor: theme.primaryColor,
                                ),
                              ),
                            ],
                          ],
                        ),

                        // Pindahkan detail kendaraan ke LUAR Row sebagai komponen terpisah
                        if (booking.vehicleCount > 0 &&
                            booking.vehicles != null &&
                            booking.vehicles!.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          const Divider(height: 30),

                          // Render daftar kendaraan
                          ...booking.vehicles!.map((vehicle) {
                            final vehicleTypeText =
                                {
                                  'MOTORCYCLE': 'Sepeda Motor',
                                  'CAR': 'Mobil',
                                  'BUS': 'Bus',
                                  'TRUCK': 'Truk',
                                }[vehicle.type] ??
                                vehicle.type;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 16),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[300]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        {
                                              'MOTORCYCLE': Icons.motorcycle,
                                              'CAR': Icons.directions_car,
                                              'BUS': Icons.directions_bus,
                                              'TRUCK': Icons.local_shipping,
                                            }[vehicle.type] ??
                                            Icons.directions_car,
                                        color: theme.primaryColor,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 10),
                                      Text(
                                        vehicleTypeText,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Plat Nomor',
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              vehicle.licensePlate,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (vehicle.brand != null ||
                                          vehicle.model != null)
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Merk/Model',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                [
                                                      if (vehicle.brand != null)
                                                        vehicle.brand,
                                                      if (vehicle.model != null)
                                                        vehicle.model,
                                                    ]
                                                    .where((e) => e != null)
                                                    .join(' '),
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                    ],
                                  ),
                                  if (vehicle.weight != null) ...[
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Berat',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                '${vehicle.weight} kg',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            );
                          }).toList(),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Payment Information
                  _buildSectionCard(
                    title: 'Informasi Pembayaran',
                    icon: Icons.payment_rounded,
                    child: Column(
                      children: [
                        _buildInfoRow(
                          label: 'Status Pembayaran',
                          value: _getPaymentStatus(booking),
                          valueColor: _getPaymentStatusColor(booking),
                          icon: _getPaymentStatusIcon(booking),
                        ),

                        const Divider(height: 24),

                        _buildInfoRow(
                          label: 'Total Pembayaran',
                          value: _formatCurrency(booking.totalAmount),
                          valueColor: theme.primaryColor,
                        ),

                        // Tambahkan informasi refund jika statusnya COMPLETED
                        if (booking.status == 'REFUNDED' &&
                            refundProvider.currentRefund != null &&
                            refundProvider.currentRefund!.status.toUpperCase() == 'COMPLETED') ...[
                          const Divider(height: 24),

                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Colors.green.withOpacity(0.3),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.monetization_on_rounded,
                                      color: Colors.green,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 10),
                                    const Text(
                                      'Detail Refund',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                _buildInfoRow(
                                  label: 'Jumlah Refund',
                                  value: refundProvider.currentRefund!.formattedAmount,
                                  valueColor: Colors.green,
                                ),
                                const SizedBox(height: 8),
                                _buildInfoRow(
                                  label: 'Biaya Refund',
                                  value: refundProvider.currentRefund!.formattedRefundFee,
                                ),
                                const SizedBox(height: 8),
                                _buildInfoRow(
                                  label: 'Persentase Refund',
                                  value: '${refundProvider.currentRefund!.refundPercentage.toStringAsFixed(0)}%',
                                ),
                                const SizedBox(height: 8),
                                _buildInfoRow(
                                  label: 'Tanggal Refund',
                                  value: refundProvider.currentRefund!.formattedCreatedDate,
                                ),
                                if (refundProvider.currentRefund!.transactionId != null) ...[
                                  const SizedBox(height: 8),
                                  _buildInfoRow(
                                    label: 'ID Transaksi',
                                    value: refundProvider.currentRefund!.transactionId!,
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],

                        if (isPending && payment != null) ...[
                          const Divider(height: 24),

                          _buildInfoRow(
                            label: 'Metode Pembayaran',
                            value: _getReadablePaymentMethod(
                              payment.paymentMethod,
                              payment.paymentType,
                            ),
                          ),

                          if (payment.virtualAccountNumber != null &&
                              payment.virtualAccountNumber!.isNotEmpty) ...[
                            const SizedBox(height: 16),

                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Nomor Virtual Account:',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                GestureDetector(
                                  onTap: () {
                                    Clipboard.setData(
                                      ClipboardData(
                                        text: payment.virtualAccountNumber!,
                                      ),
                                    );
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text(
                                          'Nomor Virtual Account disalin',
                                        ),
                                        behavior: SnackBarBehavior.floating,
                                      ),
                                    );
                                  },
                                  child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[100],
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: theme.primaryColor.withOpacity(
                                          0.5,
                                        ),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          payment.virtualAccountNumber!,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            letterSpacing: 1,
                                          ),
                                        ),
                                        Icon(
                                          Icons.copy,
                                          size: 18,
                                          color: theme.primaryColor,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],

                          const SizedBox(height: 20),

                          if (payment.expiryTime != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.orange.withOpacity(0.3),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.access_time_filled_rounded,
                                    color: Colors.orange,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'Bayar sebelum ${DateTimeHelper.formatDate(payment.expiryTime.toString())} ${DateTimeHelper.formatTime(payment.expiryTime.toString())}',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Colors.orange,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),
                          ],

                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.help_outline_rounded),
                                  label: const Text('Cara Bayar'),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  onPressed:
                                      () => _showPaymentInstructions(
                                        context,
                                        payment,
                                      ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton.icon(
                                  icon:
                                      _isCheckingStatus
                                          ? const SizedBox(
                                            width: 18,
                                            height: 18,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              valueColor:
                                                  AlwaysStoppedAnimation<Color>(
                                                    Colors.white,
                                                  ),
                                            ),
                                          )
                                          : const Icon(Icons.refresh),
                                  label: Text(
                                    _isCheckingStatus
                                        ? 'Memeriksa...'
                                        : 'Cek Status',
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  onPressed:
                                      _isCheckingStatus
                                          ? null
                                          : () {
                                            setState(() {
                                              _isCheckingStatus = true;
                                            });
                                            _refreshPaymentStatus(
                                              booking.bookingCode,
                                            ).then((_) {
                                              if (mounted) {
                                                setState(() {
                                                  _isCheckingStatus = false;
                                                });
                                              }
                                            });
                                          },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),

                  if (!isPending && tickets.isNotEmpty) ...[
                    const SizedBox(height: 20),

                    // Ticket Tabs (if multiple tickets)
                    if (hasMultipleTickets) ...[
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          'Tiket Perjalanan',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                      ),

                      SizedBox(
                        height: 48,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: tickets.length,
                          itemBuilder: (context, index) {
                            final isSelected = index == _selectedTicketIndex;
                            final ticket = tickets[index];

                            return Padding(
                              padding: const EdgeInsets.only(right: 10),
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _selectedTicketIndex = index;
                                  });
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        isSelected
                                            ? theme.primaryColor
                                            : Colors.grey[100],
                                    borderRadius: BorderRadius.circular(24),
                                    boxShadow:
                                        isSelected
                                            ? [
                                              BoxShadow(
                                                color: theme.primaryColor
                                                    .withOpacity(0.3),
                                                blurRadius: 8,
                                                offset: const Offset(0, 3),
                                              ),
                                            ]
                                            : null,
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        ticket.vehicleId != null
                                            ? Icons.directions_car_rounded
                                            : Icons.person_rounded,
                                        size: 18,
                                        color:
                                            isSelected
                                                ? Colors.white
                                                : Colors.grey[600],
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Tiket ${index + 1}',
                                        style: TextStyle(
                                          color:
                                              isSelected
                                                  ? Colors.white
                                                  : Colors.grey[800],
                                          fontWeight:
                                              isSelected
                                                  ? FontWeight.bold
                                                  : FontWeight.normal,
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

                      const SizedBox(height: 16),
                    ],

                    // Ticket Details Card
                    if (selectedTicket != null)
                      _buildSectionCard(
                        title: hasMultipleTickets ? null : 'Tiket Perjalanan',
                        icon:
                            hasMultipleTickets
                                ? null
                                : Icons.confirmation_number_rounded,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: theme.primaryColor.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    selectedTicket.vehicleId != null
                                        ? Icons.directions_car_rounded
                                        : Icons.person_rounded,
                                    color: theme.primaryColor,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        hasMultipleTickets
                                            ? 'Tiket #${_selectedTicketIndex + 1}'
                                            : 'Tiket Perjalanan',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Kode: ${selectedTicket.ticketCode}',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: theme.primaryColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: theme.primaryColor.withOpacity(
                                        0.3,
                                      ),
                                    ),
                                  ),
                                  child: Text(
                                    _getTicketTypeText(
                                      selectedTicket.ticketType,
                                    ),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: theme.primaryColor,
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 16),
                            const Divider(),
                            const SizedBox(height: 16),

                            // Check-in Status
                            _buildStatusBox(
                              icon:
                                  selectedTicket.checkedIn
                                      ? Icons.check_circle_rounded
                                      : Icons.pending_rounded,
                              title:
                                  selectedTicket.checkedIn
                                      ? 'Sudah Check-In'
                                      : 'Belum Check-In',
                              description:
                                  selectedTicket.checkedIn
                                      ? 'Anda sudah melakukan check-in'
                                      : 'Silakan lakukan check-in di lokasi keberangkatan',
                              color:
                                  selectedTicket.checkedIn
                                      ? Colors.green
                                      : Colors.orange,
                            ),

                            const SizedBox(height: 12),

                            // Boarding Status
                            _buildStatusBox(
                              icon: Icons.directions_boat_rounded,
                              title: 'Status Boarding',
                              description: selectedTicket.boardingStatus,
                              color: theme.primaryColor,
                            ),
                          ],
                        ),
                      ),
                  ],

                  // Refund Information (jika ada)
                  if (booking.status == 'REFUND_PENDING' ||
                      booking.status == 'REFUNDED') ...[
                    const SizedBox(height: 20),

                    if (refundProvider.currentRefund != null)
                      _buildSectionCard(
                        title: 'Informasi Refund',
                        icon: Icons.monetization_on_rounded,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildStatusBox(
                              icon: _getRefundStatusIcon(
                                refundProvider.currentRefund!.status,
                              ),
                              title:
                                  'Status Refund: ${refundProvider.currentRefund!.readableStatus}',
                              description:
                                  refundProvider.currentRefund!
                                      .getStatusDescription(),
                              color: Color(
                                refundProvider.currentRefund!.getStatusColor(),
                              ),
                            ),

                            const SizedBox(height: 16),

                            _buildInfoRow(
                              label: 'Jumlah Refund',
                              value:
                                  refundProvider.currentRefund!.formattedAmount,
                              valueColor: Colors.green,
                            ),

                            const Divider(height: 24),

                            _buildInfoRow(
                              label: 'Persentase Refund',
                              value:
                                  '${refundProvider.currentRefund!.refundPercentage.toStringAsFixed(0)}%',
                            ),

                            const SizedBox(height: 8),

                            _buildInfoRow(
                              label: 'Tanggal Pengajuan',
                              value:
                                  refundProvider
                                      .currentRefund!
                                      .formattedCreatedDate,
                            ),

                            // Tombol Cancel jika status masih PENDING
                            if (refundProvider.currentRefund!.status
                                    .toUpperCase() ==
                                'PENDING') ...[
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton(
                                  onPressed:
                                      () => _cancelRefund(
                                        refundProvider.currentRefund!.id,
                                      ),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.red,
                                    side: const BorderSide(color: Colors.red),
                                  ),
                                  child: const Text('Batalkan Refund'),
                                ),
                              ),
                            ],

                            // Tambahkan bagian untuk riwayat refund jika ada lebih dari 1 refund
                            if (refundProvider.refundHistory.length > 1) ...[
                              const SizedBox(height: 24),
                              const Divider(),
                              const SizedBox(height: 8),

                              Text(
                                'Riwayat Refund',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[800],
                                ),
                              ),

                              const SizedBox(height: 12),

                              ...refundProvider.refundHistory
                                  .where(
                                    (r) =>
                                        r.id !=
                                        refundProvider.currentRefund!.id,
                                  )
                                  .map(
                                    (refund) => Padding(
                                      padding: const EdgeInsets.only(bottom: 8),
                                      child: Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[50],
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          border: Border.all(
                                            color: Colors.grey[300]!,
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text(
                                                  refund.readableStatus,
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(
                                                      refund.getStatusColor(),
                                                    ),
                                                  ),
                                                ),
                                                Text(
                                                  refund.formattedCreatedDate,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text('Jumlah:'),
                                                Text(
                                                  refund.formattedAmount,
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            if (refund.status.toUpperCase() ==
                                                    'REJECTED' &&
                                                refund.rejectionReason !=
                                                    null) ...[
                                              const SizedBox(height: 4),
                                              Text(
                                                'Alasan: ${refund.rejectionReason}',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                  fontStyle: FontStyle.italic,
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    ),
                                  )
                                  .toList(),
                            ],
                          ],
                        ),
                      ),
                  ],

                  // Action Buttons
                  if (canCancel || canRefund) ...[
                    const SizedBox(height: 20),

                    _buildSectionCard(
                      title: 'Aksi Pemesanan',
                      icon: Icons.settings,
                      child: Column(
                        children: [
                          if (canRefund)
                            Column(
                              children: [
                                ElevatedButton.icon(
                                  onPressed: () {
                                    // Navigasi ke halaman RefundRequestScreen
                                    Navigator.of(context).pushNamed(
                                      '/refund/request',
                                      arguments: booking,
                                    ).then((result) {
                                      // Refresh data tiket jika refund berhasil dibuat
                                      if (result == true) {
                                        _loadTicketDetails();
                                      }
                                    });
                                  },
                                  icon: const Icon(
                                    Icons.monetization_on_rounded,
                                  ),
                                  label: const Text('Minta Refund'),
                                  style: ElevatedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    backgroundColor: Colors.orange[700],
                                    minimumSize: const Size(
                                      double.infinity,
                                      48,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ],
                            ),

                          if (canCancel) ...[
                            if (canRefund) const SizedBox(height: 12),

                            OutlinedButton.icon(
                              onPressed: _cancelBooking,
                              icon: const Icon(Icons.cancel_rounded),
                              label: const Text('Batalkan Pemesanan'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: const BorderSide(color: Colors.red),
                                minimumSize: const Size(double.infinity, 48),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Helper Methods
  Widget _buildSectionCard({
    String? title,
    IconData? icon,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null) ...[
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (icon != null) ...[
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        icon,
                        color: Theme.of(context).primaryColor,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
          ],
          Padding(padding: const EdgeInsets.all(16), child: child),
        ],
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String title,
    required String value,
    Color? iconColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor?.withOpacity(0.1) ?? Colors.grey[100],
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor ?? Colors.grey[600], size: 16),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow({
    required String label,
    required String value,
    IconData? icon,
    Color? valueColor,
  }) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
        ),
        if (icon != null) ...[
          Icon(icon, size: 16, color: valueColor ?? Colors.grey[800]),
          const SizedBox(width: 8),
        ],
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: valueColor ?? Colors.grey[800],
            fontSize: 15,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBox({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: color,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Helper functions
  Future<void> _refreshPaymentStatus(String bookingCode) async {
    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final success = await bookingProvider.refreshPaymentStatus(bookingCode);

      if (mounted) {
        if (success) {
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

      final instructions = await bookingProvider.getPaymentInstructions(
        paymentMethod,
        paymentType,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          builder:
              (context) => DraggableScrollableSheet(
                initialChildSize: 0.65,
                minChildSize: 0.4,
                maxChildSize: 0.9,
                expand: false,
                builder:
                    (context, scrollController) => Padding(
                      padding: const EdgeInsets.all(20),
                      child: ListView(
                        controller: scrollController,
                        children: [
                          Center(
                            child: Container(
                              width: 40,
                              height: 4,
                              decoration: BoxDecoration(
                                color: Colors.grey[300],
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            instructions['title'] ?? 'Cara Pembayaran',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          const Divider(),
                          const SizedBox(height: 20),

                          ...List.generate(
                            (instructions['steps'] as List<dynamic>).length,
                            (index) => Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      color: Theme.of(
                                        context,
                                      ).primaryColor.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: Text(
                                        '${index + 1}',
                                        style: TextStyle(
                                          color: Theme.of(context).primaryColor,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      instructions['steps'][index],
                                      style: const TextStyle(fontSize: 15),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: const Text('Tutup'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              minimumSize: const Size(double.infinity, 48),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ],
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
    }

    return method;
  }

  // Utility functions for status colors and icons
  IconData _getPaymentStatusIcon(booking) {
    final status = _getPaymentStatus(booking);
    switch (status) {
      case 'Berhasil':
        return Icons.check_circle;
      case 'Menunggu Pembayaran':
        return Icons.pending;
      case 'Gagal':
      case 'Kedaluwarsa':
        return Icons.cancel;
      case 'Dikembalikan':
        return Icons.assignment_return;
      default:
        return Icons.help;
    }
  }

  Color _getPaymentStatusColor(booking) {
    final status = _getPaymentStatus(booking);
    switch (status) {
      case 'Berhasil':
        return Colors.green;
      case 'Menunggu Pembayaran':
        return Colors.orange;
      case 'Gagal':
      case 'Kedaluwarsa':
        return Colors.red;
      case 'Dikembalikan':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green;
      case 'COMPLETED':
        return Colors.blue;
      case 'CANCELLED':
      case 'REFUNDED':
        return Colors.red;
      case 'PENDING':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'COMPLETED':
        return Icons.done_all;
      case 'CANCELLED':
      case 'REFUNDED':
        return Icons.cancel;
      case 'PENDING':
        return Icons.pending;
      default:
        return Icons.info;
    }
  }

  IconData _getRefundStatusIcon(String status) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return Icons.check_circle;
      case 'PENDING':
        return Icons.pending;
      case 'PROCESSING':
        return Icons.sync;
      case 'REJECTED':
        return Icons.cancel;
      case 'CANCELLED':
        return Icons.block;
      default:
        return Icons.help_outline;
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
}