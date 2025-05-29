import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/schedule.dart';

class ScheduleCard extends StatelessWidget {
  final Schedule schedule;
  final DateTime date;
  final VoidCallback onTap;

  const ScheduleCard({
    Key? key,
    required this.schedule,
    required this.date,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    // Check availability
    final isPassengerAvailable = (schedule.availablePassenger ?? 0) > 0;

    // Periksa apakah jadwal masih tersedia berdasarkan tanggal dan waktu
    bool isScheduleAvailable = true;
    try {
      final departureDateTime = DateTimeHelper.combineDateAndTime(
        date.toString(),
        schedule.departureTime,
      );

      if (departureDateTime != null) {
        isScheduleAvailable = !DateTime.now().isAfter(departureDateTime);
      }
    } catch (e) {
      debugPrint('Error checking schedule availability: $e');
    }

    // Get status color
    Color statusColor = _getStatusColor(schedule.status);
    String statusText = _getStatusText(schedule.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with Ferry name and status
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        schedule.ferry?.name ?? '-',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.black87,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        statusText,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Time and route information
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Departure information
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Keberangkatan',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _formatTimeOnly(schedule.departureTime),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            schedule.route?.origin ?? '-',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Arrow between times
                    Container(
                      alignment: Alignment.center,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              Container(
                                height: 1.5,
                                width: 50,
                                color: Colors.grey.shade300,
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 2,
                                ),
                                color: Colors.white,
                                child: Icon(
                                  Icons.arrow_forward,
                                  color: Theme.of(context).primaryColor,
                                  size: 18,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Arrival information
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Kedatangan',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _formatTimeOnly(schedule.arrivalTime),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            schedule.route?.destination ?? '-',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),
                Divider(color: Colors.grey.shade200, height: 1),
                const SizedBox(height: 20),

                // Price and Availability
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Price
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          currencyFormat.format(schedule.route?.basePrice ?? 0),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'per penumpang',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),

                    // Passenger availability
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color:
                            isPassengerAvailable
                                ? Colors.green.shade50
                                : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.person,
                            size: 18,
                            color:
                                isPassengerAvailable
                                    ? Colors.green.shade700
                                    : Colors.red.shade700,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${schedule.availablePassenger ?? 0} kursi',
                            style: TextStyle(
                              color:
                                  isPassengerAvailable
                                      ? Colors.green.shade700
                                      : Colors.red.shade700,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Vehicle Availability
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildVehicleItem(
                      context,
                      'Motor',
                      schedule.availableMotorcycle ?? 0,
                      Icons.motorcycle,
                    ),
                    _buildVehicleItem(
                      context,
                      'Mobil',
                      schedule.availableCar ?? 0,
                      Icons.directions_car,
                    ),
                    _buildVehicleItem(
                      context,
                      'Bus',
                      schedule.availableBus ?? 0,
                      Icons.directions_bus,
                    ),
                    _buildVehicleItem(
                      context,
                      'Truk',
                      schedule.availableTruck ?? 0,
                      Icons.local_shipping,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVehicleItem(
    BuildContext context,
    String label,
    int count,
    IconData icon,
  ) {
    final bool isAvailable = count > 0;
    final Color textColor =
        isAvailable ? Colors.grey.shade800 : Colors.red.shade300;
    final Color iconColor =
        isAvailable ? Theme.of(context).primaryColor : Colors.red.shade300;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color:
                isAvailable
                    ? Theme.of(context).primaryColor.withOpacity(0.1)
                    : Colors.red.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 22, color: iconColor),
        ),
        const SizedBox(height: 6),
        Text(
          count.toString(),
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: textColor,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
        ),
      ],
    );
  }

  String _formatTimeOnly(String timeString) {
    return DateTimeHelper.formatTime(timeString);
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'AVAILABLE':
        return Colors.green;
      case 'DELAYED':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Aktif';
      case 'AVAILABLE':
        return 'Tersedia';
      case 'DELAYED':
        return 'Tertunda';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return 'Tidak Diketahui';
    }
  }
}
