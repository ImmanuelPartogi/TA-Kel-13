import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/booking.dart';

/// Widget yang menampilkan kartu tiket untuk pemesanan ferry.
///
/// Widget ini menampilkan informasi pemesanan seperti rute, tanggal, waktu,
/// status pemesanan, dan detail lainnya dalam format kartu yang interaktif.
class TicketCard extends StatelessWidget {
  /// Model data pemesanan yang akan ditampilkan.
  final Booking booking;

  /// Fungsi callback yang dipanggil ketika kartu ditekan.
  final VoidCallback onTap;

  /// Konstanta untuk styling dan padding.
  static const _cardBorderRadius = 12.0;
  static const _padding = EdgeInsets.all(16.0);
  static const _smallPadding = EdgeInsets.symmetric(
    horizontal: 8,
    vertical: 4,
  );
  static const _verticalSpacing = SizedBox(height: 12);
  static const _smallVerticalSpacing = SizedBox(height: 4);
  static const _horizontalSpacing = SizedBox(width: 12);
  static const _smallHorizontalSpacing = SizedBox(width: 8);

  const TicketCard({
    Key? key,
    required this.booking,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;
    final dateInfo = _getFormattedDateInfo(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(_cardBorderRadius),
        side: BorderSide(
          color: dateInfo.isToday ? primaryColor : Colors.transparent,
          width: dateInfo.isToday ? 2 : 0,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            _buildHeader(context),
            _buildBody(context, dateInfo),
          ],
        ),
      ),
    );
  }

  /// Membangun bagian header kartu dengan latar belakang berwarna.
  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);
    final route = booking.schedule?.route;
    final originText = route?.origin ?? '';
    final destinationText = route?.destination ?? '';
    final routeText = '$originText - $destinationText';
    final ferryName = booking.schedule?.ferry?.name ?? 'Kapal Ferry';

    return Container(
      padding: _padding,
      color: theme.primaryColor,
      child: Row(
        children: [
          const Icon(Icons.confirmation_number, color: Colors.white),
          _horizontalSpacing,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  routeText,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                _smallVerticalSpacing,
                Text(
                  ferryName,
                  style: const TextStyle(
                    color: Colors.white70,
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
    return Container(
      padding: _smallPadding,
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
    );
  }

  /// Membangun bagian isi dari kartu tiket.
  Widget _buildBody(BuildContext context, _DateInfo dateInfo) {
    return Padding(
      padding: _padding,
      child: Column(
        children: [
          _buildDateTimeSection(dateInfo),
          _verticalSpacing,
          const Divider(height: 1),
          _verticalSpacing,
          _buildBookingDetailsSection(),
          if (dateInfo.isToday && booking.status == 'CONFIRMED') ...[
            const SizedBox(height: 16),
            _buildTodayReminderSection(context),
          ],
        ],
      ),
    );
  }

  /// Membangun bagian informasi tanggal dan waktu.
  Widget _buildDateTimeSection(_DateInfo dateInfo) {
    final departureTime = booking.schedule?.departureTime?.substring(0, 5) ?? '--:--';

    return Row(
      children: [
        Expanded(
          child: _buildInfoItem(
            label: 'Tanggal',
            value: dateInfo.formattedDate,
          ),
        ),
        Expanded(
          child: _buildInfoItem(
            label: 'Waktu',
            value: departureTime,
          ),
        ),
      ],
    );
  }

  /// Membangun item informasi dasar dengan label dan nilai.
  Widget _buildInfoItem({required String label, required String value}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.grey,
            fontSize: 12,
          ),
        ),
        _smallVerticalSpacing,
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  /// Membangun bagian detail pemesanan.
  Widget _buildBookingDetailsSection() {
    return Row(
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
    );
  }

  /// Membangun item detail dengan ikon.
  Widget _buildDetailItem(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        _smallHorizontalSpacing,
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(color: Colors.grey[600], fontSize: 12),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(fontWeight: FontWeight.bold),
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
          _smallHorizontalSpacing,
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