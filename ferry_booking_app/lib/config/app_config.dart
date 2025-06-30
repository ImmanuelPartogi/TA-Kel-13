// lib/config/app_config.dart
class AppConfig {
  // API Configuration
  // static const String apiBaseUrl = 'http://127.0.0.1:8000/api'; // Local development
  static const String apiBaseUrl =
      'http://172.27.65.105:8000/api'; // Mahasiswa Connection
  // static const String apiBaseUrl = 'http://192.168.40.145:8000/api'; //SS Connection
  // static const String apiBaseUrl = 'http://192.168.1.8:8000/api'; //Nazi Connection

  // Untuk akses dari perangkat lain atau Midtrans callback
  // static const String publicBaseUrl =
  //     'https://cebd-114-5-144-192.ngrok-free.app';

  // Midtrans Configuration
  static const String midtransClientKey = 'SB-Mid-client-8csuXJ7DmFhqmkMX';
  static const bool midtransProduction = false;

  // Callback URLs (harus URL publik yang bisa diakses Midtrans)
  // static const String midtransCallbackUrl =
  //     'https://cebd-114-5-144-192.ngrok-free.app';

  static const String appName = 'Ferry Booking';
  static const String appVersion = '1.0.0';

  // Booking Configuration
  static const int maxPassengersPerBooking = 10;
  static const int maxVehiclesPerBooking = 5;

  // User Session Configuration
  static const int sessionTimeout = 30; // in days

  static const bool debugMode = true; // Set to false in production
}
