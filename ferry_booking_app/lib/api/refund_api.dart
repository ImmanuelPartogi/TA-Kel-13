import 'dart:convert';
import 'package:ferry_booking_app/models/refund.dart';
import 'package:ferry_booking_app/services/api_service.dart';

class RefundApi {
  final ApiService _apiService = ApiService();

  // Request refund
  Future<Refund> requestRefund(Map<String, dynamic> refundData) async {
    try {
      final response = await _apiService.post('refunds/request', refundData);

      if (response['success']) {
        return Refund.fromJson(response['data']);
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      print('Error requesting refund: $e');
      throw Exception('Terjadi kesalahan saat meminta refund: ${e.toString()}');
    }
  }

  // Get refund details for a booking
  Future<Refund?> getRefundDetailsByBookingId(int bookingId) async {
    try {
      final response = await _apiService.get('refunds/booking/$bookingId');

      if (response['success']) {
        return Refund.fromJson(response['data']);
      } else {
        // Jika tidak ada refund, return null
        return null;
      }
    } catch (e) {
      print('Error getting refund details: $e');
      if (e.toString().contains('not found') || e.toString().contains('404')) {
        return null;
      }
      throw Exception('Terjadi kesalahan saat mengambil detail refund: ${e.toString()}');
    }
  }

  // Cancel refund
  Future<Refund> cancelRefund(int refundId) async {
    try {
      final response = await _apiService.post('refunds/$refundId/cancel', {});

      if (response['success']) {
        return Refund.fromJson(response['data']);
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      print('Error cancelling refund: $e');
      throw Exception('Terjadi kesalahan saat membatalkan refund: ${e.toString()}');
    }
  }
}