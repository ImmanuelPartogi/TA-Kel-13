import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'dart:ui';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  
  // Animation controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  // Fokus nodes untuk animasi dan interaksi
  final FocusNode _nameFocus = FocusNode();
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _phoneFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();
  final FocusNode _confirmPasswordFocus = FocusNode();
  
  // Password strength
  double _passwordStrength = 0.0;
  String _passwordStrengthText = "Belum ada password";
  Color _passwordStrengthColor = Colors.grey;

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
    
    // Tambahkan listener untuk password strength
    _passwordController.addListener(_checkPasswordStrength);
    
    // Delay start of animation slightly for better UX
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });
  }

  void _checkPasswordStrength() {
    String password = _passwordController.text;
    double strength = 0;
    String description = "";
    
    if (password.isEmpty) {
      strength = 0;
      description = "Belum ada password";
      _passwordStrengthColor = Colors.grey;
    } else if (password.length < 6) {
      strength = 0.2;
      description = "Terlalu pendek";
      _passwordStrengthColor = Colors.red;
    } else {
      if (password.length >= 8) strength += 0.2;
      if (RegExp(r'[A-Z]').hasMatch(password)) strength += 0.2;
      if (RegExp(r'[a-z]').hasMatch(password)) strength += 0.2;
      if (RegExp(r'[0-9]').hasMatch(password)) strength += 0.2;
      if (RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password)) strength += 0.2;
      
      if (strength <= 0.4) {
        description = "Lemah";
        _passwordStrengthColor = Colors.red;
      } else if (strength <= 0.7) {
        description = "Sedang";
        _passwordStrengthColor = Colors.orange;
      } else {
        description = "Kuat";
        _passwordStrengthColor = Colors.green;
      }
    }
    
    setState(() {
      _passwordStrength = strength;
      _passwordStrengthText = description;
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _animationController.dispose();
    
    // Dispose focus nodes
    _nameFocus.dispose();
    _emailFocus.dispose();
    _phoneFocus.dispose();
    _passwordFocus.dispose();
    _confirmPasswordFocus.dispose();
    
    super.dispose();
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      final name = _nameController.text.trim();
      final email = _emailController.text.trim();
      final phone = _phoneController.text.trim();
      final password = _passwordController.text.trim();

      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.register(name, email, phone, password);

      if (success && mounted) {
        // Tambahkan animasi sebelum navigasi
        await _showSuccessAnimation();
        Navigator.pushReplacementNamed(context, '/home');
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
            Text('Registrasi berhasil!'),
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

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    
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
            
            // Main content
            SafeArea(
              child: SingleChildScrollView(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 30.0),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const SizedBox(height: 20),

                            // Header with back button and logo
                            Row(
                              children: [
                                // Back button with animation
                                GestureDetector(
                                  onTap: () {
                                    Navigator.pushReplacementNamed(context, '/login');
                                  },
                                  child: MouseRegion(
                                    cursor: SystemMouseCursors.click,
                                    child: Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(16),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withOpacity(0.05),
                                            blurRadius: 10,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: Icon(
                                        Icons.arrow_back_ios_new_rounded,
                                        color: theme.primaryColor,
                                        size: 16,
                                      ),
                                    ),
                                  ),
                                ),
                                const Spacer(),
                                
                                // App Logo with reflection effect
                                Stack(
                                  children: [
                                    // Shadow
                                    Container(
                                      width: 50,
                                      height: 50,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(18),
                                        boxShadow: [
                                          BoxShadow(
                                            color: theme.primaryColor.withOpacity(0.5),
                                            blurRadius: 15,
                                            offset: const Offset(0, 8),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Main logo container
                                    Container(
                                      width: 50,
                                      height: 50,
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            theme.primaryColor,
                                            theme.primaryColor.withBlue(245),
                                          ],
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                        ),
                                        borderRadius: BorderRadius.circular(18),
                                      ),
                                      child: const Icon(
                                        Icons.directions_boat_rounded,
                                        size: 28,
                                        color: Colors.white,
                                      ),
                                    ),
                                    // Reflection effect
                                    Positioned(
                                      top: 0,
                                      left: 0,
                                      child: Container(
                                        width: 30,
                                        height: 15,
                                        decoration: BoxDecoration(
                                          borderRadius: const BorderRadius.only(
                                            topLeft: Radius.circular(18),
                                            topRight: Radius.circular(18),
                                            bottomRight: Radius.circular(18),
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
                                'Buat Akun Baru',
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  fontSize: 28,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            
                            Text(
                              'Bergabunglah dengan kami dan nikmati perjalanan kapal yang menyenangkan',
                              style: TextStyle(
                                color: Colors.grey.shade700,
                                fontSize: 15,
                                height: 1.5,
                              ),
                            ),
                            
                            const SizedBox(height: 40),

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
                                  Text(
                                    'Informasi Pribadi',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  
                                  // Nama Field
                                  _buildAnimatedTextField(
                                    controller: _nameController,
                                    focusNode: _nameFocus,
                                    icon: Icons.person_outline_rounded,
                                    label: 'Nama Lengkap',
                                    hintText: 'Masukkan nama lengkap Anda',
                                    nextFocus: _emailFocus,
                                  ),
                                  const SizedBox(height: 20),
                                  
                                  // Email Field
                                  _buildAnimatedTextField(
                                    controller: _emailController,
                                    focusNode: _emailFocus,
                                    icon: Icons.alternate_email_rounded,
                                    label: 'Email',
                                    hintText: 'Masukkan email aktif Anda',
                                    isEmail: true,
                                    nextFocus: _phoneFocus,
                                  ),
                                  const SizedBox(height: 20),
                                  
                                  // Phone Field
                                  _buildAnimatedTextField(
                                    controller: _phoneController,
                                    focusNode: _phoneFocus,
                                    icon: Icons.smartphone_rounded,
                                    label: 'Nomor Telepon',
                                    hintText: 'Masukkan nomor telepon Anda',
                                    isPhone: true,
                                    nextFocus: _passwordFocus,
                                  ),
                                  
                                  const SizedBox(height: 30),
                                  
                                  Text(
                                    'Keamanan Akun',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  
                                  // Password Field
                                  _buildAnimatedTextField(
                                    controller: _passwordController,
                                    focusNode: _passwordFocus,
                                    icon: Icons.lock_outline_rounded,
                                    label: 'Password',
                                    hintText: 'Minimal 6 karakter',
                                    isPassword: true,
                                    nextFocus: _confirmPasswordFocus,
                                  ),
                                  
                                  // Password strength indicator
                                  if (_passwordController.text.isNotEmpty)
                                    Container(
                                      margin: const EdgeInsets.only(top: 8, left: 12, right: 12),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                'Kekuatan Password: $_passwordStrengthText',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: _passwordStrengthColor,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              Text(
                                                '${(_passwordStrength * 100).toInt()}%',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey.shade600,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                          LinearProgressIndicator(
                                            value: _passwordStrength,
                                            backgroundColor: Colors.grey.shade200,
                                            valueColor: AlwaysStoppedAnimation<Color>(_passwordStrengthColor),
                                            borderRadius: BorderRadius.circular(10),
                                            minHeight: 4,
                                          ),
                                          const SizedBox(height: 4),
                                          if (_passwordStrength < 0.8)
                                            Text(
                                              'Tip: Kombinasikan huruf besar, kecil, angka dan simbol',
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: Colors.grey.shade600,
                                                fontStyle: FontStyle.italic,
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                    
                                  const SizedBox(height: 20),
                                  
                                  // Confirm Password Field
                                  _buildAnimatedTextField(
                                    controller: _confirmPasswordController,
                                    focusNode: _confirmPasswordFocus,
                                    icon: Icons.lock_outline_rounded,
                                    label: 'Konfirmasi Password',
                                    hintText: 'Ulangi password Anda',
                                    isPassword: true,
                                    isConfirmPassword: true,
                                  ),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: 40),

                            // Register Button dengan efek press
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
                                  onTap: authProvider.isLoading ? null : _register,
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
                                                'DAFTAR SEKARANG',
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

                            // // Pilihan login sosmed
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
                            //             'atau daftar dengan',
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

                            const SizedBox(height: 30),

                            // Login Link dengan underline animasi
                            Center(
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Sudah punya akun?',
                                    style: TextStyle(
                                      color: Colors.grey.shade700,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  _buildAnimatedTextButton(
                                    text: 'Masuk',
                                    onTap: () {
                                      Navigator.pushReplacementNamed(context, '/login');
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),

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
                                            'Pendaftaran Gagal',
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
                              
                            const SizedBox(height: 30),
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
    bool isPhone = false,
    bool isConfirmPassword = false,
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
            obscureText: isPassword 
                ? (isConfirmPassword ? _obscureConfirmPassword : _obscurePassword) 
                : false,
            keyboardType: isEmail 
                ? TextInputType.emailAddress 
                : isPhone 
                    ? TextInputType.phone 
                    : TextInputType.text,
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
                        isConfirmPassword
                            ? (_obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined)
                            : (_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                        color: Colors.grey.shade600,
                        size: 22,
                      ),
                      onPressed: () {
                        setState(() {
                          if (isConfirmPassword) {
                            _obscureConfirmPassword = !_obscureConfirmPassword;
                          } else {
                            _obscurePassword = !_obscurePassword;
                          }
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
                return 'Silakan masukkan ${label.toLowerCase()}';
              }
              
              if (isEmail && !RegExp(
                r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
              ).hasMatch(value)) {
                return 'Silakan masukkan email yang valid';
              }
              
              if (isPhone && !RegExp(r'^(0|\+62)[0-9]{8,13}$').hasMatch(value)) {
                return 'Nomor telepon tidak valid';
              }
              
              if (isPassword && !isConfirmPassword && value.length < 6) {
                return 'Password minimal 6 karakter';
              }
              
              if (isConfirmPassword && value != _passwordController.text) {
                return 'Password tidak sama';
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
                fontSize: 15,
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 2,
              width: text.length * 7.0,
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