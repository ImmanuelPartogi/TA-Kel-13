import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateTimeHelper {
  // Format tanggal dalam bahasa Indonesia (Senin, 30 Mei 2025)
  static String formatDate(String dateString, {String locale = 'id_ID'}) {
    try {
      final dateFormat = DateFormat('EEEE, d MMMM yyyy', locale);
      final date = DateTime.parse(dateString).toLocal();
      return dateFormat.format(date);
    } catch (e) {
      debugPrint('Error formatting date: $e');
      return dateString;
    }
  }

  // Format waktu ke format HH:MM dari berbagai input
  static String formatTime(String timeString) {
    try {
      // Format ISO dengan T (2025-05-29T09:00:00.000000Z)
      if (timeString.contains('T')) {
        final dateTime = DateTime.parse(timeString);
        return DateFormat('HH:mm').format(dateTime.toLocal());
      }

      // Format dengan spasi (2025-05-29 09:00:00)
      if (timeString.contains(' ')) {
        final parts = timeString.split(' ');
        if (parts.length > 1 && parts[1].contains(':')) {
          final timeParts = parts[1].split(':');
          return '${timeParts[0].padLeft(2, '0')}:${timeParts[1].padLeft(2, '0')}';
        }
      }

      // Format HH:MM:SS atau HH:MM
      if (timeString.contains(':')) {
        final parts = timeString.split(':');
        if (parts.length >= 2) {
          return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
        }
      }

      return timeString;
    } catch (e) {
      debugPrint('Error formatting time: $e');
      return timeString;
    }
  }

  // Mendapatkan DateTime dari kombinasi tanggal dan waktu
  static DateTime? combineDateAndTime(String dateString, String timeString) {
    try {
      final date = DateTime.parse(dateString);

      // Handle berbagai format waktu
      if (timeString.contains('T')) {
        // Format ISO
        final timeDate = DateTime.parse(timeString);
        return DateTime(
          date.year,
          date.month,
          date.day,
          timeDate.hour,
          timeDate.minute,
          timeDate.second,
        );
      } else if (timeString.contains(':')) {
        // Format HH:MM:SS atau HH:MM
        final parts = timeString.split(':');
        final hour = int.tryParse(parts[0]) ?? 0;
        final minute = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;
        final second = parts.length > 2 ? (int.tryParse(parts[2]) ?? 0) : 0;

        return DateTime(date.year, date.month, date.day, hour, minute, second);
      }

      // Default fallback
      return date;
    } catch (e) {
      debugPrint('Error combining date and time: $e');
      return null;
    }
  }

  // Cek apakah jadwal sudah expired
  static bool isExpired(String dateString, String timeString) {
    final now = DateTime.now();
    final departureDateTime = combineDateAndTime(dateString, timeString);

    if (departureDateTime == null) return false;

    return now.isAfter(departureDateTime);
  }

  static String formatDuration(int minutes) {
    final hours = minutes ~/ 60;
    final mins = minutes % 60;

    if (hours > 0) {
      return mins > 0 ? '$hours jam $mins menit' : '$hours jam';
    } else {
      return '$mins menit';
    }
  }

  // Fungsi untuk mengkonversi durasi antara dua timestamp
  static int calculateDurationMinutes(
    String departureTime,
    String arrivalTime,
  ) {
    try {
      final departure = formatTime(departureTime);
      final arrival = formatTime(arrivalTime);

      final depParts = departure.split(':');
      final arrParts = arrival.split(':');

      final depMinutes = (int.parse(depParts[0]) * 60) + int.parse(depParts[1]);
      final arrMinutes = (int.parse(arrParts[0]) * 60) + int.parse(arrParts[1]);

      // Menangani kasus ketika arrivalTime di hari berikutnya
      int duration = arrMinutes - depMinutes;
      if (duration < 0) {
        duration += 24 * 60; // Tambahkan 24 jam
      }

      return duration;
    } catch (e) {
      debugPrint('Error calculating duration: $e');
      return 0;
    }
  }
}
