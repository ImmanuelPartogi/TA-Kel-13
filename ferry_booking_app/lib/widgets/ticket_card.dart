import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';

class TicketCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback onTap;
  
  const TicketCard({
    Key? key,
    required this.booking,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Format date
    final dateFormat = DateFormat('EEEE, d MMM yyyy', 'id_ID');
    final dateObj = DateTime.parse(booking.bookingDate);
    final formattedDate = dateFormat.format(dateObj);
    
    // Check if the booking date is today
    final isToday = DateTime.now().difference(dateObj).inDays == 0;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isToday ? Theme.of(context).primaryColor : Colors.transparent,
          width: isToday ? 2 : 0,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            // Ticket header with colored background
            Container(
              padding: const EdgeInsets.all(16.0),
              color: Theme.of(context).primaryColor,
              child: Row(
                children: [
                  const Icon(
                    Icons.confirmation_number,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${booking.schedule?.route?.origin ?? ''} - ${booking.schedule?.route?.destination ?? ''}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          booking.schedule?.ferry?.name ?? 'Kapal Ferry',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _getStatusText(booking.status),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Ticket body
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Date and time
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Tanggal',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              formattedDate,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Waktu',
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              booking.schedule?.departureTime?.substring(0, 5) ?? '--:--',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 12),
                  
                  // Booking details
                  Row(
                    children: [
                      Expanded(
                        child: _buildDetailItem(
                          'Kode Booking',
                          booking.bookingCode,
                          Icons.confirmation_number_outlined,
                        ),
                      ),
                      Expanded(
                        child: _buildDetailItem(
                          'Penumpang',
                          '${booking.passengerCount} orang',
                          Icons.people_outline,
                        ),
                      ),
                    ],
                  ),
                  
                  if (isToday && booking.status == 'CONFIRMED') ...[
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        vertical: 8,
                        horizontal: 12,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Colors.green[700],
                            size: 16,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Perjalanan Anda hari ini! Jangan lupa untuk check-in.',
                              style: TextStyle(
                                color: Colors.green[700],
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildDetailItem(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: Colors.grey[600],
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  String _getStatusText(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 'TERKONFIRMASI';
      case 'PENDING':
        return 'TERTUNDA';
      case 'CANCELLED':
        return 'DIBATALKAN';
      case 'COMPLETED':
        return 'SELESAI';
      case 'REFUNDED':
        return 'REFUND';
      case 'RESCHEDULED':
        return 'DIJADWALKAN ULANG';
      default:
        return status;
    }
  }
}