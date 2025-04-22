import 'dart:ui';

import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/screens/payment/payment_method_screen.dart';
import 'package:ferry_booking_app/screens/booking/schedule_selection_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart';
import 'package:ferry_booking_app/providers/chatbot_provider.dart';
import 'package:ferry_booking_app/screens/splash_screen.dart';
import 'package:ferry_booking_app/screens/auth/login_screen.dart';
import 'package:ferry_booking_app/screens/auth/register_screen.dart';
import 'package:ferry_booking_app/screens/home/home_screen.dart';
import 'package:ferry_booking_app/screens/booking/route_selection_screen.dart';
import 'package:ferry_booking_app/screens/profile/profile_screen.dart';
import 'package:ferry_booking_app/screens/tickets/ticket_list_screen.dart';
import 'package:ferry_booking_app/screens/chatbot/chatbot_screen.dart';
import 'package:ferry_booking_app/screens/booking/passenger_details_screen.dart';
import 'package:ferry_booking_app/screens/booking/vehicle_details_screen.dart';
import 'package:ferry_booking_app/screens/booking/booking_summary_screen.dart';
import 'package:ferry_booking_app/screens/payment/payment_screen.dart';
import 'package:ferry_booking_app/screens/booking/booking_success_screen.dart';
import 'package:ferry_booking_app/screens/tickets/ticket_detail_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_web/webview_flutter_web.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Handler untuk error yang tidak tertangani
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    print('Flutter Error: ${details.exception}');
    print('Stack trace: ${details.stack}');
    // Tambahkan logging/analytics disini jika perlu
  };

  // Handler untuk error asynchronous
  PlatformDispatcher.instance.onError = (error, stack) {
    print('Uncaught async error: $error');
    print('Stack trace: $stack');
    return true; // Return true untuk mencegah propagasi error
  };

  // Inisialisasi locale data untuk format tanggal
  await initializeDateFormatting('id_ID', null);

  if (kIsWeb) {
    WebViewPlatform.instance = WebWebViewPlatform();
  }

  // Initialize device ID if it doesn't exist
  final prefs = await SharedPreferences.getInstance();
  if (prefs.getString('device_id') == null) {
    final uuid = Uuid();
    final deviceId = uuid.v4(); // Generate a unique UUID v4
    await prefs.setString('device_id', deviceId);
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => ScheduleProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => ChatbotProvider()),
      ],
      child: MaterialApp(
        title: 'Ferry Booking',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const SplashScreen(),
        // Di bagian routes (hanya rute tanpa parameter wajib)
        routes: {
          // Rute Autentikasi
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),

          // Rute Utama
          '/home': (context) => const HomeScreen(),
          '/profile': (context) => const ProfileScreen(),

          // Rute Tiket
          '/tickets': (context) => const TicketListScreen(),

          // Rute Booking
          '/booking/routes': (context) => const RouteSelectionScreen(),
          '/booking/passengers': (context) => const PassengerDetailsScreen(),
          '/booking/vehicles': (context) => const VehicleDetailsScreen(),
          '/booking/summary': (context) => const BookingSummaryScreen(),
          '/booking/payment': (context) => const PaymentScreen(),
          // HAPUS: '/booking/success': (context) => const BookingSuccessScreen(),

          // Rute Chatbot
          '/chatbot': (context) => const ChatbotScreen(),

          '/booking/payment-method': (context) => const PaymentMethodScreen(),
        },

        // Di bagian onGenerateRoute (rute dengan parameter wajib)
        onGenerateRoute: (settings) {
          // Rute dengan parameter khusus
          if (settings.name == '/booking/schedules') {
            final route = settings.arguments as FerryRoute;
            return MaterialPageRoute(
              builder: (context) => ScheduleSelectionScreen(route: route),
              settings: settings,
            );
          } else if (settings.name == '/tickets/detail') {
            final bookingId = settings.arguments as int;
            return MaterialPageRoute(
              builder: (context) => TicketDetailScreen(bookingId: bookingId),
              settings: settings,
            );
          } else if (settings.name == '/booking/success') {
            final bookingId = settings.arguments as int;
            return MaterialPageRoute(
              builder: (context) => BookingSuccessScreen(bookingId: bookingId),
              settings: settings,
            );
          } else if (settings.name == '/booking/payment') {
            final args = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder:
                  (context) => PaymentScreen(
                    paymentMethod: args?['paymentMethod'],
                    paymentType: args?['paymentType'],
                  ),
            );
          }

          // Default return null
          return null;
        },
        onUnknownRoute: (settings) {
          // Fallback jika rute tidak ditemukan
          return MaterialPageRoute(
            builder:
                (context) => Scaffold(
                  appBar: AppBar(title: const Text('Halaman Tidak Ditemukan')),
                  body: const Center(child: Text('Halaman tidak tersedia')),
                ),
          );
        },
      ),
    );
  }
}
