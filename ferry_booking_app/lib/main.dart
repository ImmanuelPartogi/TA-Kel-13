import 'dart:ui';

import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/providers/ticket_status_provider.dart';
import 'package:ferry_booking_app/screens/notification/notification_screen.dart';
import 'package:ferry_booking_app/screens/payment/payment_method_screen.dart';
import 'package:ferry_booking_app/screens/booking/schedule_selection_screen.dart';
import 'package:ferry_booking_app/screens/refund/refund_request_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart';
import 'package:ferry_booking_app/providers/chatbot_provider.dart';
import 'package:ferry_booking_app/providers/refund_provider.dart';
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
import 'package:ferry_booking_app/screens/auth/forgot_password_screen.dart';
import 'package:ferry_booking_app/screens/auth/reset_password_screen.dart';
import 'package:ferry_booking_app/services/local_notification_service.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

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

  // Initialize Notification Service
  await LocalNotificationService().init();

  // Initialize locale data for date formatting
  await initializeDateFormatting('id_ID', null);

  // Initialize device ID if it doesn't exist
  final prefs = await SharedPreferences.getInstance();
  if (prefs.getString('device_id') == null) {
    final uuid = Uuid();
    final deviceId = uuid.v4();
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
        ChangeNotifierProvider(create: (_) => TicketStatusProvider()),
        ChangeNotifierProvider(create: (_) => ScheduleProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProxyProvider<AuthProvider, ChatbotProvider>(
          create:
              (context) => ChatbotProvider(
                Provider.of<AuthProvider>(context, listen: false),
              ),
          update: (context, auth, previous) => previous!,
        ),
        ChangeNotifierProvider(
          create: (_) => RefundProvider(),
        ), // Provider untuk Refund
      ],
      child: MaterialApp(
        title: 'Ferry Booking',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,

        // Tambahkan konfigurasi lokalisasi
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('id', 'ID'), // Indonesia
          Locale('en', 'US'), // English
        ],
        locale: const Locale('id', 'ID'),

        home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home':
              (context) =>
                  const HomeScreen(), // GlobalFAB sudah ditambahkan di HomeScreen
          '/profile': (context) => const ProfileScreen(),
          '/tickets': (context) => const TicketListScreen(),

          // Rute Booking
          '/booking/routes': (context) => const RouteSelectionScreen(),
          '/booking/passengers': (context) => const PassengerDetailsScreen(),
          '/booking/vehicles': (context) => const VehicleDetailsScreen(),
          '/booking/summary': (context) => const BookingSummaryScreen(),
          '/booking/payment': (context) => const PaymentScreen(),

          // Rute Chatbot
          '/chatbot': (context) => const ChatbotScreen(), // Tanpa FAB

          '/booking/payment-method': (context) => const PaymentMethodScreen(),
          '/forgot-password': (context) => const ForgotPasswordScreen(),
          '/notifications': (context) => const NotificationScreen(),
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
          } else if (settings.name == '/reset-password') {
            final args = settings.arguments as Map<String, String>;
            return MaterialPageRoute(
              builder:
                  (context) => ResetPasswordScreen(
                    email: args['email']!,
                    token: args['token'] ?? '',
                  ),
            );
          } else if (settings.name == '/refund/request') {
            final booking = settings.arguments as Booking;
            return MaterialPageRoute(
              builder: (context) => RefundRequestScreen(booking: booking),
              settings: settings,
            );
          }

          // Default return null
          return null;
        },
      ),
    );
  }
}