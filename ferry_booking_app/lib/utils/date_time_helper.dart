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
      // Parse tanggal dan pastikan menggunakan zona waktu lokal
      final date = DateTime.parse(dateString).toLocal();

      // Debug untuk melihat format waktu yang masuk
      debugPrint('Parse date time: $dateString, $timeString');

      // Parse waktu dengan benar
      int hour = 0, minute = 0, second = 0;

      // Format ISO dengan T (seperti dalam departure_time dari API)
      if (timeString.contains('T')) {
        final time = DateTime.parse(timeString).toLocal();
        hour = time.hour;
        minute = time.minute;
        second = time.second;
      }
      // Format dengan titik dua (HH:MM:SS atau HH:MM)
      else if (timeString.contains(':')) {
        final parts = timeString.split(':');
        hour = int.tryParse(parts[0].trim()) ?? 0;
        minute = parts.length > 1 ? (int.tryParse(parts[1].trim()) ?? 0) : 0;
        second = parts.length > 2 ? (int.tryParse(parts[2].trim()) ?? 0) : 0;
      }

      // Log hasil parsing waktu untuk debugging
      debugPrint('Parsed time: $hour:$minute:$second');

      // Gabungkan tanggal dan waktu
      return DateTime(date.year, date.month, date.day, hour, minute, second);
    } catch (e) {
      debugPrint('Error combining date and time: $e');
      return null;
    }
  }

  // Cek apakah jadwal sudah expired
  static bool isExpired(String dateString, String timeString) {
    try {
      final departureDateTime = combineDateAndTime(dateString, timeString);

      if (departureDateTime == null) {
        return false; // Anggap belum expired jika tidak bisa parse tanggal/waktu
      }

      final now = DateTime.now();

      // Tiket dianggap expired jika waktu keberangkatan sudah lewat
      return now.isAfter(departureDateTime);
    } catch (e) {
      debugPrint('Error checking if expired: $e');
      return false; // Asumsikan belum expired jika terjadi error
    }
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
