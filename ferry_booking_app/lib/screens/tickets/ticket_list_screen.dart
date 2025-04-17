import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/ticket_card.dart';

class TicketListScreen extends StatefulWidget {
  const TicketListScreen({Key? key}) : super(key: key);

  @override
  _TicketListScreenState createState() => _TicketListScreenState();
}

class _TicketListScreenState extends State<TicketListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    
    // Use post-frame callback to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadBookings();
    });
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
    
    // Filter bookings by status
    final upcomingBookings = bookings?.where(
      (booking) => booking.status == 'CONFIRMED'
    ).toList() ?? [];
    
    final completedBookings = bookings?.where(
      (booking) => booking.status == 'COMPLETED'
    ).toList() ?? [];
    
    final cancelledBookings = bookings?.where(
      (booking) => booking.status == 'CANCELLED' || booking.status == 'REFUNDED'
    ).toList() ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tiket Saya'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Akan Datang'),
            Tab(text: 'Selesai'),
            Tab(text: 'Dibatalkan'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Upcoming tickets
          RefreshIndicator(
            onRefresh: _refreshBookings,
            child: bookingProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : upcomingBookings.isEmpty
                    ? _buildEmptyTickets('Tidak ada tiket untuk perjalanan yang akan datang')
                    : ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: upcomingBookings.length,
                        itemBuilder: (context, index) {
                          return TicketCard(
                            booking: upcomingBookings[index],
                            onTap: () {
                              Navigator.pushNamed(
                                context, 
                                '/tickets/detail',
                                arguments: upcomingBookings[index].id,
                              );
                            },
                          );
                        },
                      ),
          ),
          
          // Completed tickets
          RefreshIndicator(
            onRefresh: _refreshBookings,
            child: bookingProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : completedBookings.isEmpty
                    ? _buildEmptyTickets('Tidak ada tiket untuk perjalanan yang telah selesai')
                    : ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: completedBookings.length,
                        itemBuilder: (context, index) {
                          return TicketCard(
                            booking: completedBookings[index],
                            onTap: () {
                              Navigator.pushNamed(
                                context, 
                                '/tickets/detail',
                                arguments: completedBookings[index].id,
                              );
                            },
                          );
                        },
                      ),
          ),
          
          // Cancelled tickets
          RefreshIndicator(
            onRefresh: _refreshBookings,
            child: bookingProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : cancelledBookings.isEmpty
                    ? _buildEmptyTickets('Tidak ada tiket yang dibatalkan')
                    : ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: cancelledBookings.length,
                        itemBuilder: (context, index) {
                          return TicketCard(
                            booking: cancelledBookings[index],
                            onTap: () {
                              Navigator.pushNamed(
                                context, 
                                '/tickets/detail',
                                arguments: cancelledBookings[index].id,
                              );
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/booking/routes');
        },
        child: const Icon(Icons.add),
        tooltip: 'Pesan Tiket',
      ),
    );
  }
  
  Widget _buildEmptyTickets(String message) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.confirmation_number_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
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
      ),
    );
  }
}