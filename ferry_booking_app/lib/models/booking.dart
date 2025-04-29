import 'schedule.dart';
import 'payment.dart';
import 'ticket.dart';
import 'vehicle.dart';

class Booking {
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
    // Parse payments dengan validasi
    List<Payment>? parsePayments() {
      if (json['payments'] == null) return null;

      try {
        final paymentsList = json['payments'] as List;
        return paymentsList
            .map((payment) => Payment.fromJson(payment))
            .toList();
      } catch (e) {
        print('Error parsing payments: $e');
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
      id: json['id'],
      bookingCode: json['booking_code'],
      userId: json['user_id'],
      scheduleId: json['schedule_id'],
      departureDate: json['departure_date'], // Ganti bookingDate -> departure_date
      passengerCount: json['passenger_count'],
      vehicleCount: json['vehicle_count'],
      totalAmount: double.parse(json['total_amount'].toString()),
      status: json['status'],
      cancellationReason: json['cancellation_reason'],
      bookedBy: json['booked_by'] ?? 'MOBILE_APP',
      bookingChannel: json['booking_channel'],
      notes: json['notes'],
      createdAt: json['created_at'],
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
      final bookingDateObj = DateTime.parse(departureDate);
      return DateTime.now().isAfter(bookingDateObj);
    } catch (e) {
      return false;
    }
  }

  // Update properti payment method dan payment type
  void updatePaymentInfo(String method, String type) {
    paymentMethod = method;
    paymentType = type;
  }
}
