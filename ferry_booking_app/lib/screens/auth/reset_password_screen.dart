import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'dart:ui';
import 'dart:math' as math;

class ResetPasswordScreen extends StatefulWidget {
  final String email;
  final String token;

  const ResetPasswordScreen({
    Key? key,
    required this.email,
    required this.token,
  }) : super(key: key);

  @override
  _ResetPasswordScreenState createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _tokenController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _resetSuccess = false;
  
  // Animation controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  // Password strength
  double _passwordStrength = 0.0;
  String _passwordStrengthText = "Belum ada password";
  Color _passwordStrengthColor = Colors.grey;
  
  // Focus nodes
  final FocusNode _tokenFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();
  final FocusNode _confirmPasswordFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _tokenController.text = widget.token;
    
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
    _tokenController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _animationController.dispose();
    _tokenFocus.dispose();
    _passwordFocus.dispose();
    _confirmPasswordFocus.dispose();
    super.dispose();
  }

  Future<void> _resetPassword() async {
    if (_formKey.currentState!.validate()) {
      final token = _tokenController.text.trim();
      final password = _passwordController.text.trim();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.resetPassword(
        widget.email,
        token,
        password,
      );

      if (success && mounted) {
        // Animasi keberhasilan
        _playSuccessAnimation();
      }
    }
  }
  
  void _playSuccessAnimation() {
    // Reset animation controller
    _animationController.reset();
    
    // Set reset success after animation completes
    setState(() {
      _resetSuccess = true;
    });
    
    // Start animation again for success view
    _animationController.forward();
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
                physics: const BouncingScrollPhysics(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 30.0),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        children: [
                          const SizedBox(height: 20),
                          
                          // Header with back button and lock icon
                          Row(
                            children: [
                              // Back button with animation
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context).pop();
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
                              
                              // Lock icon with animation
                              _resetSuccess
                                ? _buildCheckIconWithPulse(theme)
                                : _buildLockIconWithRotation(theme),
                            ],
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Title Text
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
                              _resetSuccess 
                                ? 'Reset Berhasil!' 
                                : 'Reset Password',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                fontSize: 28,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          
                          const SizedBox(height: 12),
                          
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Text(
                              _resetSuccess
                                ? 'Password Anda telah berhasil diubah. Silakan login dengan password baru Anda.'
                                : 'Buat password baru untuk akun email Anda',
                              style: TextStyle(
                                color: Colors.grey.shade700,
                                fontSize: 15,
                                height: 1.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          
                          const SizedBox(height: 20),
                          
                          // Email display
                          if (!_resetSuccess)
                            Container(
                              margin: const EdgeInsets.symmetric(vertical: 10),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                              decoration: BoxDecoration(
                                color: theme.primaryColor.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                  color: theme.primaryColor.withOpacity(0.2),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: theme.primaryColor.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.alternate_email_rounded,
                                      color: theme.primaryColor,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 15),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Email',
                                          style: TextStyle(
                                            color: Colors.grey.shade700,
                                            fontSize: 12,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          widget.email,
                                          style: TextStyle(
                                            color: Colors.black87,
                                            fontWeight: FontWeight.w600,
                                            fontSize: 15,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          
                          const SizedBox(height: 10),
                          
                          // Form or Success View
                          _resetSuccess 
                            ? _buildSuccessView(theme)
                            : _buildResetForm(authProvider, theme),
                          
                          const SizedBox(height: 30),
                        ],
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
  
  Widget _buildLockIconWithRotation(ThemeData theme) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: const Duration(seconds: 1),
      builder: (context, value, child) {
        return Transform.rotate(
          angle: math.sin(value * math.pi * 2) * 0.05,
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.primaryColor.withBlue(255),
                  theme.primaryColor,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: theme.primaryColor.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(
              Icons.lock_rounded,
              color: Colors.white,
              size: 22,
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildCheckIconWithPulse(ThemeData theme) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.8, end: 1.2),
      duration: const Duration(milliseconds: 1500),
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: value * 0.9, // Scale animation
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.green.shade400,
                  Colors.green.shade600,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: Colors.green.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Colors.white,
              size: 22,
            ),
          ),
        );
      },
    );
  }

  Widget _buildResetForm(AuthProvider authProvider, ThemeData theme) {
    return Container(
      margin: const EdgeInsets.only(top: 20),
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
      child: Padding(
        padding: const EdgeInsets.all(25),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Token Field (jika token belum ada)
              if (widget.token.isEmpty) ...[
                Text(
                  'Kode Reset',
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
                    controller: _tokenController,
                    focusNode: _tokenFocus,
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.next,
                    onEditingComplete: () {
                      FocusScope.of(context).requestFocus(_passwordFocus);
                    },
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 1.5, // Increased spacing for token
                    ),
                    decoration: InputDecoration(
                      hintText: 'Masukkan kode 6 digit dari email',
                      hintStyle: TextStyle(
                        color: Colors.grey.shade400,
                        fontSize: 14,
                        fontWeight: FontWeight.normal,
                      ),
                      prefixIcon: Icon(
                        Icons.vpn_key_rounded,
                        color: Colors.grey.shade600,
                        size: 22,
                      ),
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
                        return 'Silakan masukkan kode reset';
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(height: 25),
              ],
              
              // Password Field
              Text(
                'Password Baru',
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
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.next,
                  onEditingComplete: () {
                    FocusScope.of(context).requestFocus(_confirmPasswordFocus);
                  },
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Minimal 6 karakter',
                    hintStyle: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 14,
                      fontWeight: FontWeight.normal,
                    ),
                    prefixIcon: Icon(
                      Icons.lock_outline_rounded,
                      color: Colors.grey.shade600,
                      size: 22,
                    ),
                    suffixIcon: IconButton(
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
                    ),
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
                      return 'Silakan masukkan password baru';
                    }
                    if (value.length < 6) {
                      return 'Password minimal 6 karakter';
                    }
                    return null;
                  },
                ),
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
              Text(
                'Konfirmasi Password',
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
                  controller: _confirmPasswordController,
                  focusNode: _confirmPasswordFocus,
                  obscureText: _obscureConfirmPassword,
                  textInputAction: TextInputAction.done,
                  onEditingComplete: () {
                    FocusScope.of(context).unfocus();
                    if (_formKey.currentState!.validate()) {
                      _resetPassword();
                    }
                  },
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Ulangi password baru',
                    hintStyle: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 14,
                      fontWeight: FontWeight.normal,
                    ),
                    prefixIcon: Icon(
                      Icons.lock_outline_rounded,
                      color: Colors.grey.shade600,
                      size: 22,
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        color: Colors.grey.shade600,
                        size: 22,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
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
                      return 'Silakan konfirmasi password baru';
                    }
                    if (value != _passwordController.text) {
                      return 'Password tidak sama';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 30),
              
              // Reset Button
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
                    onTap: authProvider.isLoading ? null : _resetPassword,
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
                                  'RESET PASSWORD',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                const Icon(
                                  Icons.lock_reset_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ],
                            ),
                      ),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Error Message
              if (authProvider.errorMessage != null)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.only(top: 16),
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
                              'Reset Gagal',
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
    );
  }

  Widget _buildSuccessView(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.only(top: 30, bottom: 20),
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 10),
          ),
        ],
        border: Border.all(
          color: Colors.green.shade100,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Success animation
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 600),
            curve: Curves.elasticOut,
            builder: (context, value, child) {
              return Transform.scale(
                scale: value,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          shape: BoxShape.circle,
                        ),
                      ),
                      Icon(
                        Icons.check_rounded,
                        size: 50,
                        color: Colors.green.shade600,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          
          const SizedBox(height: 25),
          
          // Success title with animation
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, 20 * (1 - value)),
                  child: const Text(
                    'Password Berhasil Diubah!',
                    style: TextStyle(
                      fontSize: 20, 
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            },
          ),
          
          const SizedBox(height: 16),
          
          // Success description with animation
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 1000),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, 30 * (1 - value)),
                  child: Text(
                    'Sekarang Anda dapat login ke akun dengan password baru Anda.',
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey.shade700,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            },
          ),
          
          const SizedBox(height: 30),
          
          // Login button with animation
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 1200),
            curve: Curves.easeOutCubic,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, 40 * (1 - value)),
                  child: Container(
                    height: 55,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: theme.primaryColor.withOpacity(0.3),
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
                        onTap: () {
                          Navigator.pushReplacementNamed(context, '/login');
                        },
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
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'MASUK SEKARANG',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                const Icon(
                                  Icons.login_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}