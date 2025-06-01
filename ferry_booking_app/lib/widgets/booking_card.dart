import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:google_fonts/google_fonts.dart';

class BookingCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback? onTap;

  const BookingCard({Key? key, required this.booking, this.onTap})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Format date
    final dateFormat = DateFormat('EEEE, d MMM yyyy', 'id_ID');
    final dateObj = DateTime.parse(booking.departureDate).toLocal();
    final formattedDate = dateFormat.format(dateObj);

    // Format time
    final departureTime = DateTimeHelper.formatTime(
      booking.schedule?.departureTime ?? '--:--',
    );

    // Check if booking is today
    final now = DateTime.now();
    final isToday =
        dateObj.year == now.year &&
        dateObj.month == now.month &&
        dateObj.day == now.day;
        
    // Handle card tap to navigate to ticket detail screen
    void navigateToTicketDetail() {
      Navigator.pushNamed(
        context,
        '/tickets/detail',
        arguments: booking.id,
      );
    }

    return GestureDetector(
      onTap: () => navigateToTicketDetail(),
      child: Container(
        margin: const EdgeInsets.only(bottom: 18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.07),
              blurRadius: 20,
              offset: const Offset(0, 8),
              spreadRadius: -3,
            ),
          ],
          
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header dengan desain yang lebih modern
            _buildHeader(context),
            
            // Konten utama
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Route and date info
                  _buildRouteAndDateInfo(
                    context,
                    formattedDate,
                    departureTime,
                  ),
                          ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    Theme.of(context);
    final statusColor = _getStatusColor(booking.status);

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            statusColor.withOpacity(0.95),
            statusColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Stack(
        children: [
          // Elemen dekoratif
          Positioned(
            top: -15,
            right: -15,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.07),
              ),
            ),
          ),
          Positioned(
            bottom: -20,
            left: -10,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.05),
              ),
            ),
          ),
          
          // Konten utama header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                flex: 3,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.confirmation_number_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Booking #${booking.bookingCode}',
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: Colors.white,
                              letterSpacing: 0.3,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (booking.schedule?.ferry?.name != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              booking.schedule!.ferry!.name,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.9),
                                letterSpacing: 0.2,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ]
                        ],
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

  Widget _buildRouteAndDateInfo(
    BuildContext context,
    String formattedDate,
    String departureTime,
  ) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
            spreadRadius: -2,
          ),
        ],
        border: Border.all(color: Colors.grey.shade100, width: 1),
      ),
      child: Row(
        children: [
          // Ikon kapal dengan desain yang lebih menarik
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.primaryColor.withOpacity(0.7),
                  theme.primaryColor,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: theme.primaryColor.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                  spreadRadius: -5,
                ),
              ],
            ),
            child: const Icon(
              Icons.directions_boat_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Rute dengan font yang lebih menarik
                Text(
                  '${booking.schedule?.route?.origin ?? ''} - ${booking.schedule?.route?.destination ?? ''}',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    letterSpacing: 0.2,
                    color: Colors.grey.shade800,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                // Tanggal dan waktu dengan tampilan yang lebih modern
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.calendar_today_rounded,
                        size: 14,
                        color: theme.primaryColor,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          formattedDate,
                          style: GoogleFonts.poppins(
                            color: theme.primaryColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 8),
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          color: theme.primaryColor.withOpacity(0.5),
                          shape: BoxShape.circle,
                        ),
                      ),
                      Icon(
                        Icons.access_time_rounded,
                        size: 14,
                        color: theme.primaryColor,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        departureTime,
                        style: GoogleFonts.poppins(
                          color: theme.primaryColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
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
}