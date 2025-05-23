import 'dart:convert';
import 'package:ferry_booking_app/models/refund.dart';
import 'package:ferry_booking_app/services/api_service.dart';

class RefundApi {
  final ApiService _apiService = ApiService();

  // Check refund eligibility
  Future<Map<String, dynamic>> checkRefundEligibility(int bookingId) async {
    try {
      final response = await _apiService.get('refunds/eligibility/$bookingId');
      return response;
    } catch (e) {
      print('Error checking refund eligibility: $e');
      throw Exception('Terjadi kesalahan saat memeriksa kelayakan refund: ${e.toString()}');
    }
  }

  // Request refund dengan penanganan response yang lebih baik
  Future<Map<String, dynamic>> requestRefund(Map<String, dynamic> refundData) async {
    try {
      final response = await _apiService.post('refunds/request', refundData);
      return response;
    } catch (e) {
      print('Error requesting refund: $e');
      
      // Re-throw the original exception untuk mempertahankan error message yang tepat
      rethrow;
    }
  }

  // Get refund details for a booking
  Future<Map<String, dynamic>> getRefundDetailsByBookingId(int bookingId) async {
    try {
      final response = await _apiService.get('refunds/booking/$bookingId');
      return response;
    } catch (e) {
      print('Error getting refund details: $e');
      
      if (e.toString().contains('not found') || e.toString().contains('404')) {
        return {
          'success': false,
          'message': 'Data refund tidak ditemukan',
          'data': null
        };
      }
      
      throw Exception('Terjadi kesalahan saat mengambil detail refund: ${e.toString()}');
    }
  }

  // Cancel refund
  Future<Map<String, dynamic>> cancelRefund(int refundId) async {
    try {
      final response = await _apiService.post('refunds/$refundId/cancel', {});
      return response;
    } catch (e) {
      print('Error cancelling refund: $e');
      throw Exception('Terjadi kesalahan saat membatalkan refund: ${e.toString()}');
    }
  }
}