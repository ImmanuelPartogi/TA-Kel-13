import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';

/// Widget yang menampilkan kartu tiket untuk pemesanan ferry dengan desain modern dan profesional.
class TicketCard extends StatelessWidget {
  /// Model data pemesanan yang akan ditampilkan.
  final Booking booking;

  /// Fungsi callback yang dipanggil ketika kartu ditekan.
  final VoidCallback onTap;

  const TicketCard({Key? key, required this.booking, required this.onTap})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateInfo = _getFormattedDateInfo(context);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Material(
          color: Colors.white,
          child: InkWell(
            onTap: onTap,
            splashColor: theme.primaryColor.withOpacity(0.1),
            highlightColor: theme.primaryColor.withOpacity(0.05),
            child: Column(
              children: [
                _buildHeader(context),
                _buildDivider(),
                _buildBody(context, dateInfo),
                _buildFooter(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Membangun bagian header kartu dengan latar belakang gradien dan elemen visual yang ditingkatkan.
  Widget _buildHeader(BuildContext context) {
    final route = booking.schedule?.route;
    final originText = route?.origin ?? '';
    final destinationText = route?.destination ?? '';
    final ferryName = booking.schedule?.ferry?.name ?? 'Kapal Ferry';
    final isExpired = booking.isExpired;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF1A73E8), // Biru Google yang lebih professional
            Color(0xFF4285F4),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Elemen dekoratif yang ditingkatkan (lingkaran dan pola)
          Positioned(
            top: -30,
            right: -30,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.1),
              ),
            ),
          ),
          Positioned(
            bottom: -20,
            left: -20,
            child: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.07),
              ),
            ),
          ),

          // Konten header yang ditingkatkan
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badge status di bagian atas
              Align(
                alignment: Alignment.topRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    isExpired ? 'KADALUARSA' : _getStatusText(booking.status),
                    style: TextStyle(
                      color:
                          isExpired
                              ? Colors.grey.shade600
                              : _getStatusColor(booking.status),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Informasi rute dengan layout yang ditingkatkan
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          originText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Asal',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Ikon dan garis rute
                  Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.directions_boat_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        height: 30,
                        width: 1,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0.3),
                              Colors.white.withOpacity(0.8),
                              Colors.white.withOpacity(0.3),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                  ),

                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          destinationText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                          textAlign: TextAlign.right,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tujuan',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Informasi kapal
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.sailing_outlined, color: Colors.white, size: 14),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        ferryName,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Membuat divider bergerigi seperti tiket
  Widget _buildDivider() {
    return Container(
      height: 20,
      width: double.infinity,
      color: Colors.white,
      child: Stack(
        children: [
          // Garis putus-putus
          Positioned.fill(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(
                    (constraints.maxWidth / 15).ceil(),
                    (index) => Container(
                      width: 10,
                      height: 1,
                      color: Colors.grey.withOpacity(0.3),
                    ),
                  ),
                );
              },
            ),
          ),
          // Lubang kiri
          Positioned(
            left: -10,
            top: 0,
            bottom: 0,
            child: Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
            ),
          ),
          // Lubang kanan
          Positioned(
            right: -10,
            top: 0,
            bottom: 0,
            child: Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Membangun bagian isi dari kartu tiket dengan desain yang ditingkatkan.
  Widget _buildBody(BuildContext context, _DateInfo dateInfo) {
    final departureTime =
        booking.schedule?.departureTime != null
            ? (booking.schedule!.departureTime.contains(":")
                ? booking.schedule!.departureTime
                : '--:--')
            : '--:--';

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      color: Colors.white,
      child: Column(
        children: [
          // Kode Booking dengan highlight
          Container(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
            decoration: BoxDecoration(
              color: Color(0xFFF1F8FF),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Color(0xFFD4E9FF), width: 1),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.confirmation_number_rounded,
                  size: 20,
                  color: Color(0xFF1A73E8),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Kode Booking',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      booking.bookingCode,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF1A73E8),
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Tanggal
          _buildInfoItem(
            icon: Icons.calendar_today_rounded,
            iconColor: Color(0xFFFF6D00),
            label: 'Tanggal',
            value: dateInfo.formattedDate,
          ),

          const SizedBox(height: 16),

          // Waktu
          _buildInfoItem(
            icon: Icons.access_time_rounded,
            iconColor: Color(0xFF1A73E8),
            label: 'Waktu',
            value: departureTime ?? '--:--',
          ),

          const SizedBox(height: 16),

          // Penumpang
          _buildInfoItem(
            icon: Icons.people_rounded,
            iconColor: Color(0xFF00C853),
            label: 'Penumpang',
            value: '${booking.passengerCount} orang',
          ),

          // Kendaraan (jika ada)
          if (booking.vehicles != null && booking.vehicles!.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildInfoItem(
              icon: Icons.directions_car_rounded,
              iconColor: Color(0xFF00B0FF),
              label: 'Kendaraan',
              value: _getVehicleTypeText(booking.vehicles!.first.type),
            ),
          ],
        ],
      ),
    );
  }

  /// Membangun bagian footer kartu
  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
      decoration: BoxDecoration(
        color: Color(0xFFF9FAFC),
        border: Border(
          top: BorderSide(color: Colors.grey.withOpacity(0.15), width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Watermark perusahaan
          Text(
            'Ferry Booking',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),

          // Tombol Detail
          Row(
            children: [
              Text(
                'Lihat Detail',
                style: TextStyle(
                  color: Color(0xFF1A73E8),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 4),
              Icon(
                Icons.arrow_forward_ios_rounded,
                color: Color(0xFF1A73E8),
                size: 12,
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Membangun item informasi dengan ikon dan teks yang ditingkatkan.
  Widget _buildInfoItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Ikon dengan background berwarna
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 18, color: iconColor),
        ),

        const SizedBox(width: 14),

        // Label dan nilai
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Colors.grey.shade800,
                  height: 1.2,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
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
    final isToday =
        dateObj.year == now.year &&
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
        return Color(0xFF00C853); // Green yang lebih profesional
      case 'PENDING':
        return Color(0xFFFF9800); // Orange yang lebih profesional
      case 'CANCELLED':
        return Color(0xFFE53935); // Red yang lebih profesional
      case 'COMPLETED':
        return Color(0xFF1A73E8); // Blue Google yang lebih profesional
      case 'REFUNDED':
        return Color(0xFF7B1FA2); // Purple yang lebih profesional
      case 'RESCHEDULED':
        return Color(0xFF00897B); // Teal yang lebih profesional
      default:
        return Color(0xFF607D8B); // Grey yang lebih profesional
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
