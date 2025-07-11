import 'package:intl/intl.dart' as intl;

import 'schedule.dart';
import 'payment.dart';
import 'ticket.dart';
import 'vehicle.dart';

class Booking {
  static final Map<String, DateTime?> _parsedDateCache = {};
  final int id;
  final String bookingCode;
  final int userId;
  final int scheduleId;
  final String departureDate; // Ganti bookingDate
  final int passengerCount;
  final int vehicleCount;
  final double totalAmount;
  String status;
  final String? cancellationReason;
  final String bookedBy;
  final String? bookingChannel;
  final String? notes;
  final String createdAt;
  final Schedule? schedule;
  List<Payment>? payments;
  final List<Ticket>? tickets;
  final List<Vehicle>? vehicles;

  // Properti transient untuk metode pembayaran yang dipilih
  String? paymentMethod;
  String? paymentType;

  Booking({
    required this.id,
    required this.bookingCode,
    required this.userId,
    required this.scheduleId,
    required this.departureDate, // Ganti parameter
    required this.passengerCount,
    required this.vehicleCount,
    required this.totalAmount,
    required this.status,
    this.cancellationReason,
    required this.bookedBy,
    this.bookingChannel,
    this.notes,
    required this.createdAt,
    this.schedule,
    this.payments,
    this.tickets,
    this.vehicles,
    this.paymentMethod,
    this.paymentType,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    // Fungsi helper untuk menangani nilai null pada integer
    int safeParseInt(dynamic value, {int defaultValue = 0}) {
      if (value == null) return defaultValue;
      if (value is int) return value;
      try {
        return int.parse(value.toString());
      } catch (e) {
        print('Error parsing int: $value, error: $e');
        return defaultValue;
      }
    }

    // Fungsi helper untuk menangani nilai null pada double
    double safeParseDouble(dynamic value, {double defaultValue = 0.0}) {
      if (value == null) return defaultValue;
      if (value is double) return value;
      try {
        return double.parse(value.toString());
      } catch (e) {
        print('Error parsing double: $value, error: $e');
        return defaultValue;
      }
    }

    // Parse payments dengan validasi yang lebih kuat
    List<Payment>? parsePayments() {
      if (json['payments'] == null) return null;

      try {
        final paymentsList = json['payments'] as List;
        List<Payment> result = [];

        for (var paymentData in paymentsList) {
          try {
            result.add(Payment.fromJson(paymentData));
          } catch (e) {
            print('Error parsing payment: $e');
            // Skip payment yang gagal di-parse
          }
        }

        return result.isEmpty ? null : result;
      } catch (e) {
        print('Error parsing payments list: $e');
        return null;
      }
    }

    // Mendapatkan payments
    final List<Payment>? parsedPayments = parsePayments();

    // Mendapatkan payment terakhir untuk inisialisasi properti transient
    final Payment? latestPayment =
        parsedPayments != null && parsedPayments.isNotEmpty
            ? parsedPayments.first
            : null;

    return Booking(
      id: safeParseInt(json['id'], defaultValue: -1),
      bookingCode: json['booking_code'] ?? 'UNKNOWN',
      userId: safeParseInt(json['user_id'], defaultValue: -1),
      scheduleId: safeParseInt(json['schedule_id'], defaultValue: -1),
      departureDate:
          json['departure_date'] ??
          DateTime.now().toIso8601String().split('T')[0],
      passengerCount: safeParseInt(json['passenger_count']),
      vehicleCount: safeParseInt(json['vehicle_count']),
      totalAmount: safeParseDouble(json['total_amount']),
      status: json['status'] ?? 'UNKNOWN',
      cancellationReason: json['cancellation_reason'],
      bookedBy: json['booked_by'] ?? 'MOBILE_APP',
      bookingChannel: json['booking_channel'],
      notes: json['notes'],
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
      schedule:
          json['schedule'] != null ? Schedule.fromJson(json['schedule']) : null,
      payments: parsedPayments,
      tickets:
          json['tickets'] != null
              ? List<Ticket>.from(
                json['tickets'].map((x) => Ticket.fromJson(x)),
              )
              : null,
      vehicles:
          json['vehicles'] != null
              ? List<Vehicle>.from(
                json['vehicles'].map((x) => Vehicle.fromJson(x)),
              )
              : null,
      // Inisialisasi properti transient dari payment terakhir
      paymentMethod: latestPayment?.paymentMethod,
      paymentType: latestPayment?.paymentType,
    );
  }

  // Mendapatkan payment terakhir
  Payment? get latestPayment {
    if (payments == null || payments!.isEmpty) {
      return null;
    }

    // Urutkan payments berdasarkan created_at terbaru
    payments!.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return payments!.first;
  }

  // Mendapatkan waktu kedaluwarsa dari payment terakhir
  DateTime? get expiryTime {
    final payment = latestPayment;
    return payment?.expiryTime;
  }

  // Mendapatkan status pembayaran yang user-friendly
  String get statusDisplay {
    switch (status) {
      case 'PENDING':
        return 'Menunggu Pembayaran';
      case 'CONFIRMED':
        return 'Terkonfirmasi';
      case 'CANCELLED':
        return 'Dibatalkan';
      case 'COMPLETED':
        return 'Selesai';
      case 'REFUNDED':
        return 'Dana Dikembalikan';
      case 'RESCHEDULED':
        return 'Dijadwalkan Ulang';
      default:
        return status;
    }
  }

  // Di class Booking
  String get statusDescription {
    switch (status) {
      case 'PENDING':
        return 'Menunggu pembayaran Anda.';
      case 'CONFIRMED':
        return 'Tiket Anda telah dikonfirmasi dan siap digunakan.';
      case 'CANCELLED':
        return 'Booking ini telah dibatalkan.';
      case 'COMPLETED':
        return 'Perjalanan Anda telah selesai.';
      case 'REFUND_PENDING':
        return 'Permintaan refund sedang diproses. Mohon tunggu 3-7 hari kerja.';
      case 'REFUNDED':
        return 'Dana telah dikembalikan ke rekening Anda.';
      default:
        return '';
    }
  }

  // Mendapatkan warna untuk status
  // Catatan: Gunakan Colors dari package:flutter/material.dart
  // di file yang menggunakan metode ini
  getStatusColor() {
    switch (status) {
      case 'PENDING':
        return 0xFFFFA726; // Colors.orange[400]
      case 'CONFIRMED':
        return 0xFF66BB6A; // Colors.green[400]
      case 'CANCELLED':
        return 0xFFEF5350; // Colors.red[400]
      case 'COMPLETED':
        return 0xFF42A5F5; // Colors.blue[400]
      case 'REFUNDED':
        return 0xFF9575CD; // Colors.deepPurple[300]
      case 'RESCHEDULED':
        return 0xFF26A69A; // Colors.teal[400]
      default:
        return 0xFF9E9E9E; // Colors.grey[500]
    }
  }

  // Cek apakah booking sudah dibayar
  bool get isPaid {
    return status == 'CONFIRMED' || status == 'COMPLETED';
  }

  // Cek apakah booking masih menunggu pembayaran
  bool get isPending {
    return status == 'PENDING';
  }

  // Cek apakah booking sudah dibatalkan
  bool get isCancelled {
    return status == 'CANCELLED';
  }

  bool get isExpired {
    try {
      // Pastikan schedule tersedia
      if (schedule == null) return false;

      final departureDate = DateTime.parse(this.departureDate);
      final now = DateTime.now();

      // Jika tanggal keberangkatan sudah lewat beberapa hari
      if (departureDate.year < now.year ||
          (departureDate.year == now.year && departureDate.month < now.month) ||
          (departureDate.year == now.year &&
              departureDate.month == now.month &&
              departureDate.day < now.day)) {
        return true;
      }

      // Jika ini adalah hari keberangkatan, periksa waktu keberangkatan
      if (departureDate.year == now.year &&
          departureDate.month == now.month &&
          departureDate.day == now.day) {
        final departureTime = schedule!.departureTime;
        DateTime? departureDateTime;

        // Parsing berbagai kemungkinan format waktu
        if (departureTime.contains('T')) {
          // Format ISO
          departureDateTime = DateTime.parse(departureTime);
        } else if (departureTime.contains(':')) {
          // Format HH:MM:SS atau HH:MM
          final parts = departureTime.split(':');
          if (parts.length >= 2) {
            final hour = int.tryParse(parts[0]) ?? 0;
            final minute = int.tryParse(parts[1]) ?? 0;

            departureDateTime = DateTime(
              departureDate.year,
              departureDate.month,
              departureDate.day,
              hour,
              minute,
            );
          }
        }

        // Jika berhasil parsing waktu keberangkatan, periksa apakah sudah lewat
        if (departureDateTime != null) {
          return now.isAfter(departureDateTime);
        }
      }

      // Default false jika tidak memenuhi kriteria di atas
      return false;
    } catch (e) {
      print('Error checking booking expiry: $e');
      return false;
    }
  }

  // Metode untuk mendapatkan DateTime gabungan tanggal dan waktu keberangkatan
  DateTime? get departureDateTime {
  try {
    if (schedule == null) return null;
    
    // Buat key cache dari kombinasi departureDate dan departureTime
    final cacheKey = "${this.departureDate}_${schedule!.departureTime}";
    
    // Cek apakah sudah ada di cache
    if (_parsedDateCache.containsKey(cacheKey)) {
      return _parsedDateCache[cacheKey];
    }
    
    final departureDate = DateTime.parse(this.departureDate);
    final departureTime = schedule!.departureTime;
    DateTime? result;

    // Parsing berbagai kemungkinan format waktu
    if (departureTime.contains('T')) {
      // Format ISO
      final timeDate = DateTime.parse(departureTime);
      result = DateTime(
        departureDate.year,
        departureDate.month,
        departureDate.day,
        timeDate.hour,
        timeDate.minute,
        timeDate.second,
      );
    } else if (departureTime.contains(':')) {
      // Format HH:MM:SS atau HH:MM
      final parts = departureTime.split(':');
      if (parts.length >= 2) {
        final hour = int.tryParse(parts[0]) ?? 0;
        final minute = int.tryParse(parts[1]) ?? 0;
        final second = parts.length > 2 ? (int.tryParse(parts[2]) ?? 0) : 0;

        result = DateTime(
          departureDate.year,
          departureDate.month,
          departureDate.day,
          hour,
          minute,
          second,
        );
      }
    }

    // Simpan hasil ke cache
    _parsedDateCache[cacheKey] = result;
    return result;
  } catch (e) {
    print('Error getting departure date time: $e');
    return null;
  }
}

  // Metode untuk mendapatkan waktu keberangkatan yang diformat
  String get formattedDepartureTime {
    try {
      if (schedule == null) return '--:--';

      final departureTime = schedule!.departureTime;

      // Format ISO dengan T
      if (departureTime.contains('T')) {
        final dateTime = DateTime.parse(departureTime);
        return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
      }

      // Format dengan spasi (YYYY-MM-DD HH:MM:SS)
      if (departureTime.contains(' ')) {
        final parts = departureTime.split(' ');
        if (parts.length > 1 && parts[1].contains(':')) {
          final timeParts = parts[1].split(':');
          return '${timeParts[0].padLeft(2, '0')}:${timeParts[1].padLeft(2, '0')}';
        }
      }

      // Format HH:MM:SS atau HH:MM
      if (departureTime.contains(':')) {
        final parts = departureTime.split(':');
        if (parts.length >= 2) {
          return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
        }
      }

      return departureTime;
    } catch (e) {
      print('Error formatting departure time: $e');
      return '--:--';
    }
  }

  // Metode untuk mendapatkan tanggal keberangkatan yang diformat
  String formattedDepartureDate({String locale = 'id_ID'}) {
    try {
      final dateFormat = intl.DateFormat('EEEE, d MMMM yyyy', locale);
      final date = DateTime.parse(departureDate);
      return dateFormat.format(date);
    } catch (e) {
      print('Error formatting departure date: $e');
      return departureDate;
    }
  }

  // Metode untuk memeriksa apakah keberangkatan dalam 24 jam ke depan
  bool get isDepartureWithin24Hours {
    final departureTime = departureDateTime;
    if (departureTime == null) return false;

    final now = DateTime.now();
    final difference = departureTime.difference(now);

    return difference.inHours <= 24 && difference.inHours >= 0;
  }

  // Update properti payment method dan payment type
  void updatePaymentInfo(String method, String type) {
    paymentMethod = method;
    paymentType = type;
  }
}
