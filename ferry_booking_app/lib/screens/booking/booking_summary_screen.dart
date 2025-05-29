import 'package:ferry_booking_app/models/vehicle_category.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';
import '../../utils/date_time_helper.dart'; // Import DateTimeHelper

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
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: const CustomAppBar(
        title: 'Ringkasan Pemesanan',
        showBackButton: true,
      ),
      body:
          _isLoading
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: theme.primaryColor),
                    const SizedBox(height: 16),
                    Text(
                      'Memproses pemesanan...',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              )
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final selectedRoute = bookingProvider.selectedRoute;
    final selectedSchedule = bookingProvider.selectedSchedule;
    final selectedDate = bookingProvider.selectedDate;
    final theme = Theme.of(context);

    if (selectedRoute == null ||
        selectedSchedule == null ||
        selectedDate == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: theme.primaryColor.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            const Text(
              'Data pemesanan tidak lengkap',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Silakan lengkapi data pemesanan Anda',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Kembali'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // Format mata uang
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    // Dapatkan string waktu keberangkatan dan kedatangan
    final departureTimeStr = selectedSchedule.departureTime ?? DateTime.now().toString();
    final arrivalTimeStr = selectedSchedule.arrivalTime ?? 
        DateTime.now().add(Duration(minutes: selectedRoute.duration)).toString();

    // Parse ke DateTime untuk perhitungan internal jika diperlukan
    final departureTime = DateTime.parse(departureTimeStr);
    final arrivalTime = 
        selectedSchedule.arrivalTime != null
            ? DateTime.parse(selectedSchedule.arrivalTime!)
            : departureTime.add(Duration(minutes: selectedRoute.duration));

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Pemesanan
            _buildBookingStatus(),

            // Informasi Rute & Jadwal
            _buildRouteInfoSection(
              theme,
              selectedRoute,
              departureTimeStr,
              arrivalTimeStr,
              selectedSchedule,
              bookingProvider,
            ),

            // Detail Penumpang
            _buildPassengerSection(
              theme,
              bookingProvider,
              selectedRoute,
              currencyFormat,
            ),

            // Rincian Biaya
            _buildPriceSummarySection(theme, bookingProvider, currencyFormat),

            // Tombol Aksi
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildActionButtons(context),
            ),

            // Kebijakan
            _buildPolicyInfo(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingStatus() {
    final isActive = !_isSuccessful; // Status aktif jika belum sukses

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: isActive ? Colors.blue.shade50 : Colors.green.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isActive ? Colors.blue.shade200 : Colors.green.shade200,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isActive ? Icons.info_outline : Icons.check_circle_outline,
            color: isActive ? Colors.blue.shade700 : Colors.green.shade700,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              isActive
                  ? 'Silakan periksa ringkasan pemesanan sebelum melanjutkan'
                  : 'Pemesanan berhasil disiapkan, lanjutkan ke pembayaran',
              style: TextStyle(
                fontSize: 13,
                color: isActive ? Colors.blue.shade700 : Colors.green.shade700,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteInfoSection(
    ThemeData theme,
    dynamic selectedRoute,
    String departureTimeStr,
    String arrivalTimeStr,
    dynamic selectedSchedule,
    dynamic bookingProvider,
  ) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.directions_boat_rounded,
                  color: theme.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Informasi Rute & Jadwal',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: theme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Jadwal Ferry dengan Visual Timeline
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  // Jadwal dengan visual timeline
                  Row(
                    children: [
                      // Departure
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              DateTimeHelper.formatTime(departureTimeStr),
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: theme.primaryColor,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              selectedRoute.origin,
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Timeline
                      Column(
                        children: [
                          Container(
                            width: 100,
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            decoration: BoxDecoration(
                              color: theme.primaryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Center(
                              child: Text(
                                DateTimeHelper.formatDuration(selectedRoute.duration),
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: theme.primaryColor,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              Container(
                                height: 2,
                                width: 80,
                                color: theme.primaryColor.withOpacity(0.3),
                              ),
                              Icon(
                                Icons.directions_boat,
                                color: theme.primaryColor,
                                size: 16,
                              ),
                            ],
                          ),
                        ],
                      ),

                      // Arrival
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              DateTimeHelper.formatTime(arrivalTimeStr),
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: theme.primaryColor,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              selectedRoute.destination,
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: 15,
                              ),
                              textAlign: TextAlign.end,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Tanggal, Kode Rute, dan Kapal dalam format list dengan icon
            _buildInfoRow(
              Icons.calendar_today,
              'Tanggal Keberangkatan',
              DateTimeHelper.formatDate(bookingProvider.selectedDate!.toString()),
            ),

            const Divider(height: 24),

            _buildInfoRow(
              Icons.qr_code,
              'Kode Rute',
              selectedRoute.routeCode ?? 'N/A',
            ),

            const Divider(height: 24),

            _buildInfoRow(
              Icons.directions_boat_filled,
              'Nama Kapal',
              selectedSchedule.ferry?.name ?? 'Tidak diketahui',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade600),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(fontSize: 14, color: Colors.grey.shade800),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildPassengerSection(
    ThemeData theme,
    dynamic bookingProvider,
    dynamic selectedRoute,
    NumberFormat currencyFormat,
  ) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.people_alt_rounded,
                  color: theme.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Detail Penumpang & Kendaraan',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: theme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Header Penumpang
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                children: const [
                  Expanded(
                    flex: 5,
                    child: Text(
                      'Kategori',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Jumlah',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
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
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ],
              ),
            ),

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

            const Divider(height: 24),

            // Total Penumpang
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Penumpang: ${bookingProvider.totalPassengers}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                Text(
                  currencyFormat.format(bookingProvider.passengerCost),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: theme.primaryColor,
                  ),
                ),
              ],
            ),

            // Daftar Kendaraan jika ada
            if (bookingProvider.vehicles.isNotEmpty) ...[
              const SizedBox(height: 24),

              // Header Kendaraan
              Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 8,
                  horizontal: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  children: const [
                    Expanded(
                      flex: 6,
                      child: Text(
                        'Kendaraan',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text(
                        'Plat Nomor',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text(
                        'Harga',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                        textAlign: TextAlign.end,
                      ),
                    ),
                  ],
                ),
              ),

              // Daftar Kendaraan dengan tampilan yang lebih baik
              const SizedBox(height: 8),
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: bookingProvider.vehicles.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final vehicle = bookingProvider.vehicles[index];

                  double price;

                  // Dapatkan kategori kendaraan berdasarkan vehicle_category_id
                  final vehicleCategories = bookingProvider.vehicleCategories;
                  VehicleCategory? category;

                  if (vehicleCategories.isNotEmpty) {
                    // Cari kategori yang sesuai dengan vehicle_category_id
                    for (var cat in vehicleCategories) {
                      if (cat.id == vehicle.vehicle_category_id) {
                        category = cat;
                        break;
                      }
                    }

                    // Jika tidak ditemukan, gunakan kategori pertama sebagai fallback
                    if (category == null) {
                      category = vehicleCategories.first;
                    }
                  }

                  if (category != null) {
                    price = category.basePrice;
                    print(
                      'Found price for ${vehicle.licensePlate}: ${category.basePrice} from category ${category.code}',
                    );
                  } else {
                    price = selectedRoute.getVehiclePriceByType(vehicle.type);
                    print(
                      'Using fallback price for ${vehicle.licensePlate}: $price',
                    );
                  }

                  final brand = vehicle.brand ?? '';
                  final model = vehicle.model ?? '';
                  final licensePlate = vehicle.licensePlate;

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 6,
                          child: Row(
                            children: [
                              _buildVehicleIcon(vehicle.type),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '$brand $model',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w500,
                                        fontSize: 13,
                                      ),
                                      overflow: TextOverflow.ellipsis,
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
                            ],
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Text(
                            licensePlate,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: Colors.grey.shade700,
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 3,
                          child: Text(
                            currencyFormat.format(price),
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: theme.primaryColor,
                            ),
                            textAlign: TextAlign.end,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              const Divider(height: 24),

              // Total Kendaraan
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Kendaraan: ${bookingProvider.vehicles.length}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    currencyFormat.format(bookingProvider.vehicleCost),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: theme.primaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleIcon(String type) {
    IconData icon;
    Color color;

    switch (type) {
      case 'MOTORCYCLE':
        icon = Icons.motorcycle;
        color = Colors.orange;
        break;
      case 'CAR':
        icon = Icons.directions_car;
        color = Colors.blue;
        break;
      case 'BUS':
        icon = Icons.directions_bus;
        color = Colors.green;
        break;
      case 'TRUCK':
        icon = Icons.local_shipping;
        color = Colors.purple;
        break;
      default:
        icon = Icons.directions_car;
        color = Colors.blue;
    }

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Icon(icon, size: 14, color: color),
    );
  }

  Widget _buildPriceSummarySection(
    ThemeData theme,
    dynamic bookingProvider,
    NumberFormat currencyFormat,
  ) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.receipt_long_rounded,
                  color: theme.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Rincian Biaya',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: theme.primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // List pembayaran dengan tampilan yang lebih rapi
            Column(
              children: [
                // Biaya Penumpang
                _buildPriceRow(
                  'Penumpang (${bookingProvider.totalPassengers} orang)',
                  currencyFormat.format(bookingProvider.passengerCost),
                ),

                // Biaya Kendaraan
                if (bookingProvider.vehicles.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _buildPriceRow(
                    'Kendaraan (${bookingProvider.vehicles.length} unit)',
                    currencyFormat.format(bookingProvider.vehicleCost),
                  ),
                ],
              ],
            ),

            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Divider(height: 1),
            ),

            // Total dengan highlight
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.primaryColor.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: theme.primaryColor.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Pembayaran',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  Text(
                    currencyFormat.format(bookingProvider.totalCost),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: theme.primaryColor,
                      fontSize: 18,
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

  Widget _buildPriceRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 14, color: Colors.grey.shade800),
        ),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildPolicyInfo(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: theme.primaryColor),
              const SizedBox(width: 8),
              Text(
                'Informasi Penting',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: theme.primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildPolicyItem('Harap datang 30 menit sebelum keberangkatan'),
          _buildPolicyItem('Harga tiket sudah termasuk asuransi perjalanan'),
          _buildPolicyItem(
            'Pembatalan tiket dapat dilakukan 24 jam sebelum keberangkatan',
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '•',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
            ),
          ),
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
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
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
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                count.toString(),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              formatter.format(price * count),
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: Theme.of(context).primaryColor,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        // Pesan Tiket
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed:
                _isLoading || _isSuccessful
                    ? null
                    : () => _prepareBookingAndNavigate(context),
            style: ButtonStyle(
              padding: MaterialStateProperty.all(
                const EdgeInsets.symmetric(vertical: 16),
              ),
              backgroundColor: MaterialStateProperty.resolveWith((states) {
                if (states.contains(MaterialState.pressed)) {
                  return theme.primaryColor.withOpacity(0.9);
                }
                return theme.primaryColor;
              }),
              shape: MaterialStateProperty.all(
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              elevation: MaterialStateProperty.all(0),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _isSuccessful
                      ? 'Pemesanan Berhasil'
                      : 'Lanjutkan ke Pembayaran',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.payment_rounded, size: 20),
              ],
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
            style: ButtonStyle(
              padding: MaterialStateProperty.all(
                const EdgeInsets.symmetric(vertical: 16),
              ),
              side: MaterialStateProperty.resolveWith((states) {
                if (states.contains(MaterialState.pressed)) {
                  return BorderSide(color: theme.primaryColor, width: 2);
                }
                return BorderSide(
                  color: theme.primaryColor.withOpacity(0.7),
                  width: 1.5,
                );
              }),
              shape: MaterialStateProperty.all(
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            child: Text(
              'Ubah Data',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: theme.primaryColor,
              ),
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

  // Metode untuk menyiapkan booking tanpa memanggil API create langsung
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