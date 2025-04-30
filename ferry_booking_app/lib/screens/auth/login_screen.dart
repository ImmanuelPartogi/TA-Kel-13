import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:ui';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = false;
  
  // Animation controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  // Focus nodes for better field navigation
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );
    
    // Delay start of animation slightly for better UX
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _animationController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();

      try {
        // Get device ID from shared preferences
        final prefs = await SharedPreferences.getInstance();
        final deviceId = prefs.getString('device_id') ?? '';
        
        // Save remember me preference
        if (_rememberMe) {
          await prefs.setString('remembered_email', email);
        } else {
          await prefs.remove('remembered_email');
        }

        // Ensure device ID is a valid string before passing it
        final String safeDeviceId = deviceId.isNotEmpty ? deviceId : '';

        print(
          'Attempting login with email: $email and deviceId: $safeDeviceId',
        );

        // Login with device ID
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final success = await authProvider.login(email, password, safeDeviceId);

        // Navigate to home page if login successful
        if (success && mounted) {
          // Tambahkan animasi sebelum navigasi
          await _showSuccessAnimation();
          print('Login successful, navigating to home screen');
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          print('Login failed');
        }
      } catch (e) {
        print('Error during login process: $e');
        // Error handled by provider
      }
    }
  }
  
  Future<void> _showSuccessAnimation() async {
    // Implementasi animasi sukses sederhana
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.white),
            SizedBox(width: 10),
            Text('Login berhasil!'),
          ],
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
    
    // Berikan delay sebelum navigasi
    return await Future.delayed(const Duration(milliseconds: 1200));
  }
  
  Future<void> _loadSavedEmail() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rememberedEmail = prefs.getString('remembered_email');
      
      if (rememberedEmail != null && rememberedEmail.isNotEmpty) {
        setState(() {
          _emailController.text = rememberedEmail;
          _rememberMe = true;
        });
      }
    } catch (e) {
      print('Error loading saved email: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);
    
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
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
            
            // Small boat icons in the background
            Positioned(
              top: size.height * 0.15,
              left: size.width * 0.1,
              child: Icon(
                Icons.sailing_outlined,
                size: 20,
                color: theme.primaryColor.withOpacity(0.2),
              ),
            ),
            Positioned(
              top: size.height * 0.3,
              right: size.width * 0.15,
              child: Icon(
                Icons.directions_boat_outlined,
                size: 25,
                color: theme.primaryColor.withOpacity(0.15),
              ),
            ),
            Positioned(
              bottom: size.height * 0.25,
              left: size.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 22,
                color: theme.primaryColor.withOpacity(0.1),
              ),
            ),
            
            // Main content
            SafeArea(
              child: SingleChildScrollView(
                child: Container(
                  height: size.height - MediaQuery.of(context).padding.top,
                  padding: const EdgeInsets.symmetric(horizontal: 30.0),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            const SizedBox(height: 60),
                            
                            // App Logo with reflection effect
                            Stack(
                              alignment: Alignment.center,
                              children: [
                                // Shadow
                                Container(
                                  width: 120,
                                  height: 120,
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
                                  width: 120,
                                  height: 120,
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
                                    size: 70,
                                    color: Colors.white,
                                  ),
                                ),
                                // Reflection effect
                                Positioned(
                                  top: 0,
                                  left: 0,
                                  child: Container(
                                    width: 70,
                                    height: 40,
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
                            
                            // Welcome Text with shadow
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
                                'Selamat Datang Kembali',
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  fontSize: 28,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            
                            const SizedBox(height: 12),
                            
                            Text(
                              'Silakan masuk untuk melanjutkan perjalanan Anda',
                              style: TextStyle(
                                color: Colors.grey.shade700,
                                fontSize: 15,
                                height: 1.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            
                            const SizedBox(height: 50),

                            // Form dengan border card
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.03),
                                    blurRadius: 15,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(25),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Email Field
                                  _buildAnimatedTextField(
                                    controller: _emailController,
                                    focusNode: _emailFocus,
                                    icon: Icons.alternate_email_rounded,
                                    label: 'Email',
                                    hintText: 'Masukkan email Anda',
                                    isEmail: true,
                                    nextFocus: _passwordFocus,
                                  ),
                                  const SizedBox(height: 20),

                                  // Password Field
                                  _buildAnimatedTextField(
                                    controller: _passwordController,
                                    focusNode: _passwordFocus,
                                    icon: Icons.lock_outline_rounded,
                                    label: 'Password',
                                    hintText: 'Masukkan password Anda',
                                    isPassword: true,
                                  ),
                                  
                                  const SizedBox(height: 5),
                                  
                                  // Remember me and Forgot Password row
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      // Remember me checkbox
                                      Row(
                                        children: [
                                          SizedBox(
                                            width: 24,
                                            height: 24,
                                            child: Checkbox(
                                              value: _rememberMe,
                                              onChanged: (value) {
                                                setState(() {
                                                  _rememberMe = value ?? false;
                                                });
                                              },
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              activeColor: theme.primaryColor,
                                              side: BorderSide(
                                                color: Colors.grey.shade400,
                                                width: 1.5,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          GestureDetector(
                                            onTap: () {
                                              setState(() {
                                                _rememberMe = !_rememberMe;
                                              });
                                            },
                                            child: Text(
                                              'Ingat Saya',
                                              style: TextStyle(
                                                color: Colors.grey.shade700,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      
                                      // Forgot Password Link with animated underline
                                      _buildAnimatedTextButton(
                                        text: 'Lupa Password?',
                                        onTap: () {
                                          Navigator.pushNamed(context, '/forgot-password');
                                        },
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: 40),

                            // Login Button dengan efek press
                            Container(
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
                                child: InkWell(
                                  onTap: authProvider.isLoading ? null : _login,
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
                                      child: authProvider.isLoading
                                        ? const SizedBox(
                                            height: 24,
                                            width: 24,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2.5,
                                              color: Colors.white,
                                            ),
                                          )
                                        : Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Text(
                                                'MASUK',
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  letterSpacing: 1.2,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ],
                                          ),
                                    ),
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 30),

                            // Pilihan login sosmed
                            // Column(
                            //   children: [
                            //     Row(
                            //       children: [
                            //         Expanded(
                            //           child: Divider(
                            //             color: Colors.grey.shade300,
                            //             thickness: 1,
                            //           ),
                            //         ),
                            //         Padding(
                            //           padding: const EdgeInsets.symmetric(horizontal: 15),
                            //           child: Text(
                            //             'atau masuk dengan',
                            //             style: TextStyle(
                            //               color: Colors.grey.shade600,
                            //               fontSize: 14,
                            //             ),
                            //           ),
                            //         ),
                            //         Expanded(
                            //           child: Divider(
                            //             color: Colors.grey.shade300,
                            //             thickness: 1,
                            //           ),
                            //         ),
                            //       ],
                            //     ),
                            //     const SizedBox(height: 20),
                            //     Row(
                            //       mainAxisAlignment: MainAxisAlignment.center,
                            //       children: [
                            //         _buildSocialLoginButton(
                            //           icon: Icons.g_mobiledata_rounded,
                            //           backgroundColor: Colors.white,
                            //           iconColor: Colors.red,
                            //         ),
                            //         const SizedBox(width: 20),
                            //         _buildSocialLoginButton(
                            //           icon: Icons.facebook_rounded,
                            //           backgroundColor: Colors.white,
                            //           iconColor: Colors.blue.shade800,
                            //         ),
                            //         const SizedBox(width: 20),
                            //         _buildSocialLoginButton(
                            //           icon: Icons.apple_rounded,
                            //           backgroundColor: Colors.white,
                            //           iconColor: Colors.black,
                            //         ),
                            //       ],
                            //     ),
                            //   ],
                            // ),

                            const Spacer(),

                            // Register Link dengan underline animasi
                            Container(
                              margin: const EdgeInsets.only(bottom: 30),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Belum punya akun?',
                                    style: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  _buildAnimatedTextButton(
                                    text: 'Daftar Sekarang',
                                    onTap: () {
                                      Navigator.pushReplacementNamed(context, '/register');
                                    },
                                  ),
                                ],
                              ),
                            ),

                            // Error Message
                            if (authProvider.errorMessage != null)
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                margin: const EdgeInsets.only(bottom: 24),
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(15),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.red.withOpacity(0.1),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                  border: Border.all(
                                    color: theme.colorScheme.error.withOpacity(0.5),
                                    width: 1.5,
                                  ),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.error.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Icon(
                                        Icons.error_outline_rounded,
                                        color: theme.colorScheme.error,
                                        size: 22,
                                      ),
                                    ),
                                    const SizedBox(width: 15),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Login Gagal',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: Colors.black87,
                                              fontSize: 15,
                                            ),
                                          ),
                                          const SizedBox(height: 5),
                                          Text(
                                            authProvider.errorMessage!,
                                            style: TextStyle(
                                              color: Colors.black87,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnimatedTextField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required IconData icon,
    required String label,
    required String hintText,
    bool isPassword = false,
    bool isEmail = false,
    FocusNode? nextFocus,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
              width: 1,
            ),
          ),
          child: TextFormField(
            controller: controller,
            focusNode: focusNode,
            obscureText: isPassword ? _obscurePassword : false,
            keyboardType: isEmail ? TextInputType.emailAddress : TextInputType.text,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            onEditingComplete: () {
              if (nextFocus != null) {
                FocusScope.of(context).requestFocus(nextFocus);
              } else {
                FocusScope.of(context).unfocus();
              }
            },
            textInputAction: nextFocus != null ? TextInputAction.next : TextInputAction.done,
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 14,
                fontWeight: FontWeight.normal,
              ),
              prefixIcon: Container(
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    bottomLeft: Radius.circular(16),
                  ),
                ),
                child: Icon(
                  icon,
                  color: Colors.grey.shade600,
                  size: 22,
                ),
              ),
              suffixIcon: isPassword
                  ? IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        color: Colors.grey.shade600,
                        size: 22,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                vertical: 16,
                horizontal: 20,
              ),
              filled: true,
              fillColor: Colors.transparent,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Silakan masukkan ${isPassword ? 'password' : 'email'}';
              }
              if (isEmail && !RegExp(
                r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
              ).hasMatch(value)) {
                return 'Silakan masukkan email yang valid';
              }
              if (isPassword && value.length < 6) {
                return 'Password minimal 6 karakter';
              }
              return null;
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildSocialLoginButton({
    required IconData icon,
    required Color backgroundColor,
    required Color iconColor,
  }) {
    return Container(
      width: 55,
      height: 55,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () {},
          borderRadius: BorderRadius.circular(16),
          child: Icon(
            icon,
            color: iconColor,
            size: 32,
          ),
        ),
      ),
    );
  }
  
  Widget _buildAnimatedTextButton({
    required String text,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              style: TextStyle(
                color: Theme.of(context).primaryColor,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 2,
              width: text.length * 6.5,
              margin: const EdgeInsets.only(top: 3),
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ],
        ),
      ),
    );
  }
}