import 'schedule.dart';
import 'payment.dart';
import 'ticket.dart';
import 'vehicle.dart';

class Booking {
  final int id;
  final String bookingCode;
  final int userId;
  final int scheduleId;
  final String bookingDate;
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
    required this.bookingDate,
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
    return Booking(
      id: json['id'],
      bookingCode: json['booking_code'],
      userId: json['user_id'],
      scheduleId: json['schedule_id'],
      bookingDate: json['booking_date'],
      passengerCount: json['passenger_count'],
      vehicleCount: json['vehicle_count'],
      totalAmount: double.parse(json['total_amount'].toString()),
      status: json['status'],
      cancellationReason: json['cancellation_reason'],
      bookedBy: json['booked_by'],
      bookingChannel: json['booking_channel'],
      notes: json['notes'],
      createdAt: json['created_at'],
      schedule: json['schedule'] != null ? Schedule.fromJson(json['schedule']) : null,
      payments: json['payments'] != null
          ? List<Payment>.from(json['payments'].map((x) => Payment.fromJson(x)))
          : null,
      tickets: json['tickets'] != null
          ? List<Ticket>.from(json['tickets'].map((x) => Ticket.fromJson(x)))
          : null,
      vehicles: json['vehicles'] != null
          ? List<Vehicle>.from(json['vehicles'].map((x) => Vehicle.fromJson(x)))
          : null,
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
    if (payment == null) {
      return null;
    }
    
    return payment.expiryTime;
  }
}