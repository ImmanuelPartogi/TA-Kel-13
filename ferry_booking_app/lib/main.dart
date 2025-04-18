import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/screens/booking/schedule_selection_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/providers/notification_provider.dart';
import 'package:ferry_booking_app/providers/chatbot_provider.dart'; // Add chatbot provider import
import 'package:ferry_booking_app/screens/splash_screen.dart';
import 'package:ferry_booking_app/screens/auth/login_screen.dart';
import 'package:ferry_booking_app/screens/auth/register_screen.dart';
import 'package:ferry_booking_app/screens/home/home_screen.dart';
import 'package:ferry_booking_app/screens/booking/route_selection_screen.dart';
import 'package:ferry_booking_app/screens/profile/profile_screen.dart';
import 'package:ferry_booking_app/screens/tickets/ticket_list_screen.dart';
import 'package:ferry_booking_app/screens/chatbot/chatbot_screen.dart'; // Add chatbot screen import
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/date_symbol_data_local.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inisialisasi locale data untuk format tanggal
  await initializeDateFormatting('id_ID', null);

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
        ChangeNotifierProvider(
          create: (_) => ChatbotProvider(),
        ), // Add chatbot provider
      ],
      child: MaterialApp(
        title: 'Ferry Booking',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/tickets': (context) => const TicketListScreen(),
          '/booking/routes': (context) => const RouteSelectionScreen(),
          '/chatbot': (context) => const ChatbotScreen(), // Add chatbot route
        },
        onGenerateRoute: (settings) {
          if (settings.name == '/booking/schedules') {
            final route = settings.arguments as FerryRoute;
            return MaterialPageRoute(
              builder: (context) => ScheduleSelectionScreen(route: route),
              settings: settings,
            );
          }
          // Tambahkan rute lain yang memerlukan argumen
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
