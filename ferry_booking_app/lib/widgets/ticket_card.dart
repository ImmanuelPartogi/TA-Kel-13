import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/utils/date_time_helper.dart';

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
      margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 5),
            spreadRadius: -2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
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

  Widget _buildHeader(BuildContext context) {
    final route = booking.schedule?.route;
    final originText = route?.origin ?? '';
    final destinationText = route?.destination ?? '';
    final ferryName = booking.schedule?.ferry?.name ?? 'Kapal Ferry';

    // Cek status tiket
    String displayStatus;
    Color statusColor;

    if (['CANCELLED', 'REFUNDED'].contains(booking.status)) {
      displayStatus = _getStatusText(booking.status);
      statusColor = _getStatusColor(booking.status);
    } else {
      final isExpired =
          booking.schedule?.departureTime != null
              ? DateTimeHelper.isExpired(
                booking.departureDate,
                booking.schedule!.departureTime,
              )
              : false;

      if (isExpired && ['CONFIRMED', 'PENDING'].contains(booking.status)) {
        displayStatus = 'KADALUARSA';
        statusColor = Colors.grey.shade600;
      } else {
        displayStatus = _getStatusText(booking.status);
        statusColor = _getStatusColor(booking.status);
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF2563EB), // Biru yang lebih modern
            Color(0xFF1E40AF),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Elemen dekoratif
          Positioned(
            top: -30,
            right: -30,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.07),
              ),
            ),
          ),
          Positioned(
            bottom: -40,
            left: -20,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05),
              ),
            ),
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
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    displayStatus,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.6,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 22),

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
                            fontSize: 20,
                            letterSpacing: 0.2,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Asal',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.85),
                            fontSize: 13,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Ikon dan garis rute
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.directions_boat_rounded,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          height: 35,
                          width: 1.5,
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
                            fontSize: 20,
                            letterSpacing: 0.2,
                          ),
                          textAlign: TextAlign.right,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tujuan',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.85),
                            fontSize: 13,
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

              // Informasi kapal
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.2),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.sailing_outlined, color: Colors.white, size: 15),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        ferryName,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.2,
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

  Widget _buildDivider() {
    return Container(
      height: 24,
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
            left: -12,
            top: 0,
            bottom: 0,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
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
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, _DateInfo dateInfo) {
    final departureTime =
        booking.schedule?.departureTime != null
            ? DateTimeHelper.formatTime(
              booking.schedule!.departureTime,
            )
            : '--:--';

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      color: Colors.white,
      child: Column(
        children: [
          // Kode Booking dengan highlight
          Container(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            decoration: BoxDecoration(
              color: Color(0xFFF0F7FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Color(0xFFD1E4FF), width: 1),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Color(0xFF2563EB).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    Icons.confirmation_number_rounded,
                    size: 20,
                    color: Color(0xFF2563EB),
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Kode Booking',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 13,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      booking.bookingCode,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Color(0xFF2563EB),
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Tanggal
          _buildInfoItem(
            icon: Icons.calendar_today_rounded,
            iconColor: Color(0xFFEF4444),
            label: 'Tanggal',
            value: dateInfo.formattedDate,
          ),

          const SizedBox(height: 16),

          // Waktu
          _buildInfoItem(
            icon: Icons.access_time_rounded,
            iconColor: Color(0xFF2563EB),
            label: 'Waktu',
            value: departureTime ?? '--:--',
          ),

          const SizedBox(height: 16),

          // Penumpang
          _buildInfoItem(
            icon: Icons.people_rounded,
            iconColor: Color(0xFF10B981),
            label: 'Penumpang',
            value: '${booking.passengerCount} orang',
          ),

          // Kendaraan (jika ada)
          if (booking.vehicles != null && booking.vehicles!.isNotEmpty) ...[
            const SizedBox(height: 16),
            _buildInfoItem(
              icon: Icons.directions_car_rounded,
              iconColor: Color(0xFF3B82F6),
              label: 'Kendaraan',
              value: _getVehicleTypeText(booking.vehicles!.first.type),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      decoration: BoxDecoration(
        color: Color(0xFFF9FAFC),
        border: Border(
          top: BorderSide(color: Colors.grey.withOpacity(0.12), width: 1),
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
              letterSpacing: 0.2,
            ),
          ),

          // Tombol Detail
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12, 
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: Color(0xFF2563EB).withOpacity(0.05),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Text(
                  'Lihat Detail',
                  style: TextStyle(
                    color: Color(0xFF2563EB),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Color(0xFF2563EB),
                  size: 12,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

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
            color: iconColor.withOpacity(0.08),
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
                  fontSize: 13,
                  letterSpacing: 0.2,
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
                  letterSpacing: 0.2,
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

    final isExpired =
        booking.schedule?.departureTime != null
            ? DateTimeHelper.isExpired(
              booking.departureDate,
              booking.schedule!.departureTime,
            )
            : false;

    final now = DateTime.now();
    final isToday =
        dateObj.year == now.year &&
        dateObj.month == now.month &&
        dateObj.day == now.day;

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
        return Color(0xFF10B981); // Green yang lebih modern
      case 'PENDING':
        return Color(0xFFF59E0B); // Orange yang lebih modern
      case 'CANCELLED':
        return Color(0xFFEF4444); // Red yang lebih modern
      case 'COMPLETED':
        return Color(0xFF2563EB); // Blue yang lebih modern
      case 'REFUNDED':
        return Color(0xFF8B5CF6); // Purple yang lebih modern
      case 'RESCHEDULED':
        return Color(0xFF0EA5E9); // Teal yang lebih modern
      default:
        return Color(0xFF64748B); // Grey yang lebih modern
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