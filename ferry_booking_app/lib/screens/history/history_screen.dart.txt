import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/booking_card.dart';
import 'package:ferry_booking_app/config/theme.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  _HistoryScreenState createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    await bookingProvider.getBookings();
  }

  Future<void> _refreshBookings() async {
    await _loadBookings();
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final bookings = bookingProvider.bookings;
    
    // Filter hanya untuk riwayat (booking yang sudah COMPLETED atau CANCELLED)
    final historyBookings = bookings?.where(
      (booking) => booking.status == 'COMPLETED' || booking.status == 'CANCELLED' || booking.status == 'REFUNDED'
    ).toList() ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Perjalanan'),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshBookings,
        child: bookingProvider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : historyBookings.isEmpty
                ? _buildEmptyHistory()
                : ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: historyBookings.length,
                    itemBuilder: (context, index) {
                      return BookingCard(
                        booking: historyBookings[index],
                        onTap: () {
                          Navigator.pushNamed(
                            context, 
                            '/tickets/detail',
                            arguments: historyBookings[index].id,
                          );
                        },
                      );
                    },
                  ),
      ),
    );
  }

  Widget _buildEmptyHistory() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada riwayat perjalanan',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              Navigator.pushNamed(context, '/booking/routes');
            },
            child: const Text('Pesan Tiket Sekarang'),
          ),
        ],
      ),
    );
  }
}