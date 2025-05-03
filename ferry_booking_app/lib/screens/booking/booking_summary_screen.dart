import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';

class BookingSummaryScreen extends StatefulWidget {
  const BookingSummaryScreen({Key? key}) : super(key: key);

  @override
  _BookingSummaryScreenState createState() => _BookingSummaryScreenState();
}

class _BookingSummaryScreenState extends State<BookingSummaryScreen> {
  bool _isLoading = false;
  bool _isSuccessful = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Ringkasan Pemesanan'),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final selectedRoute = bookingProvider.selectedRoute;
    final selectedSchedule = bookingProvider.selectedSchedule;
    final selectedDate = bookingProvider.selectedDate;

    if (selectedRoute == null ||
        selectedSchedule == null ||
        selectedDate == null) {
      return const Center(child: Text('Data pemesanan tidak lengkap.'));
    }

    // Format tanggal dan waktu
    final dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    final timeFormat = DateFormat('HH:mm', 'id_ID');

    // Format mata uang
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    // Hitung info dari jadwal
    // PERBAIKAN: Tambahkan pengecekan null pada departureTime dan arrivalTime
    final departureTime =
        selectedSchedule.departureTime != null
            ? DateTime.parse(selectedSchedule.departureTime!)
            : DateTime.now();
    final arrivalTime =
        selectedSchedule.arrivalTime != null
            ? DateTime.parse(selectedSchedule.arrivalTime!)
            : departureTime.add(Duration(minutes: selectedRoute.duration));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Informasi Rute & Jadwal
          _buildSection(
            title: 'Informasi Rute & Jadwal',
            child: Column(
              children: [
                // Pelabuhan & Waktu
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            selectedRoute.origin,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            timeFormat.format(departureTime),
                            style: const TextStyle(fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      children: [
                        const Icon(Icons.arrow_forward, color: Colors.grey),
                        Text(
                          '${selectedRoute.duration} min',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            selectedRoute.destination,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            textAlign: TextAlign.end,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            timeFormat.format(arrivalTime),
                            style: const TextStyle(fontSize: 14),
                            textAlign: TextAlign.end,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 12),

                // Tanggal Keberangkatan
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tanggal Keberangkatan: ${DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(bookingProvider.selectedDate!)}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],  
                ),
                const SizedBox(height: 8),

                // Kode Rute
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Kode Rute'),
                    Text(
                      selectedRoute.routeCode ??
                          'N/A', // PERBAIKAN: tambahkan null check
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Nama Kapal
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Nama Kapal'),
                    Text(
                      selectedSchedule.ferry?.name ?? 'Tidak diketahui',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Detail Penumpang
          _buildSection(
            title: 'Detail Penumpang',
            child: Column(
              children: [
                // Header
                Row(
                  children: const [
                    Expanded(
                      flex: 5,
                      child: Text(
                        'Kategori',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text(
                        'Jumlah',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Expanded(
                      flex: 4,
                      child: Text(
                        'Harga',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.end,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Divider(),

                // Daftar Kategori Penumpang
                _buildPassengerCategory(
                  context,
                  'Dewasa',
                  'Usia 12 tahun ke atas',
                  bookingProvider.passengerCounts['adult'] ?? 0,
                  selectedRoute.basePrice,
                  currencyFormat,
                ),

                if ((bookingProvider.passengerCounts['child'] ?? 0) > 0)
                  _buildPassengerCategory(
                    context,
                    'Anak-anak',
                    'Usia 2-11 tahun',
                    bookingProvider.passengerCounts['child'] ?? 0,
                    selectedRoute.basePrice * 0.75, // 75% dari harga dewasa
                    currencyFormat,
                  ),

                if ((bookingProvider.passengerCounts['infant'] ?? 0) > 0)
                  _buildPassengerCategory(
                    context,
                    'Bayi',
                    'Usia di bawah 2 tahun',
                    bookingProvider.passengerCounts['infant'] ?? 0,
                    selectedRoute.basePrice * 0.1, // 10% dari harga dewasa
                    currencyFormat,
                  ),

                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 4),

                // Total Penumpang
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total Penumpang: ${bookingProvider.totalPassengers}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      currencyFormat.format(bookingProvider.passengerCost),
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),

                if (bookingProvider.vehicles.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Divider(thickness: 2),
                  const SizedBox(height: 12),

                  // Header Kendaraan
                  Row(
                    children: const [
                      Expanded(
                        flex: 6,
                        child: Text(
                          'Kendaraan',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          'Plat Nomor',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Harga',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.end,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(),

                  // Daftar Kendaraan
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: bookingProvider.vehicles.length,
                    separatorBuilder: (context, index) => const Divider(),
                    itemBuilder: (context, index) {
                      // PERUBAHAN: Akses langsung objek Vehicle
                      final vehicle = bookingProvider.vehicles[index];
                      double price;

                      // PERUBAHAN: Akses properti objek, bukan key Map
                      switch (vehicle.type) {
                        case 'MOTORCYCLE':
                          price = selectedRoute.motorcyclePrice;
                          break;
                        case 'CAR':
                          price = selectedRoute.carPrice;
                          break;
                        case 'BUS':
                          price = selectedRoute.busPrice;
                          break;
                        case 'TRUCK':
                          price = selectedRoute.truckPrice;
                          break;
                        default:
                          price = 0;
                      }

                      // PERUBAHAN: Akses properti objek dengan null safety
                      final brand = vehicle.brand ?? '';
                      final model = vehicle.model ?? '';
                      final licensePlate = vehicle.licensePlate;

                      return Row(
                        children: [
                          Expanded(
                            flex: 6,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '$brand $model',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  _getVehicleTypeName(vehicle.type),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            flex: 3,
                            child: Text(
                              licensePlate,
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Text(
                              currencyFormat.format(price),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.end,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Rincian Biaya
          _buildSection(
            title: 'Rincian Biaya',
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Penumpang (${bookingProvider.totalPassengers} orang)',
                    ),
                    Text(currencyFormat.format(bookingProvider.passengerCost)),
                  ],
                ),
                if (bookingProvider.vehicles.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Kendaraan (${bookingProvider.vehicles.length} unit)',
                      ),
                      Text(currencyFormat.format(bookingProvider.vehicleCost)),
                    ],
                  ),
                ],
                const SizedBox(height: 8),
                const Divider(),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Pembayaran',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      currencyFormat.format(bookingProvider.totalCost),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildActionButtons(context),
        ],
      ),
    );
  }

  Widget _buildPassengerCategory(
    BuildContext context,
    String title,
    String subtitle,
    int count,
    double price,
    NumberFormat formatter,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Expanded(
            flex: 5,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              count.toString(),
              style: const TextStyle(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              formatter.format(price * count),
              style: const TextStyle(fontWeight: FontWeight.bold),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection({required String title, required Widget child}) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        // Pesan Tiket - DIUBAH: Sekarang hanya menyiapkan data booking sementara
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed:
                _isLoading || _isSuccessful
                    ? null
                    : () => _prepareBookingAndNavigate(context),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              backgroundColor: Theme.of(context).primaryColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              _isSuccessful ? 'Pemesanan Berhasil' : 'Lanjutkan ke Pembayaran',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(height: 12),
        // Ubah Data
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed:
                _isLoading || _isSuccessful
                    ? null
                    : () => Navigator.of(context).pop(),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              side: BorderSide(color: Theme.of(context).primaryColor),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Ubah Data',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  // Konversi tipe kendaraan ke nama yang lebih mudah dibaca
  String _getVehicleTypeName(String type) {
    switch (type) {
      case 'MOTORCYCLE':
        return 'Motor';
      case 'CAR':
        return 'Mobil';
      case 'BUS':
        return 'Bus';
      case 'TRUCK':
        return 'Truk';
      default:
        return type;
    }
  }

  // PERUBAHAN: Metode untuk menyiapkan booking tanpa memanggil API create langsung
  Future<void> _prepareBookingAndNavigate(BuildContext context) async {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    setState(() {
      _isLoading = true;
    });

    try {
      // Persiapkan data booking tanpa mengirim ke API
      final success = await bookingProvider.prepareBooking();

      setState(() {
        _isLoading = false;
        _isSuccessful = success;
      });

      if (success && mounted) {
        // Langsung navigasi ke halaman pemilihan metode pembayaran
        Navigator.pushNamed(context, '/booking/payment-method');
      } else if (mounted) {
        _showErrorMessage(context, bookingProvider.errorMessage);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _handleNavigationError(context, e.toString());
    }
  }

  // Metode bantuan untuk menangani error navigasi
  void _handleNavigationError(BuildContext context, String error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Terjadi kesalahan: $error'),
        backgroundColor: Colors.red,
        action: SnackBarAction(
          label: 'Lihat Bookings',
          onPressed: () {
            Navigator.pushNamed(context, '/bookings');
          },
          textColor: Colors.white,
        ),
      ),
    );
  }

  // Metode bantuan untuk menampilkan pesan error
  void _showErrorMessage(BuildContext context, String? message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message ?? 'Gagal membuat pemesanan'),
        backgroundColor: Colors.red,
      ),
    );
  }
}