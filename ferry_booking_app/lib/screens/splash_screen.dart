import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Berikan waktu untuk splash screen ditampilkan
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;
    
    // Periksa status login
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.checkLoginStatus();
    
    // Navigasi berdasarkan status login
    if (!mounted) return;
    
    if (authProvider.isLoggedIn) {
      print('User is logged in, navigating to home screen');
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      print('User is not logged in, navigating to login screen');
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo atau ikon aplikasi
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(70),
              ),
              child: Icon(
                Icons.directions_boat_rounded,
                size: 100,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(height: 32),
            
            // Nama aplikasi
            const Text(
              'Ferry Booking',
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            
            // Tagline aplikasi
            const Text(
              'Pesan Tiket Ferry dengan Mudah',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 64),
            
            // Loading indicator
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}