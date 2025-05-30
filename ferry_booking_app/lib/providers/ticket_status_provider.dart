import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter/material.dart';
import 'package:ferry_booking_app/services/api_service.dart';

class TicketStatusProvider extends ChangeNotifier {
  bool _isSyncing = false;
  DateTime _lastSyncTime = DateTime.now();

  bool get isSyncing => _isSyncing;
  DateTime get lastSyncTime => _lastSyncTime;

  /// Service untuk memanggil API
  final ApiService _apiService = ApiService();

  /// Menyinkronkan status tiket dengan server
  Future<void> synchronizeTicketStatuses() async {
    if (_isSyncing) return;

    _isSyncing = true;
    notifyListeners();

    try {
      // Panggil endpoint status-check
      await _apiService.get('/tickets/check-status');
      _lastSyncTime = DateTime.now();
    } catch (e) {
      debugPrint('Error synchronizing ticket statuses: $e');
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  /// Mengelompokkan tiket berdasarkan kategori
  Map<String, List<Booking>> categorizeTickets(List<Booking> tickets) {
    final upcoming = <Booking>[];
    final history = <Booking>[];

    for (final ticket in tickets) {
      if (_isUpcoming(ticket)) {
        upcoming.add(ticket);
      } else {
        history.add(ticket);
      }
    }

    return {'upcoming': upcoming, 'history': history};
  }

  /// Cek apakah tiket termasuk kategori "Akan Datang"
  bool _isUpcoming(Booking booking) {
    // Tiket Akan Datang jika:
    // 1. Status CONFIRMED atau PENDING
    // 2. Tanggal & jam keberangkatan > tanggal & jam saat ini

    // Cek status dulu
    if (!['CONFIRMED', 'PENDING'].contains(booking.status)) {
      return false;
    }

    try {
      // Dapatkan datetime keberangkatan lengkap (tanggal + waktu)
      final departureDateTime = DateTimeHelper.combineDateAndTime(
        booking.departureDate,
        booking.schedule?.departureTime ?? '00:00',
      );

      // Jika tidak bisa mendapatkan waktu keberangkatan,
      // cek hanya berdasarkan tanggal
      if (departureDateTime == null) {
        final departureDateObj = DateTime.parse(booking.departureDate);
        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);
        final departureDay = DateTime(
          departureDateObj.year,
          departureDateObj.month,
          departureDateObj.day,
        );

        // Tiket masih upcoming jika tanggal keberangkatan >= hari ini
        return !departureDay.isBefore(today);
      }

      // Cek apakah waktu keberangkatan belum lewat
      final now = DateTime.now();

      // Tiket masih upcoming jika waktu keberangkatan >= waktu sekarang
      return !departureDateTime.isBefore(now);
    } catch (e) {
      debugPrint('Error checking if booking is upcoming: $e');
      // Default ke false jika terjadi error
      return false;
    }
  }

  /// Filter tiket riwayat berdasarkan kategori
  List<Booking> filterHistoryTickets(
    List<Booking> historyTickets,
    String filter,
  ) {
    if (filter == 'all') {
      return historyTickets;
    }

    return historyTickets.where((booking) {
      switch (filter) {
        case 'completed':
          return booking.status == 'COMPLETED';
        case 'expired':
          return booking.status == 'EXPIRED';
        case 'cancelled':
          return booking.status == 'CANCELLED';
        case 'refunded':
          return booking.status == 'REFUNDED';
        default:
          return true;
      }
    }).toList();
  }

  /// Mendapatkan waktu keberangkatan terdekat dari daftar tiket
  DateTime? getClosestDepartureTime(List<Booking> upcomingTickets) {
    if (upcomingTickets.isEmpty) return null;

    DateTime? closestTime;
    Duration? shortestDifference;

    for (final booking in upcomingTickets) {
      if (booking.schedule == null) continue;

      final departureDateTime = DateTimeHelper.combineDateAndTime(
        booking.departureDate,
        booking.schedule!.departureTime,
      );

      if (departureDateTime == null) continue;

      final difference = departureDateTime.difference(DateTime.now());

      // Lewati jadwal yang sudah lewat
      if (difference.isNegative) continue;

      if (shortestDifference == null || difference < shortestDifference) {
        shortestDifference = difference;
        closestTime = departureDateTime;
      }
    }

    return closestTime;
  }

  /// Mendapatkan informasi status untuk tiket
  StatusInfo getStatusInfo(Booking booking) {
    final StatusInfo statusInfo;

    // Cek status riil terlebih dahulu (termasuk cek apakah expired berdasarkan waktu)
    final isExpired = DateTimeHelper.isExpired(
      booking.departureDate,
      booking.schedule?.departureTime ?? '',
    );

    // Jika secara waktu sudah expired tapi status masih CONFIRMED/PENDING
    if (isExpired && ['CONFIRMED', 'PENDING'].contains(booking.status)) {
      statusInfo = StatusInfo(
        color: Colors.grey[700]!,
        icon: Icons.event_busy,
        label: 'Kadaluarsa',
      );
    } else {
      // Gunakan status dari server
      switch (booking.status) {
        case 'CONFIRMED':
          statusInfo = StatusInfo(
            color: Colors.green,
            icon: Icons.check_circle,
            label: 'Terkonfirmasi',
          );
          break;
        case 'PENDING':
          statusInfo = StatusInfo(
            color: Colors.orange,
            icon: Icons.pending_outlined,
            label: 'Menunggu Pembayaran',
          );
          break;
        case 'CANCELLED':
          statusInfo = StatusInfo(
            color: Colors.red,
            icon: Icons.cancel_outlined,
            label: 'Dibatalkan',
          );
          break;
        case 'EXPIRED':
          statusInfo = StatusInfo(
            color: Colors.grey[700]!,
            icon: Icons.event_busy,
            label: 'Kadaluarsa',
          );
          break;
        case 'COMPLETED':
          statusInfo = StatusInfo(
            color: Colors.blue,
            icon: Icons.done_all,
            label: 'Selesai',
          );
          break;
        case 'REFUNDED':
          statusInfo = StatusInfo(
            color: Colors.purple,
            icon: Icons.monetization_on_outlined,
            label: 'Dana Dikembalikan',
          );
          break;
        case 'REFUND_PENDING':
          statusInfo = StatusInfo(
            color: Colors.pink,
            icon: Icons.monetization_on_outlined,
            label: 'Refund Diproses',
          );
          break;
        case 'RESCHEDULED':
          statusInfo = StatusInfo(
            color: Colors.teal,
            icon: Icons.schedule,
            label: 'Dijadwalkan Ulang',
          );
          break;
        default:
          statusInfo = StatusInfo(
            color: Colors.grey,
            icon: Icons.help_outline,
            label: booking.status,
          );
      }
    }

    return statusInfo;
  }
}

/// Kelas untuk menyimpan informasi status
class StatusInfo {
  final Color color;
  final IconData icon;
  final String label;

  const StatusInfo({
    required this.color,
    required this.icon,
    required this.label,
  });
}
