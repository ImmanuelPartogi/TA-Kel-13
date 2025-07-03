import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateTimeHelper {
  // Tambahkan cache di awal file
  static final Map<String, String> _formattedDateCache = {};
  static final Map<String, String> _formattedTimeCache = {};
  static final Map<String, DateTime?> _dateTimeCache = {};
  static final Map<String, bool> _expiredCache = {};
  
  // Format tanggal dalam bahasa Indonesia (Senin, 30 Mei 2025)
  static String formatDate(String dateString, {String locale = 'id_ID'}) {
    // Cek cache terlebih dahulu
    final cacheKey = "${dateString}_${locale}";
    if (_formattedDateCache.containsKey(cacheKey)) {
      return _formattedDateCache[cacheKey]!;
    }
    
    try {
      final dateFormat = DateFormat('EEEE, d MMMM yyyy', locale);
      final date = DateTime.parse(dateString).toLocal();
      final result = dateFormat.format(date);
      
      // Simpan ke cache
      _formattedDateCache[cacheKey] = result;
      return result;
    } catch (e) {
      // debugPrint('Error formatting date: $e');
      return dateString;
    }
  }

  // Format waktu ke format HH:MM dari berbagai input
  static String formatTime(String timeString) {
    // Cek cache terlebih dahulu
    if (_formattedTimeCache.containsKey(timeString)) {
      return _formattedTimeCache[timeString]!;
    }
    
    try {
      String result;
      
      // Format ISO dengan T (2025-05-29T09:00:00.000000Z)
      if (timeString.contains('T')) {
        final dateTime = DateTime.parse(timeString);
        result = DateFormat('HH:mm').format(dateTime.toLocal());
      }
      // Format dengan spasi (2025-05-29 09:00:00)
      else if (timeString.contains(' ')) {
        final parts = timeString.split(' ');
        if (parts.length > 1 && parts[1].contains(':')) {
          final timeParts = parts[1].split(':');
          result = '${timeParts[0].padLeft(2, '0')}:${timeParts[1].padLeft(2, '0')}';
        } else {
          result = timeString;
        }
      }
      // Format HH:MM:SS atau HH:MM
      else if (timeString.contains(':')) {
        final parts = timeString.split(':');
        if (parts.length >= 2) {
          result = '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
        } else {
          result = timeString;
        }
      } else {
        result = timeString;
      }
      
      // Simpan ke cache
      _formattedTimeCache[timeString] = result;
      return result;
    } catch (e) {
      // debugPrint('Error formatting time: $e');
      return timeString;
    }
  }

  // Mendapatkan DateTime dari kombinasi tanggal dan waktu
  static DateTime? combineDateAndTime(String dateString, String timeString) {
    // Buat key cache
    final cacheKey = "${dateString}_${timeString}";
    
    // Cek apakah sudah ada di cache
    if (_dateTimeCache.containsKey(cacheKey)) {
      return _dateTimeCache[cacheKey];
    }
    
    try {
      // Parse tanggal dan pastikan menggunakan zona waktu lokal
      final date = DateTime.parse(dateString).toLocal();

      // Debug untuk melihat format waktu yang masuk
      // Kurangi logging berlebihan
      // debugPrint('Parse date time: $dateString, $timeString');

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

      // Kurangi logging berlebihan
      // debugPrint('Parsed time: $hour:$minute:$second');

      // Gabungkan tanggal dan waktu
      final result = DateTime(date.year, date.month, date.day, hour, minute, second);
      
      // Simpan ke cache
      _dateTimeCache[cacheKey] = result;
      return result;
    } catch (e) {
      // debugPrint('Error combining date and time: $e');
      _dateTimeCache[cacheKey] = null; // Cache error result juga
      return null;
    }
  }

  // Cek apakah jadwal sudah expired
  static bool isExpired(String dateString, String timeString) {
    // Buat key cache
    final cacheKey = "${dateString}_${timeString}";
    final now = DateTime.now();
    final cacheTimeKey = "${cacheKey}_${now.day}_${now.hour}";
    
    // Cek cache hanya jika dalam jam yang sama
    if (_expiredCache.containsKey(cacheTimeKey)) {
      return _expiredCache[cacheTimeKey]!;
    }
    
    try {
      final departureDateTime = combineDateAndTime(dateString, timeString);

      if (departureDateTime == null) {
        _expiredCache[cacheTimeKey] = false;
        return false; // Anggap belum expired jika tidak bisa parse tanggal/waktu
      }

      // Tiket dianggap expired jika waktu keberangkatan sudah lewat
      final result = now.isAfter(departureDateTime);
      
      // Simpan ke cache
      _expiredCache[cacheTimeKey] = result;
      return result;
    } catch (e) {
      // debugPrint('Error checking if expired: $e');
      _expiredCache[cacheTimeKey] = false;
      return false; // Asumsikan belum expired jika terjadi error
    }
  }

  // Sisanya tetap sama
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
      // debugPrint('Error calculating duration: $e');
      return 0;
    }
  }
  
  // Metode untuk membersihkan cache jika diperlukan
  static void clearCache() {
    _formattedDateCache.clear();
    _formattedTimeCache.clear();
    _dateTimeCache.clear();
    _expiredCache.clear();
  }
}