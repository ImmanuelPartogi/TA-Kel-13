import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class BookingSummaryScreen extends StatefulWidget {
  const BookingSummaryScreen({Key? key}) : super(key: key);

  @override
  _BookingSummaryScreenState createState() => _BookingSummaryScreenState();
}

class _BookingSummaryScreenState extends State<BookingSummaryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  
  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }
  
  Future<void> _createBooking() async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    final result = await bookingProvider.createBooking();
    
    if (result && mounted) {
      Navigator.pushNamed(context, '/booking/payment');
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final route = bookingProvider.selectedRoute;
    final schedule = bookingProvider.selectedSchedule;
    final date = bookingProvider.selectedDate;
    final passengers = bookingProvider.passengers;
    final vehicles = bookingProvider.vehicles;
    
    // Validate booking data
    if (route == null || schedule == null || date == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/booking/routes');
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // Format values
    final dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Ringkasan Pemesanan',
        showBackButton: true,
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Booking Summary
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Route Details
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Detail Perjalanan',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const Divider(),
                            const SizedBox(height: 8),
                            _buildInfoRow(
                              'Rute',
                              '${route.origin} - ${route.destination}',
                            ),
                            const SizedBox(height: 8),
                            _buildInfoRow(
                              'Tanggal',
                              dateFormat.format(date),
                            ),
                            const SizedBox(height: 8),
                            _buildInfoRow(
                              'Waktu',
                              '${schedule.departureTime} - ${schedule.arrivalTime}',
                            ),
                            const SizedBox(height: 8),
                            _buildInfoRow(
                              'Kapal',
                              schedule.ferry?.name ?? '-',
                            ),
                            const SizedBox(height: 8),
                            _buildInfoRow(
                              'Durasi',
                              '${route.duration ~/ 60} jam ${route.duration % 60} menit',
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Passenger Details
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
                                  'Penumpang',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Text(
                                  '${passengers.length} orang',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(),
                            ...passengers.asMap().entries.map((entry) {
                              final index = entry.key;
                              final passenger = entry.value;
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: _buildInfoRow(
                                  'Penumpang ${index + 1}',
                                  passenger['name'],
                                ),
                              );
                            }).toList(),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Vehicle Details (if any)
                    if (vehicles.isNotEmpty)
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
                                    'Kendaraan',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    '${vehicles.length} unit',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(),
                              ...vehicles.map((vehicle) {
                                String vehicleType;
                                switch (vehicle['type']) {
                                  case 'MOTORCYCLE':
                                    vehicleType = 'Motor';
                                    break;
                                  case 'CAR':
                                    vehicleType = 'Mobil';
                                    break;
                                  case 'BUS':
                                    vehicleType = 'Bus';
                                    break;
                                  case 'TRUCK':
                                    vehicleType = 'Truk';
                                    break;
                                  default:
                                    vehicleType = 'Kendaraan';
                                }
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: _buildInfoRow(
                                    vehicleType,
                                    vehicle['license_plate'],
                                  ),
                                );
                              }).toList(),
                            ],
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                    
                    // Notes Field
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Catatan Tambahan',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _notesController,
                              maxLines: 3,
                              decoration: const InputDecoration(
                                hintText: 'Tambahkan catatan jika diperlukan (opsional)',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Price Details
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Rincian Harga',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const Divider(),
                            _buildPriceRow(
                              'Penumpang (${passengers.length} x ${currencyFormat.format(route.basePrice)})',
                              bookingProvider.passengerCost,
                            ),
                            if (vehicles.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              const Divider(height: 1),
                              const SizedBox(height: 8),
                              _buildPriceRow(
                                'Kendaraan',
                                bookingProvider.vehicleCost,
                              ),
                            ],
                            const SizedBox(height: 16),
                            _buildPriceRow(
                              'Total',
                              bookingProvider.totalCost,
                              isTotal: true,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Bottom Bar
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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Total Pembayaran',
                          style: TextStyle(
                            fontSize: 14,
                          ),
                        ),
                        Text(
                          currencyFormat.format(bookingProvider.totalCost),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: bookingProvider.isLoading ? null : _createBooking,
                      child: bookingProvider.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.0,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Lanjutkan ke Pembayaran'),
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
  
  Widget _buildPriceRow(String label, double price, {bool isTotal = false}) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: isTotal ? FontWeight.bold : null,
          ),
        ),
        Text(
          currencyFormat.format(price),
          style: TextStyle(
            fontWeight: isTotal ? FontWeight.bold : null,
            color: isTotal ? Theme.of(context).primaryColor : null,
          ),
        ),
      ],
    );
  }
}