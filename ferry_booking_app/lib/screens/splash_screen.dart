import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:flutter/services.dart';
import 'package:animated_text_kit/animated_text_kit.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
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
        statusBarIconBrightness: Brightness.dark, // Ubah menjadi dark agar sesuai dengan login
      ),
    );
    
    // Initialize animations
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
    
    _fadeInAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );
    
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
      ),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );
    
    // Start animation
    Future.delayed(const Duration(milliseconds: 100), () {
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
    // Give time for splash screen animation
    await Future.delayed(const Duration(seconds: 3));
    
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
          // Selaraskan gradien dengan login screen
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
            // Background elements - mirip dengan login screen
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),
            Positioned(
              bottom: -80,
              left: -80,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),
            
            // Small boat icons in the background - mirip dengan login screen
            Positioned(
              top: screenSize.height * 0.15,
              left: screenSize.width * 0.1,
              child: Icon(
                Icons.sailing_outlined,
                size: 20,
                color: theme.primaryColor.withOpacity(0.2),
              ),
            ),
            Positioned(
              top: screenSize.height * 0.3,
              right: screenSize.width * 0.15,
              child: Icon(
                Icons.directions_boat_outlined,
                size: 25,
                color: theme.primaryColor.withOpacity(0.15),
              ),
            ),
            Positioned(
              bottom: screenSize.height * 0.25,
              left: screenSize.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 22,
                color: theme.primaryColor.withOpacity(0.1),
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
                                // Shadow
                                Container(
                                  width: 140,
                                  height: 140,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(40),
                                    boxShadow: [
                                      BoxShadow(
                                        color: theme.primaryColor.withOpacity(0.5),
                                        blurRadius: 25,
                                        offset: const Offset(0, 10),
                                        spreadRadius: 0,
                                      ),
                                    ],
                                  ),
                                ),
                                // Main logo container
                                Container(
                                  width: 140,
                                  height: 140,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        theme.primaryColor.withBlue(245),
                                        theme.primaryColor,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(40),
                                  ),
                                  child: const Icon(
                                    Icons.directions_boat_rounded,
                                    size: 80,
                                    color: Colors.white,
                                  ),
                                ),
                                // Reflection effect
                                Positioned(
                                  top: 0,
                                  left: 0,
                                  child: Container(
                                    width: 80,
                                    height: 50,
                                    decoration: BoxDecoration(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(40),
                                        topRight: Radius.circular(40),
                                        bottomRight: Radius.circular(40),
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
                            
                            // Title dengan efek shader - selaraskan dengan login screen
                            ShaderMask(
                              shaderCallback: (Rect bounds) {
                                return LinearGradient(
                                  colors: [
                                    Colors.black.withOpacity(0.8),
                                    Colors.black,
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ).createShader(bounds);
                              },
                              child: Text(
                                'FERRY BOOKING',
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  fontSize: 28,
                                  letterSpacing: 1.5,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            
                            const SizedBox(height: 12),
                            
                            // Animated text - pakai gaya dari login screen
                            AnimatedTextKit(
                              animatedTexts: [
                                TypewriterAnimatedText(
                                  'Pesan Tiket Ferry dengan Mudah',
                                  textStyle: TextStyle(
                                    color: Colors.grey.shade700,
                                    fontSize: 15,
                                    height: 1.5,
                                  ),
                                  speed: const Duration(milliseconds: 100),
                                ),
                              ],
                              totalRepeatCount: 1,
                            ),
                            
                            const SizedBox(height: 50),
                            
                            // Loading indicator - gaya selaraskan dengan login
                            Container(
                              width: 55,
                              height: 55,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: theme.primaryColor.withOpacity(0.4),
                                    blurRadius: 15,
                                    offset: const Offset(0, 8),
                                    spreadRadius: -5,
                                  ),
                                ],
                              ),
                              child: Material(
                                color: Colors.transparent,
                                borderRadius: BorderRadius.circular(20),
                                child: Ink(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        theme.primaryColor.withBlue(255),
                                        theme.primaryColor,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Container(
                                    alignment: Alignment.center,
                                    constraints: const BoxConstraints(minHeight: 55),
                                    child: const SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            
                            const SizedBox(height: 30),
                            
                            // Version information
                            Text(
                              "v1.0.0",
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade700,
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