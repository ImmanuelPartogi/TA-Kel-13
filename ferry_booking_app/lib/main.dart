import 'dart:ui';

import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/screens/notification/notification_screen.dart';
import 'package:ferry_booking_app/screens/payment/payment_method_screen.dart';
import 'package:ferry_booking_app/screens/booking/schedule_selection_screen.dart';
import 'package:ferry_booking_app/widgets/global_fab.dart';
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
        home: FabWrapper(child: const SplashScreen()),
        // Di bagian routes (hanya rute tanpa parameter wajib)
        routes: {
          '/login': (context) => FabWrapper(child: const LoginScreen()),
          '/register': (context) => FabWrapper(child: const RegisterScreen()),
          '/home': (context) => FabWrapper(child: const HomeScreen()),
          '/profile': (context) => FabWrapper(child: const ProfileScreen()),
          '/tickets':
              (context) => FabWrapper(
                child: const TicketListScreen(),
                showAddTicket: true,
                ticketRouteDestination: '/booking/routes',
              ),

          // Rute Booking
          '/booking/routes':
              (context) => FabWrapper(child: const RouteSelectionScreen()),
          '/booking/passengers':
              (context) => FabWrapper(child: const PassengerDetailsScreen()),
          '/booking/vehicles':
              (context) => FabWrapper(child: const VehicleDetailsScreen()),
          '/booking/summary':
              (context) => FabWrapper(child: const BookingSummaryScreen()),
          '/booking/payment':
              (context) => FabWrapper(child: const PaymentScreen()),
          
          // Rute Chatbot - perbaikan definisi route
          '/chatbot': (context) => FabWrapper(child: const ChatbotScreen()),

          '/booking/payment-method':
              (context) => FabWrapper(child: const PaymentMethodScreen()),
          '/forgot-password':
              (context) => FabWrapper(child: const ForgotPasswordScreen()),
          '/notifications':
              (context) => FabWrapper(child: const NotificationScreen()),
        },

        // Di bagian onGenerateRoute (rute dengan parameter wajib)
        onGenerateRoute: (settings) {
          // Rute dengan parameter khusus
          if (settings.name == '/booking/schedules') {
            final route = settings.arguments as FerryRoute;
            return MaterialPageRoute(
              builder: (context) => FabWrapper(
                child: ScheduleSelectionScreen(route: route),
              ),
              settings: settings,
            );
          } else if (settings.name == '/tickets/detail') {
            final bookingId = settings.arguments as int;
            return MaterialPageRoute(
              builder: (context) => FabWrapper(
                child: TicketDetailScreen(bookingId: bookingId),
              ),
              settings: settings,
            );
          } else if (settings.name == '/booking/success') {
            final bookingId = settings.arguments as int;
            return MaterialPageRoute(
              builder: (context) => FabWrapper(
                child: BookingSuccessScreen(bookingId: bookingId),
              ),
              settings: settings,
            );
          } else if (settings.name == '/booking/payment') {
            final args = settings.arguments as Map<String, dynamic>?;
            return MaterialPageRoute(
              builder: (context) => FabWrapper(
                child: PaymentScreen(
                  paymentMethod: args?['paymentMethod'],
                  paymentType: args?['paymentType'],
                ),
              ),
            );
          } else if (settings.name == '/reset-password') {
            final args = settings.arguments as Map<String, String>;
            return MaterialPageRoute(
              builder: (context) => FabWrapper(
                child: ResetPasswordScreen(
                  email: args['email']!,
                  token: args['token'] ?? '',
                ),
              ),
            );
          }

          // Default return null
          return null;
        },
      ),
    );
  }
}

// Class FabWrapper untuk mengemas halaman dengan FAB global
class FabWrapper extends StatelessWidget {
  final Widget child;
  final bool showAddTicket;
  final String? ticketRouteDestination;

  const FabWrapper({
    Key? key,
    required this.child,
    this.showAddTicket = false,
    this.ticketRouteDestination,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Periksa apakah child sudah punya Scaffold
    if (child is Scaffold) {
      return Stack(
        children: [
          child,
          Positioned(
            right: 16,
            bottom: 16,
            child: GlobalFAB(
              showAddTicket: showAddTicket,
              onAddTicket: ticketRouteDestination != null
                ? () => Navigator.pushNamed(context, ticketRouteDestination!)
                : null,
            ),
          ),
        ],
      );
    } else {
      // Jika child bukan Scaffold, bungkus dengan Scaffold
      return Scaffold(
        body: child,
        floatingActionButton: GlobalFAB(
          showAddTicket: showAddTicket,
          onAddTicket: ticketRouteDestination != null
            ? () => Navigator.pushNamed(context, ticketRouteDestination!)
            : null,
        ),
      );
    }
  }
}