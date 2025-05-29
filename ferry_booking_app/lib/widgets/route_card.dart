import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/route.dart';

class RouteCard extends StatelessWidget {
  final FerryRoute route;
  final VoidCallback onTap;

  const RouteCard({Key? key, required this.route, required this.onTap})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    // Format durasi menggunakan helper
    final durationText = DateTimeHelper.formatDuration(route.duration);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Route Info
                Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: theme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Icon(
                        Icons.directions_boat_rounded,
                        color: theme.primaryColor,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            route.routeCode,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            '${route.origin} - ${route.destination}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusBadge(context, route.status),
                  ],
                ),
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

                // Route Details dalam container khusus
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200, width: 1),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildDetailItem(
                        context,
                        'Durasi',
                        durationText,
                        Icons.access_time_rounded,
                      ),
                      Container(
                        height: 40,
                        width: 1,
                        color: Colors.grey.shade200,
                      ),
                      _buildDetailItem(
                        context,
                        'Jarak',
                        route.distance != null ? '${route.distance} km' : '-',
                        Icons.straighten_rounded,
                      ),
                      Container(
                        height: 40,
                        width: 1,
                        color: Colors.grey.shade200,
                      ),
                      _buildDetailItem(
                        context,
                        'Harga',
                        'Mulai ${currencyFormat.format(route.basePrice)}',
                        Icons.attach_money_rounded,
                      ),
                    ],
                  ),
                ),

                // Tambahan button untuk pemesanan
                if (route.status == 'ACTIVE') ...[
                  const SizedBox(height: 20),
                  InkWell(
                    onTap: onTap,
                    borderRadius: BorderRadius.circular(15),
                    child: Container(
                      width: double.infinity,
                      height: 45,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            theme.primaryColor.withBlue(255),
                            theme.primaryColor,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(15),
                        boxShadow: [
                          BoxShadow(
                            color: theme.primaryColor.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 5),
                            spreadRadius: -5,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(
                            Icons.calendar_today_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                          SizedBox(width: 10),
                          Text(
                            'Lihat Jadwal',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context, String status) {
    final statusText = _getStatusText(status);
    final statusColor = _getStatusColor(status);
    final isActive = status == 'ACTIVE';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isActive ? statusColor : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: isActive ? null : Border.all(color: statusColor, width: 1.5),
        boxShadow:
            isActive
                ? [
                  BoxShadow(
                    color: statusColor.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
                : null,
      ),
      child: Text(
        statusText,
        style: TextStyle(
          color: isActive ? Colors.white : statusColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildDetailItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 5),
      child: Column(
        children: [
          Icon(icon, size: 22, color: Theme.of(context).primaryColor),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis, // Tambahkan ini
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'ACTIVE':
        return Colors.green.shade600;
      case 'INACTIVE':
        return Colors.red.shade600;
      case 'SUSPENDED':
        return Colors.orange.shade600;
      case 'MAINTENANCE':
        return Colors.blue.shade600;
      case 'PERMANENT_INACTIVE':
        return Colors.grey.shade600;
      case 'WEATHER_ISSUE':
        return Colors.orange.shade600;
      default:
        return Colors.grey.shade600;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'ACTIVE':
        return 'AKTIF';
      case 'INACTIVE':
        return 'NONAKTIF';
      case 'SUSPENDED':
        return 'DITANGGUHKAN';
      case 'MAINTENANCE':
        return 'PEMELIHARAAN';
      case 'PERMANENT_INACTIVE':
        return 'NONAKTIF PERMANEN';
      case 'WEATHER_ISSUE':
        return 'CUACA';
      default:
        return status;
    }
  }
}
