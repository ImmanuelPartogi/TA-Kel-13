import 'package:ferry_booking_app/api/api_service.dart';
import 'package:ferry_booking_app/models/payment.dart';

class PaymentApi {
  final ApiService _apiService = ApiService();

  // Get payment status
  Future<Payment> getPaymentStatus(String bookingCode) async {
    final response = await _apiService.get('payments/$bookingCode/status');

    if (response['success']) {
      return Payment.fromJson(response['data']);
    } else {
      throw Exception(response['message']);
    }
  }
}
