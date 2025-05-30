import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/utils/date_time_helper.dart';

/// Widget kartu tiket yang ditingkatkan untuk tampilan yang lebih profesional
class TicketCard extends StatelessWidget {
  final Booking booking;
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
        borderRadius: BorderRadius.circular(24), // Radius yang lebih besar
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08), // Shadow lebih halus
            blurRadius: 16,
            offset: const Offset(0, 6),
            spreadRadius: -4,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Material(
          color: Colors.white,
          child: InkWell(
            onTap: onTap,
            splashColor: theme.primaryColor.withOpacity(0.08),
            highlightColor: theme.primaryColor.withOpacity(0.03),
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

  /// Header dengan desain yang ditingkatkan
  Widget _buildHeader(BuildContext context) {
    final route = booking.schedule?.route;
    final originText = route?.origin ?? '';
    final destinationText = route?.destination ?? '';
    final ferryName = booking.schedule?.ferry?.name ?? 'Kapal Ferry';

    final isExpired = booking.schedule?.departureTime != null
        ? DateTimeHelper.isExpired(
            booking.departureDate,
            booking.schedule!.departureTime,
          )
        : false;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF0D47A1), // Biru yang lebih gelap dan profesional
            Color(0xFF1976D2), // Biru yang lebih terang
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Elemen dekoratif yang lebih subtle
          Positioned(
            top: -40,
            right: -40,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05),
              ),
            ),
          ),
          Positioned(
            bottom: -30,
            left: -30,
            child: Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05),
              ),
            ),
          ),
          // Pola titik-titik dekoratif
          Positioned(
            top: 10,
            left: 0,
            child: _buildDotPattern(3, 3, Colors.white.withOpacity(0.05)),
          ),
          Positioned(
            bottom: 5,
            right: 10,
            child: _buildDotPattern(4, 2, Colors.white.withOpacity(0.05)),
          ),

          // Konten header
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badge status
              Align(
                alignment: Alignment.topRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30), // Lebih bulat
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                        spreadRadius: -4,
                      ),
                    ],
                  ),
                  child: Text(
                    isExpired ? 'KADALUARSA' : _getStatusText(booking.status),
                    style: TextStyle(
                      color: isExpired ? Colors.grey.shade600 : _getStatusColor(booking.status),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Informasi rute
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
                            fontSize: 19, // Sedikit lebih besar
                            letterSpacing: -0.5, // Kerning yang lebih rapat
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Asal',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Ikon dan garis rute yang ditingkatkan
                  Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                              spreadRadius: -5,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.directions_boat_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 5),
                        height: 30,
                        width: 2, // Sedikit lebih tebal
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0.2),
                              Colors.white.withOpacity(0.8),
                              Colors.white.withOpacity(0.2),
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
                            fontSize: 19,
                            letterSpacing: -0.5,
                          ),
                          textAlign: TextAlign.right,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Tujuan',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                            letterSpacing: 0.2,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Informasi kapal dengan desain yang ditingkatkan
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.sailing_outlined, color: Colors.white, size: 16),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        ferryName,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.1,
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

  /// Pola titik dekoratif
  Widget _buildDotPattern(int rows, int columns, Color color) {
    return SizedBox(
      height: rows * 10.0,
      width: columns * 10.0,
      child: Column(
        children: List.generate(
          rows,
          (rowIndex) => Row(
            children: List.generate(
              columns,
              (colIndex) => Container(
                width: 4,
                height: 4,
                margin: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Divider bergerigi yang ditingkatkan
  Widget _buildDivider() {
    return Container(
      height: 24, // Sedikit lebih tinggi
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
                    (constraints.maxWidth / 16).ceil(),
                    (index) => Container(
                      width: 10,
                      height: 1,
                      color: Colors.grey.withOpacity(0.25),
                    ),
                  ),
                );
              },
            ),
          ),
          // Lubang kiri
          Positioned(
            left: -12,
            top: 0,
            bottom: 0,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 3,
                    spreadRadius: 1,
                    offset: const Offset(1, 0),
                  ),
                ],
              ),
            ),
          ),
          // Lubang kanan
          Positioned(
            right: -12,
            top: 0,
            bottom: 0,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 3,
                    spreadRadius: 1,
                    offset: const Offset(-1, 0),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Body dengan desain yang ditingkatkan
  Widget _buildBody(BuildContext context, _DateInfo dateInfo) {
    final departureTime = booking.schedule?.departureTime != null
        ? DateTimeHelper.formatTime(booking.schedule!.departureTime)
        : '--:--';

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 12),
      color: Colors.white,
      child: Column(
        children: [
          // Kode Booking dengan highlight
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 18),
            decoration: BoxDecoration(
              color: Color(0xFFF1F8FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Color(0xFFD4E9FF), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Color(0xFF1976D2).withOpacity(0.05),
                  blurRadius: 10,
                  spreadRadius: 0,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Color(0xFF1976D2).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.confirmation_number_rounded,
                    size: 20,
                    color: Color(0xFF1976D2),
                  ),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Kode Booking',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      booking.bookingCode,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Color(0xFF1976D2),
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Info items yang ditingkatkan
          _buildInfoItem(
            icon: Icons.calendar_today_rounded,
            iconColor: Color(0xFFFF6D00),
            label: 'Tanggal',
            value: dateInfo.formattedDate,
          ),

          const SizedBox(height: 18),

          _buildInfoItem(
            icon: Icons.access_time_rounded,
            iconColor: Color(0xFF1976D2),
            label: 'Waktu',
            value: departureTime ?? '--:--',
          ),

          const SizedBox(height: 18),

          _buildInfoItem(
            icon: Icons.people_rounded,
            iconColor: Color(0xFF00C853),
            label: 'Penumpang',
            value: '${booking.passengerCount} orang',
          ),

          if (booking.vehicles != null && booking.vehicles!.isNotEmpty) ...[
            const SizedBox(height: 18),
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

  /// Footer yang ditingkatkan
  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 22),
      decoration: BoxDecoration(
        color: Color(0xFFF8FAFD), // Warna yang lebih subtle
        border: Border(
          top: BorderSide(color: Colors.grey.withOpacity(0.12), width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Watermark perusahaan dengan logo
          Row(
            children: [
              Icon(
                Icons.directions_boat_filled_rounded,
                size: 14, 
                color: Colors.grey.shade400,
              ),
              const SizedBox(width: 6),
              Text(
                'Ferry Booking',
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),

          // Tombol Detail yang ditingkatkan
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Color(0xFF1976D2).withOpacity(0.08),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Text(
                  'Lihat Detail',
                  style: TextStyle(
                    color: Color(0xFF1976D2),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Color(0xFF1976D2),
                  size: 10,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Item informasi yang ditingkatkan
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
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, size: 20, color: iconColor),
        ),

        const SizedBox(width: 16),

        // Label dan nilai
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey.shade500, 
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                  color: Colors.grey.shade800,
                  height: 1.2,
                  letterSpacing: 0.1,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  _DateInfo _getFormattedDateInfo(BuildContext context) {
    final formattedDate = DateTimeHelper.formatDate(booking.departureDate);
    final dateObj = DateTime.parse(booking.departureDate).toLocal();
    final isExpired = booking.schedule?.departureTime != null
        ? DateTimeHelper.isExpired(
            booking.departureDate,
            booking.schedule!.departureTime,
          )
        : false;
    final now = DateTime.now();
    final isToday = dateObj.year == now.year && dateObj.month == now.month && dateObj.day == now.day;

    return _DateInfo(
      formattedDate: formattedDate,
      isToday: isToday,
      dateObj: dateObj,
      isExpired: isExpired,
    );
  }

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

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Color(0xFF00C853); // Green
      case 'PENDING':
        return Color(0xFFFF9800); // Orange
      case 'CANCELLED':
        return Color(0xFFE53935); // Red
      case 'COMPLETED':
        return Color(0xFF1976D2); // Blue
      case 'REFUNDED':
        return Color(0xFF7B1FA2); // Purple
      case 'RESCHEDULED':
        return Color(0xFF00897B); // Teal
      default:
        return Color(0xFF607D8B); // Grey
    }
  }

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

class _DateInfo {
  final String formattedDate;
  final bool isToday;
  final DateTime dateObj;
  final bool isExpired;

  _DateInfo({
    required this.formattedDate,
    required this.isToday,
    required this.dateObj,
    this.isExpired = false,
  });
}