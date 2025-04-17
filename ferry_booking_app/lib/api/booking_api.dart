import 'package:ferry_booking_app/services/api_service.dart';
import 'package:ferry_booking_app/models/booking.dart';

class BookingApi {
  final ApiService _apiService = ApiService();

  // Get all bookings
  Future<List<Booking>> getBookings() async {
    final response = await _apiService.get('bookings');

    if (response['success']) {
      return (response['data'] as List)
          .map((json) => Booking.fromJson(json))
          .toList();
    } else {
      throw Exception(response['message']);
    }
  }

  // Get booking details
  Future<Booking> getBookingDetails(int bookingId) async {
    final response = await _apiService.get('bookings/$bookingId');

    if (response['success']) {
      return Booking.fromJson(response['data']);
    } else {
      throw Exception(response['message']);
    }
  }

  // Create booking
  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    final response = await _apiService.post('bookings', bookingData);

    if (response['success']) {
      return {
        'booking': Booking.fromJson(response['data']['booking']),
        'payment': response['data']['payment'],
      };
    } else {
      throw Exception(response['message']);
    }
  }

  // Cancel booking
  Future<void> cancelBooking(int bookingId) async {
    final response = await _apiService.post('bookings/$bookingId/cancel', {});

    if (!response['success']) {
      throw Exception(response['message']);
    }
  }
}