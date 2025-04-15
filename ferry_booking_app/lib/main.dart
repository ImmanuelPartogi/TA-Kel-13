// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/screens/splash_screen.dart';
import 'package:ferry_booking_app/screens/auth/login_screen.dart';
import 'package:ferry_booking_app/screens/auth/register_screen.dart';
import 'package:ferry_booking_app/screens/home/home_screen.dart';
import 'package:ferry_booking_app/screens/booking/route_selection_screen.dart';
import 'package:ferry_booking_app/screens/profile/profile_screen.dart';
import 'package:ferry_booking_app/screens/tickets/ticket_list_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
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
        },
      ),
    );
  }
}