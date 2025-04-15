import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class BookingSuccessScreen extends StatelessWidget {
  final int bookingId;
  
  const BookingSuccessScreen({
    Key? key,
    required this.bookingId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Pembayaran Berhasil',
        showBackButton: false,
      ),
      body: FutureBuilder(
        future: _loadBookingDetails(context),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          
          return _buildSuccessContent(context);
        },
      ),
    );
  }
  
  Future<void> _loadBookingDetails(BuildContext context) async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    if (bookingProvider.currentBooking?.id != bookingId) {
      await bookingProvider.getBookingDetails(bookingId);
    }
  }
  
  Widget _buildSuccessContent(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;
    
    if (booking == null) {
      return Center(
        child: Text(
          'Booking tidak ditemukan',
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 16,
          ),
        ),
      );
    }
    
    // Format date
    final dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    final bookingDate = DateTime.parse(booking.bookingDate);
    
    return Column(
      children: [
        // Success icon and message
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.check_circle,
                    size: 80,
                    color: Colors.green[600],
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Pembayaran Berhasil!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Tiket Anda telah berhasil dipesan dan dibayar',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                
                // Booking details card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Detail Pemesanan',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green[100],
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'CONFIRMED',
                                style: TextStyle(
                                  color: Colors.green[700],
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Kode Booking',
                          booking.bookingCode,
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          'Rute',
                          '${booking.schedule?.route?.origin ?? ''} - ${booking.schedule?.route?.destination ?? ''}',
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          'Tanggal',
                          dateFormat.format(bookingDate),
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          'Waktu',
                          '${booking.schedule?.departureTime ?? ''} - ${booking.schedule?.arrivalTime ?? ''}',
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          'Kapal',
                          booking.schedule?.ferry?.name ?? '-',
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          'Penumpang',
                          '${booking.passengerCount} orang',
                        ),
                        if (booking.vehicleCount > 0) ...[
                          const SizedBox(height: 8),
                          _buildInfoRow(
                            'Kendaraan',
                            '${booking.vehicleCount} unit',
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        
        // Bottom buttons
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 5,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, '/home');
                  },
                  child: const Text('Kembali ke Beranda'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(
                      context, 
                      '/tickets/detail',
                      arguments: booking.id,
                    );
                  },
                  child: const Text('Lihat Tiket'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.grey,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}