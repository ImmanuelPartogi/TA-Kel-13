// lib/config/app_config.dart
class AppConfig {
  // API Configuration
  static const String apiBaseUrl = 'http://127.0.0.1:8000/api'; // Replace with your API URL
  
  // Midtrans Configuration
  static const String midtransClientKey = 'SB-Mid-client-8csuXJ7DmFhqmkMX'; // Replace with your Midtrans client key
  static const bool midtransProduction = false; // Set to true for production
  
  // App Configuration
  static const String appName = 'Ferry Booking';
  static const String appVersion = '1.0.0';
  
  // Booking Configuration
  static const int maxPassengersPerBooking = 10;
  static const int maxVehiclesPerBooking = 5;
  
  // User Session Configuration
  static const int sessionTimeout = 30; // in days
}