import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';

/// Widget yang menampilkan kartu tiket untuk pemesanan ferry dengan desain yang selaras
/// dengan LoginScreen.
class TicketCard extends StatelessWidget {
  /// Model data pemesanan yang akan ditampilkan.
  final Booking booking;

  /// Fungsi callback yang dipanggil ketika kartu ditekan.
  final VoidCallback onTap;

  const TicketCard({
    Key? key,
    required this.booking,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateInfo = _getFormattedDateInfo(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 5),
            spreadRadius: 0,
          ),
        ],
        border: dateInfo.isToday ? Border.all(
          color: theme.primaryColor,
          width: 2,
        ) : null,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            children: [
              _buildHeader(context),
              _buildBody(context, dateInfo),
            ],
          ),
        ),
      ),
    );
  }

  /// Membangun bagian header kartu dengan latar belakang gradien.
  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);
    final route = booking.schedule?.route;
    final originText = route?.origin ?? '';
    final destinationText = route?.destination ?? '';
    final routeText = '$originText - $destinationText';
    final ferryName = booking.schedule?.ferry?.name ?? 'Kapal Ferry';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            theme.primaryColor.withBlue(255),
            theme.primaryColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(
              Icons.directions_boat_rounded,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  routeText,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  ferryName,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          _buildStatusBadge(context),
        ],
      ),
    );
  }

  /// Membangun badge status pemesanan.
  Widget _buildStatusBadge(BuildContext context) {
    final statusText = _getStatusText(booking.status);
    final statusColor = _getStatusColor(booking.status);
    
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Text(
        statusText,
        style: TextStyle(
          color: statusColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  /// Membangun bagian isi dari kartu tiket.
  Widget _buildBody(BuildContext context, _DateInfo dateInfo) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildDateTimeSection(dateInfo),
          const SizedBox(height: 20),
          Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.grey.shade200,
                  Colors.grey.shade300,
                  Colors.grey.shade200,
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
          ),
          const SizedBox(height: 20),
          _buildBookingDetailsSection(),
          if (dateInfo.isToday && booking.status == 'CONFIRMED') ...[
            const SizedBox(height: 20),
            _buildTodayReminderSection(context),
          ],
        ],
      ),
    );
  }

  /// Membangun bagian informasi tanggal dan waktu.
  Widget _buildDateTimeSection(_DateInfo dateInfo) {
    final departureTime = booking.schedule?.departureTime?.substring(0, 5) ?? '--:--';

    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildInfoItem(
              icon: Icons.calendar_today_rounded,
              label: 'Tanggal',
              value: dateInfo.formattedDate,
            ),
          ),
          Container(
            height: 40,
            width: 1,
            color: Colors.grey.shade200,
          ),
          Expanded(
            child: _buildInfoItem(
              icon: Icons.access_time_rounded,
              label: 'Waktu',
              value: departureTime,
            ),
          ),
        ],
      ),
    );
  }

  /// Membangun item informasi dasar dengan ikon, label dan nilai.
  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20,
            color: Colors.grey.shade600,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Membangun bagian detail pemesanan.
  Widget _buildBookingDetailsSection() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          _buildDetailItem(
            'Kode Booking',
            booking.bookingCode,
            Icons.confirmation_number_rounded,
          ),
          const SizedBox(height: 15),
          _buildDetailItem(
            'Penumpang',
            '${booking.passengerCount} orang',
            Icons.people_rounded,
          ),
          if (booking.vehicles != null && booking.vehicles!.isNotEmpty) ...[
            const SizedBox(height: 15),
            _buildDetailItem(
              'Kendaraan',
              _getVehicleTypeText(booking.vehicles!.first.type),
              Icons.directions_car_rounded,
            ),
          ],
        ],
      ),
    );
  }

  /// Membangun item detail dengan ikon.
  Widget _buildDetailItem(String label, String value, IconData icon) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Icon(
            icon,
            size: 20,
            color: Colors.grey.shade700,
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Membangun bagian pengingat untuk perjalanan hari ini.
  Widget _buildTodayReminderSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        vertical: 15,
        horizontal: 20,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.green.shade400,
            Colors.green.shade600,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.green.shade200.withOpacity(0.5),
            blurRadius: 10,
            offset: const Offset(0, 5),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.notifications_active_rounded,
              color: Colors.white,
              size: 22,
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Perjalanan Anda Hari Ini!',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Jangan lupa untuk check-in minimal 30 menit sebelum keberangkatan.',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Mendapatkan informasi tanggal yang diformat.
  _DateInfo _getFormattedDateInfo(BuildContext context) {
    final locale = Localizations.localeOf(context).toString();
    final dateFormat = DateFormat('EEEE, d MMM yyyy', locale);
    final dateObj = DateTime.parse(booking.departureDate).toLocal();
    final formattedDate = dateFormat.format(dateObj);

    // Pengecekan apakah tanggal pemesanan adalah hari ini
    final now = DateTime.now();
    final isToday = dateObj.year == now.year && 
                   dateObj.month == now.month && 
                   dateObj.day == now.day;

    return _DateInfo(
      formattedDate: formattedDate,
      isToday: isToday,
      dateObj: dateObj,
    );
  }

  /// Mendapatkan teks status yang telah diterjemahkan.
  String _getStatusText(String status) {
    const statusMap = {
      'CONFIRMED': 'TERKONFIRMASI',
      'PENDING': 'TERTUNDA',
      'CANCELLED': 'DIBATALKAN',
      'COMPLETED': 'SELESAI',
      'REFUNDED': 'REFUND',
      'RESCHEDULED': 'DIJADWALKAN ULANG',
    };

    return statusMap[status] ?? status;
  }
  
  /// Mendapatkan warna untuk status pemesanan.
  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green.shade700;
      case 'PENDING':
        return Colors.orange.shade700;
      case 'CANCELLED':
        return Colors.red.shade700;
      case 'COMPLETED':
        return Colors.blue.shade700;
      case 'REFUNDED':
        return Colors.purple.shade700;
      case 'RESCHEDULED':
        return Colors.teal.shade700;
      default:
        return Colors.grey.shade700;
    }
  }

  /// Mendapatkan teks jenis kendaraan yang telah diterjemahkan.
  String _getVehicleTypeText(String vehicleType) {
    const vehicleTypeMap = {
      'MOTORCYCLE': 'Sepeda Motor',
      'CAR': 'Mobil',
      'BUS': 'Bus',
      'TRUCK': 'Truk',
    };

    return vehicleTypeMap[vehicleType] ?? vehicleType;
  }
}

/// Kelas pembantu untuk menyimpan informasi tanggal.
class _DateInfo {
  final String formattedDate;
  final bool isToday;
  final DateTime dateObj;

  _DateInfo({
    required this.formattedDate,
    required this.isToday,
    required this.dateObj,
  });
}