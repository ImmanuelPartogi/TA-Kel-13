import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class TicketDetailScreen extends StatefulWidget {
  final int bookingId;
  
  const TicketDetailScreen({
    Key? key,
    required this.bookingId,
  }) : super(key: key);

  @override
  _TicketDetailScreenState createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen> {
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _loadTicketDetails();
  }
  
  Future<void> _loadTicketDetails() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
      await bookingProvider.getBookingDetails(widget.bookingId);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  
  Future<void> _cancelBooking() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Batalkan Pemesanan?'),
        content: const Text(
          'Apakah Anda yakin ingin membatalkan pemesanan ini? '
          'Proses ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Tidak'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya, Batalkan'),
          ),
        ],
      ),
    ) ?? false;
    
    if (result) {
      setState(() {
        _isLoading = true;
      });
      
      try {
        final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
        final success = await bookingProvider.cancelBooking(widget.bookingId);
        
        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Pemesanan berhasil dibatalkan'),
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

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;
    
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    if (booking == null) {
      return Scaffold(
        appBar: const CustomAppBar(
          title: 'Detail Tiket',
          showBackButton: true,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                'Tiket tidak ditemukan',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    // Format date
    final dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    final bookingDate = DateTime.parse(booking.bookingDate);
    
    // Check if can be cancelled
    final now = DateTime.now();
    final isWithin24Hours = bookingDate.difference(now).inHours <= 24;
    final canCancel = booking.status == 'CONFIRMED' && !isWithin24Hours;
    
    // Get ticket for QR Code
    final tickets = booking.tickets;
    final firstTicket = tickets != null && tickets.isNotEmpty ? tickets.first : null;
    
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Tiket #${booking.bookingCode}',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Card(
              color: _getStatusColor(booking.status),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(
                      _getStatusIcon(booking.status),
                      color: Colors.white,
                      size: 32,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _getStatusText(booking.status),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          Text(
                            _getStatusDescription(booking.status),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Ticket Card with QR Code
            if (firstTicket != null)
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Route and Ferry info
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.directions_boat,
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${booking.schedule?.route?.origin ?? ''} - ${booking.schedule?.route?.destination ?? ''}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  booking.schedule?.ferry?.name ?? '-',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 32),
                      
                      // Date and Time
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Tanggal',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  dateFormat.format(bookingDate),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Waktu',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  '${booking.schedule?.departureTime ?? ''}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Passenger and Vehicle Count
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Penumpang',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  '${booking.passengerCount} orang',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (booking.vehicleCount > 0)
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Kendaraan',
                                    style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    '${booking.vehicleCount} unit',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const Divider(height: 32),
                      
                      // QR Code
                      Column(
                        children: [
                          const Text(
                            'Tunjukkan QR Code ini saat check-in',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: 200,
                            height: 200,
                            child: QrImageView(
                              data: firstTicket.qrCode,
                              version: QrVersions.auto,
                              backgroundColor: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Ticket #${firstTicket.ticketCode}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 24),
            
            // Booking Information
            const Text(
              'Informasi Pemesanan',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 16),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildInfoRow('Kode Booking', booking.bookingCode),
                    const Divider(height: 24),
                    _buildInfoRow('Status Pembayaran', _getPaymentStatus(booking)),
                    const Divider(height: 24),
                    _buildInfoRow('Total Pembayaran', _formatCurrency(booking.totalAmount)),
                    if (booking.status == 'CANCELLED') ...[
                      const Divider(height: 24),
                      _buildInfoRow('Alasan Pembatalan', booking.cancellationReason ?? '-'),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            
            // Cancel Button (if applicable)
            if (canCancel)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.cancel),
                  label: const Text('Batalkan Pemesanan'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                  ),
                  onPressed: _cancelBooking,
                ),
              ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.grey,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
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
      return 'Belum dibayar';
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
}