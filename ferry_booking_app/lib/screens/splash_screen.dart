import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:flutter/services.dart';
import 'package:animated_text_kit/animated_text_kit.dart';

// Custom painter untuk animasi gelombang
class WavePainter extends CustomPainter {
  final double animationValue;
  final Color color;

  WavePainter({required this.animationValue, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..color = color
          ..style = PaintingStyle.fill;

    final path = Path();

    // Animasi lebih lambat dengan pembagian nilai animasi
    final slowedAnimation = animationValue / 2; // Memperlambat animasi
    final y = size.height * (0.5 + 0.25 * sin(slowedAnimation * 2 * 3.14159));

    path.moveTo(0, size.height);
    path.lineTo(0, y);

    // Draw wave dengan amplitudo lebih besar dan frekuensi lebih rendah
    for (double i = 0; i <= size.width; i++) {
      path.lineTo(
        i,
        y +
            12 *
                sin(
                  (i / size.width) * 3 * 3.14159 + slowedAnimation * 8,
                ), // Amplitudo lebih besar, frekuensi lebih rendah
      );
    }

    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => true;
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeInAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    // Set status bar to transparent
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
    );

    // Initialize animations dengan durasi yang lebih panjang
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 5000),
    );

    _fadeInAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.05),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic),
      ),
    );

    // Start animation dengan delay yang lebih lama
    Future.delayed(const Duration(milliseconds: 400), () {
      _animationController.forward();
    });

    // Initialize app and handle navigation
    _initializeApp();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    // Perpanjang durasi splash screen menjadi 3 detik
    await Future.delayed(const Duration(milliseconds: 2000));

    if (!mounted) return;

    // Check login status
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.checkLoginStatus();

    // Navigate based on login status
    if (!mounted) return;

    if (authProvider.isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get screen dimensions for responsive design
    final screenSize = MediaQuery.of(context).size;
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          // Gradient background
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Colors.white,
              Colors.blue.shade50,
              Colors.blue.shade100.withOpacity(0.4),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Background elements
            Positioned(
              top: -60,
              right: -60,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.07),
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              left: -100,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.07),
                ),
              ),
            ),

            // Small boat icons in the background with animation
            AnimatedPositioned(
              duration: const Duration(milliseconds: 6000),
              curve: Curves.easeInOut,
              top: screenSize.height * 0.12,
              left: screenSize.width * 0.1,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 2000),
                opacity: _fadeInAnimation.value * 0.7,
                child: Icon(
                  Icons.sailing_outlined,
                  size: 22,
                  color: theme.primaryColor.withOpacity(0.2),
                ),
              ),
            ),
            AnimatedPositioned(
              duration: const Duration(milliseconds: 8000),
              curve: Curves.easeInOut,
              top: screenSize.height * 0.3,
              right: screenSize.width * 0.15,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 2000),
                opacity: _fadeInAnimation.value * 0.7,
                child: Icon(
                  Icons.directions_boat_outlined,
                  size: 28,
                  color: theme.primaryColor.withOpacity(0.15),
                ),
              ),
            ),
            AnimatedPositioned(
              duration: const Duration(milliseconds: 7000),
              curve: Curves.easeInOut,
              bottom: screenSize.height * 0.25,
              left: screenSize.width * 0.2,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 2000),
                opacity: _fadeInAnimation.value * 0.7,
                child: Icon(
                  Icons.directions_boat_filled_outlined,
                  size: 24,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),

            // Main content with animation
            AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Center(
                  child: FadeTransition(
                    opacity: _fadeInAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: ScaleTransition(
                        scale: _scaleAnimation,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Logo dengan efek - selaraskan dengan login screen
                            Stack(
                              alignment: Alignment.center,
                              children: [
                                // Outer glow
                                Container(
                                  width: 160,
                                  height: 160,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(48),
                                    boxShadow: [
                                      BoxShadow(
                                        color: theme.primaryColor.withOpacity(
                                          0.2,
                                        ),
                                        blurRadius: 40,
                                        spreadRadius: 10,
                                      ),
                                    ],
                                  ),
                                ),
                                // Shadow
                                Container(
                                  width: 150,
                                  height: 150,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(45),
                                    boxShadow: [
                                      BoxShadow(
                                        color: theme.primaryColor.withOpacity(
                                          0.5,
                                        ),
                                        blurRadius: 25,
                                        offset: const Offset(0, 10),
                                        spreadRadius: 0,
                                      ),
                                    ],
                                  ),
                                ),
                                // Main logo container
                                Container(
                                  width: 150,
                                  height: 150,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        theme.primaryColor.withBlue(245),
                                        theme.primaryColor,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(45),
                                  ),
                                  child: const Center(),
                                ),
                                // Overlay design
                                Positioned(
                                  top: 0,
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(45),
                                    child: Stack(
                                      children: [
                                        // Background wave
                                        Positioned(
                                          bottom: -5,
                                          left: -10,
                                          right: -10,
                                          child: Container(
                                            height: 60,
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(
                                                0.1,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                            ),
                                          ),
                                        ),
                                        // Icon
                                        const Center(
                                          child: Icon(
                                            Icons.directions_boat_rounded,
                                            size: 80,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                // Reflection effect
                                Positioned(
                                  top: 0,
                                  left: 0,
                                  child: Container(
                                    width: 90,
                                    height: 55,
                                    decoration: BoxDecoration(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(45),
                                        topRight: Radius.circular(45),
                                        bottomRight: Radius.circular(45),
                                      ),
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.white.withOpacity(0.5),
                                          Colors.white.withOpacity(0.1),
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 40),

                            // Title dengan efek shader
                            ShaderMask(
                              shaderCallback: (Rect bounds) {
                                return LinearGradient(
                                  colors: [
                                    theme.primaryColor.withOpacity(0.9),
                                    theme.primaryColor.withOpacity(1.0),
                                  ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ).createShader(bounds);
                              },
                              child: Text(
                                'FERRY TICKET',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  fontSize: 32,
                                  letterSpacing: 2.0,
                                  height: 1.2,
                                  shadows: [
                                    Shadow(
                                      color: Colors.black26,
                                      offset: Offset(0, 3),
                                      blurRadius: 5,
                                    ),
                                  ],
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),

                            const SizedBox(height: 12),

                            // Menggunakan SizedBox dengan tinggi tetap untuk area AnimatedTextKit
                            SizedBox(
                              height: 30, // Tinggi tetap untuk menghindari perubahan layout
                              child: AnimatedTextKit(
                                animatedTexts: [
                                  FadeAnimatedText(
                                    'Perjalanan Jadi Lebih Mudah',
                                    textStyle: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontSize: 15,
                                      height: 1.5,
                                    ),
                                    duration: const Duration(milliseconds: 2000),
                                    fadeOutBegin: 0.8,
                                    fadeInEnd: 0.2,
                                  ),
                                  FadeAnimatedText(
                                    'Pesan Tiket Kapanpun, Dimanapun',
                                    textStyle: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontSize: 15,
                                      height: 1.5,
                                    ),
                                    duration: const Duration(milliseconds: 2000),
                                    fadeOutBegin: 0.8,
                                    fadeInEnd: 0.2,
                                  ),
                                  FadeAnimatedText(
                                    'Solusi Terbaik Perjalanan Anda',
                                    textStyle: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontSize: 15,
                                      height: 1.5,
                                    ),
                                    duration: const Duration(milliseconds: 2000),
                                    fadeOutBegin: 0.8,
                                    fadeInEnd: 0.2,
                                  ),
                                ],
                                repeatForever: true,
                                displayFullTextOnTap: false, // Mencegah perubahan ukuran saat tap
                                stopPauseOnTap: false, // Mencegah perubahan perilaku saat tap
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}