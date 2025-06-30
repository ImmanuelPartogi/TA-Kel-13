import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'dart:ui';
import 'dart:math' as math;

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _emailSent = false;
  bool _validEmail = false;
  bool _isHoveringSubmit = false;

  // Recovery method state
  String _recoveryMethod = 'email'; // 'email' or 'phone'
  final _phoneController = TextEditingController();

  // Animation controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _rotateAnimation;

  // Focus node
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _phoneFocus = FocusNode();

  // Scroll controllers for parallax effect
  final ScrollController _scrollController = ScrollController();
  double _scrollOffset = 0;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );

    _rotateAnimation = Tween<double>(begin: 0, end: 2 * math.pi).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic),
      ),
    );

    // Add email validation listener
    _emailController.addListener(_validateEmail);

    // Add scroll listener for parallax effect
    _scrollController.addListener(_updateScrollOffset);

    // Delay start of animation slightly for better UX
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });
  }

  void _updateScrollOffset() {
    setState(() {
      _scrollOffset = _scrollController.offset;
    });
  }

  void _validateEmail() {
    final email = _emailController.text.trim();
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    setState(() {
      _validEmail = email.isNotEmpty && regex.hasMatch(email);
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    _animationController.dispose();
    _emailFocus.dispose();
    _phoneFocus.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _forgotPassword() async {
    if (_formKey.currentState!.validate()) {
      final email = _emailController.text.trim();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.forgotPassword(email);

      if (success && mounted) {
        // Play transition animation to success view
        _animationController.reset();
        setState(() {
          _emailSent = true;
        });
        _animationController.forward();
      }
    }
  }

  // For phone verification (simulated)
  Future<void> _sendSmsCode() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      // Show loading
      authProvider.setLoading(true);

      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      // Success simulation
      authProvider.setLoading(false);

      if (mounted) {
        _animationController.reset();
        setState(() {
          _emailSent = true;
        });
        _animationController.forward();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(0),
        child: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),
      ),
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
            // Animated background elements
            Positioned(
              top: -50 + (_scrollOffset * 0.5),
              right: -50,
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Transform.scale(
                    scale: 1.0 + (_animationController.value * 0.1),
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: theme.primaryColor.withOpacity(0.1),
                      ),
                    ),
                  );
                },
              ),
            ),
            Positioned(
              bottom: -80 - (_scrollOffset * 0.3),
              left: -80,
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Transform.scale(
                    scale: 1.0 + (_animationController.value * 0.1),
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: theme.primaryColor.withOpacity(0.1),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Animated envelope icons in the background
            AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Stack(
                  children: [
                    Positioned(
                      top: size.height * 0.15 - (_scrollOffset * 0.4),
                      left: size.width * 0.1,
                      child: Opacity(
                        opacity: _animationController.value.clamp(0.0, 1.0),
                        child: Transform.rotate(
                          angle: math.sin(_animationController.value * 3) * 0.1,
                          child: Icon(
                            Icons.mail_outline_rounded,
                            size: 20,
                            color: theme.primaryColor.withOpacity(0.2),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: size.height * 0.3 - (_scrollOffset * 0.2),
                      right: size.width * 0.15,
                      child: Opacity(
                        opacity: _animationController.value,
                        child: Transform.rotate(
                          angle:
                              math.sin((_animationController.value + 0.4) * 3) *
                              0.1,
                          child: Icon(
                            Icons.email_outlined,
                            size: 22,
                            color: theme.primaryColor.withOpacity(0.1),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: size.height * 0.25 + (_scrollOffset * 0.3),
                      left: size.width * 0.2,
                      child: Opacity(
                        opacity: _animationController.value,
                        child: Transform.rotate(
                          angle:
                              math.sin((_animationController.value + 0.4) * 3) *
                              0.1,
                          child: Icon(
                            Icons.email_outlined,
                            size: 22,
                            color: theme.primaryColor.withOpacity(0.1),
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),

            // Main content
            SafeArea(
              child: NotificationListener<OverscrollIndicatorNotification>(
                onNotification: (overscroll) {
                  overscroll.disallowIndicator();
                  return true;
                },
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  controller: _scrollController,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 30.0),
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: Column(
                          children: [
                            const SizedBox(height: 20),

                            // Header with back button and mail icon
                            Row(
                              children: [
                                // Back button with animation
                                _buildAnimatedBackButton(theme),
                                const Spacer(),

                                // Icon with animation
                                _emailSent
                                    ? _buildCheckIconWithPulse(theme)
                                    : _buildMailIconWithAnimation(theme),
                              ],
                            ),

                            const SizedBox(height: 40),

                            // Title Text with 3D effect
                            Stack(
                              children: [
                                // Shadow layer
                                Positioned(
                                  left: 2,
                                  top: 2,
                                  child: Text(
                                    _emailSent
                                        ? 'Email Terkirim!'
                                        : 'Lupa Password?',
                                    style: theme.textTheme.headlineSmall
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black12,
                                          fontSize: 28,
                                        ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                                // Main text
                                ShaderMask(
                                  shaderCallback: (Rect bounds) {
                                    return LinearGradient(
                                      colors: [
                                        theme.primaryColor.withOpacity(0.8),
                                        theme.primaryColor,
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ).createShader(bounds);
                                  },
                                  child: Text(
                                    _emailSent
                                        ? 'Email Terkirim!'
                                        : 'Lupa Password?',
                                    style: theme.textTheme.headlineSmall
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                          fontSize: 28,
                                        ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 15),

                            // Subtitle
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 500),
                              child: Padding(
                                key: ValueKey<bool>(_emailSent),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                ),
                                child: Text(
                                  _emailSent
                                      ? 'Instruksi reset password telah dikirim. Silakan cek inbox atau folder spam Anda.'
                                      : 'Jangan khawatir! Kami akan membantu Anda untuk memulihkan akses akun Anda.',
                                  style: TextStyle(
                                    color: Colors.grey.shade700,
                                    fontSize: 15,
                                    height: 1.5,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),

                            const SizedBox(height: 30),

                            // Onboarding step indicator (only shown before email sent)
                            if (!_emailSent) _buildStepIndicator(),

                            const SizedBox(height: 20),

                            // Content (Form or Success)
                            _emailSent
                                ? _buildSuccessView(theme)
                                : _buildRequestForm(authProvider, theme),

                            const SizedBox(height: 30),

                            // Help section (only when not success)
                            if (!_emailSent) _buildHelpSection(theme),

                            const SizedBox(height: 50),
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

  Widget _buildAnimatedBackButton(ThemeData theme) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          Navigator.of(context).pop();
        },
        child: TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0, end: 1),
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeOutCubic,
          builder: (context, value, child) {
            return Transform.scale(
              scale: value,
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
            );
          },
        ),
      ),
    );
  }

  Widget _buildMailIconWithAnimation(ThemeData theme) {
    return AnimatedBuilder(
      animation: _rotateAnimation,
      builder: (context, child) {
        return Transform.rotate(
          angle: math.sin(_animationController.value * math.pi * 2) * 0.05,
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [theme.primaryColor.withBlue(255), theme.primaryColor],
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
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: 1),
              duration: const Duration(milliseconds: 1500),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: const Icon(
                    Icons.email_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                );
              },
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
                colors: [Colors.green.shade400, Colors.green.shade600],
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

  Widget _buildStepIndicator() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Step indicator
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildStepDot(1, true, 'Verifikasi'),
            _buildStepConnector(true),
            _buildStepDot(2, false, 'Kirim Kode'),
            _buildStepConnector(false),
            _buildStepDot(3, false, 'Reset'),
          ],
        ),
        const SizedBox(height: 5),
        // Step text
        Text(
          'Langkah 1: Verifikasi Identitas Anda',
          style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
        ),
      ],
    );
  }

  Widget _buildStepDot(int step, bool active, String label) {
    return Tooltip(
      message: label,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          color: active ? Theme.of(context).primaryColor : Colors.white,
          shape: BoxShape.circle,
          border: Border.all(
            color:
                active ? Theme.of(context).primaryColor : Colors.grey.shade300,
            width: 2,
          ),
          boxShadow:
              active
                  ? [
                    BoxShadow(
                      color: Theme.of(context).primaryColor.withOpacity(0.3),
                      blurRadius: 5,
                      offset: const Offset(0, 2),
                    ),
                  ]
                  : null,
        ),
        child: Center(
          child: Text(
            step.toString(),
            style: TextStyle(
              color: active ? Colors.white : Colors.grey.shade400,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepConnector(bool active) {
    return Container(
      width: 40,
      height: 2,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: active ? Theme.of(context).primaryColor : Colors.grey.shade300,
        borderRadius: BorderRadius.circular(1),
      ),
    );
  }

  Widget _buildRequestForm(AuthProvider authProvider, ThemeData theme) {
    return Container(
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
              // Recovery method tabs
              _buildRecoveryMethodTabs(theme),

              const SizedBox(height: 25),

              // Form fields based on recovery method
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 400),
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.1, 0),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child:
                    _recoveryMethod == 'email'
                        ? _buildEmailForm()
                        : _buildPhoneForm(),
              ),

              const SizedBox(height: 20),

              // Real-time validation indicator
              if (_recoveryMethod == 'email' &&
                  _emailController.text.isNotEmpty)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color:
                        _validEmail
                            ? Colors.green.shade50
                            : Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color:
                          _validEmail
                              ? Colors.green.shade200
                              : Colors.amber.shade200,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _validEmail
                            ? Icons.check_circle_outline
                            : Icons.info_outline,
                        size: 18,
                        color:
                            _validEmail
                                ? Colors.green.shade700
                                : Colors.amber.shade700,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _validEmail
                              ? 'Email valid'
                              : 'Email tidak valid. Periksa format email Anda.',
                          style: TextStyle(
                            fontSize: 12,
                            color:
                                _validEmail
                                    ? Colors.green.shade700
                                    : Colors.amber.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              // Submit Button
              MouseRegion(
                onEnter: (_) => setState(() => _isHoveringSubmit = true),
                onExit: (_) => setState(() => _isHoveringSubmit = false),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 55,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: theme.primaryColor.withOpacity(
                          _isHoveringSubmit ? 0.5 : 0.4,
                        ),
                        blurRadius: _isHoveringSubmit ? 20 : 15,
                        offset: const Offset(0, 8),
                        spreadRadius: -5,
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(20),
                    child: InkWell(
                      onTap:
                          authProvider.isLoading
                              ? null
                              : _recoveryMethod == 'email'
                              ? _forgotPassword
                              : _sendSmsCode,
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
                          child:
                              authProvider.isLoading
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
                                        _recoveryMethod == 'email'
                                            ? 'KIRIM'
                                            : 'KIRIM KODE SMS',
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 1,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      AnimatedContainer(
                                        duration: const Duration(
                                          milliseconds: 200,
                                        ),
                                        transform: Matrix4.translationValues(
                                          _isHoveringSubmit ? 5.0 : 0.0,
                                          0,
                                          0,
                                        ),
                                        child: Icon(
                                          _recoveryMethod == 'email'
                                              ? Icons.send_rounded
                                              : Icons.sms_rounded,
                                          color: Colors.white,
                                          size: 18,
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

              const SizedBox(height: 25),

              // Back to login with animation
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Ingat password Anda?',
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 15),
                  ),
                  const SizedBox(width: 4),
                  _buildAnimatedTextButton(
                    text: 'Masuk Sekarang',
                    onTap: () {
                      Navigator.pushReplacementNamed(context, '/login');
                    },
                  ),
                ],
              ),

              // Error Message
              if (authProvider.errorMessage != null)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.only(top: 25),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 15,
                  ),
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
                              'Gagal Mengirim',
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

  Widget _buildRecoveryMethodTabs(ThemeData theme) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          // Email tab
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _recoveryMethod = 'email';
                });
              },
              child: Container(
                decoration: BoxDecoration(
                  color:
                      _recoveryMethod == 'email'
                          ? theme.primaryColor
                          : Colors.transparent,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow:
                      _recoveryMethod == 'email'
                          ? [
                            BoxShadow(
                              color: theme.primaryColor.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ]
                          : null,
                ),
                child: Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.email_outlined,
                        size: 18,
                        color:
                            _recoveryMethod == 'email'
                                ? Colors.white
                                : Colors.grey.shade700,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Email',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color:
                              _recoveryMethod == 'email'
                                  ? Colors.white
                                  : Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Phone tab
          // Expanded(
          //   child: GestureDetector(
          //     onTap: () {
          //       setState(() {
          //         _recoveryMethod = 'phone';
          //       });
          //     },
          //     child: Container(
          //       decoration: BoxDecoration(
          //         color: _recoveryMethod == 'phone' ? theme.primaryColor : Colors.transparent,
          //         borderRadius: BorderRadius.circular(15),
          //         boxShadow: _recoveryMethod == 'phone' ? [
          //           BoxShadow(
          //             color: theme.primaryColor.withOpacity(0.3),
          //             blurRadius: 8,
          //             offset: const Offset(0, 3),
          //           ),
          //         ] : null,
          //       ),
          //       child: Center(
          //         child: Row(
          //           mainAxisSize: MainAxisSize.min,
          //           children: [
          //             Icon(
          //               Icons.smartphone_rounded,
          //               size: 18,
          //               color: _recoveryMethod == 'phone' ? Colors.white : Colors.grey.shade700,
          //             ),
          //             const SizedBox(width: 8),
          //             Text(
          //               'Telepon',
          //               style: TextStyle(
          //                 fontWeight: FontWeight.w600,
          //                 color: _recoveryMethod == 'phone' ? Colors.white : Colors.grey.shade700,
          //               ),
          //             ),
          //           ],
          //         ),
          //       ),
          //     ),
          //   ),
          // ),
        ],
      ),
    );
  }

  Widget _buildEmailForm() {
    return Column(
      key: const ValueKey('email-form'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Email Akun Anda',
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
            border: Border.all(color: Colors.grey.shade200, width: 1),
          ),
          child: TextFormField(
            controller: _emailController,
            focusNode: _emailFocus,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            onEditingComplete: () {
              FocusScope.of(context).unfocus();
              if (_formKey.currentState!.validate()) {
                _forgotPassword();
              }
            },
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: InputDecoration(
              hintText: 'Masukkan email akun Anda',
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
                  Icons.alternate_email_rounded,
                  color: Colors.grey.shade600,
                  size: 22,
                ),
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
                return 'Silakan masukkan email';
              }
              if (!RegExp(
                r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
              ).hasMatch(value)) {
                return 'Silakan masukkan email yang valid';
              }
              return null;
            },
          ),
        ),
        const SizedBox(height: 10),
        // Email suggestion hint
        Padding(
          padding: const EdgeInsets.only(left: 10),
          child: Row(
            children: [
              Icon(
                Icons.lightbulb_outline,
                size: 14,
                color: Colors.amber.shade600,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Pastikan email ini aktif dan dapat diakses',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPhoneForm() {
    return Column(
      key: const ValueKey('phone-form'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Nomor Telepon Terdaftar',
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
            border: Border.all(color: Colors.grey.shade200, width: 1),
          ),
          child: TextFormField(
            controller: _phoneController,
            focusNode: _phoneFocus,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.done,
            onEditingComplete: () {
              FocusScope.of(context).unfocus();
              if (_formKey.currentState!.validate()) {
                _sendSmsCode();
              }
            },
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            decoration: InputDecoration(
              hintText: 'Masukkan nomor telepon',
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 14,
                fontWeight: FontWeight.normal,
              ),
              prefixIcon: Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.transparent,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(16),
                    bottomLeft: Radius.circular(16),
                  ),
                ),
                child: Text(
                  '+62',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade700,
                  ),
                ),
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
                return 'Silakan masukkan nomor telepon';
              }
              if (!RegExp(r'^[0-9]{9,13}$').hasMatch(value)) {
                return 'Nomor telepon tidak valid';
              }
              return null;
            },
          ),
        ),
        const SizedBox(height: 10),
        // Phone suggestion hint
        Padding(
          padding: const EdgeInsets.only(left: 10),
          child: Row(
            children: [
              Icon(
                Icons.lightbulb_outline,
                size: 14,
                color: Colors.amber.shade600,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Masukkan nomor tanpa angka 0 di depan',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessView(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10),
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
        border: Border.all(color: Colors.green.shade100, width: 1),
      ),
      child: Column(
        children: [
          // Success animation with envelope
          Stack(
            alignment: Alignment.center,
            children: [
              // Outer circles
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: 1),
                duration: const Duration(milliseconds: 1000),
                builder: (context, value, child) {
                  return Opacity(
                    opacity: value,
                    child: Container(
                      width: 130,
                      height: 130,
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        shape: BoxShape.circle,
                      ),
                    ),
                  );
                },
              ),
              // Glow effect
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: 1),
                duration: const Duration(milliseconds: 1500),
                builder: (context, value, child) {
                  return Opacity(
                    opacity: (value * 0.7).clamp(0.0, 1.0),
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.green.shade100,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.shade200,
                            blurRadius: 20 * value,
                            spreadRadius: 5 * value,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              // Inner circle with icon
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0, end: 1),
                duration: const Duration(milliseconds: 800),
                curve: Curves.elasticOut,
                builder: (context, value, child) {
                  return Transform.scale(
                    scale: value,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.green.shade300,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.shade100,
                            blurRadius: 5,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Icon(
                          _recoveryMethod == 'email'
                              ? Icons.email_outlined
                              : Icons.sms_outlined,
                          size: 40,
                          color: Colors.green.shade600,
                        ),
                      ),
                    ),
                  );
                },
              ),
              // Floating check icon
              Positioned(
                bottom: 0,
                right: 20,
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0, end: 1),
                  duration: const Duration(milliseconds: 1200),
                  curve: Curves.elasticOut,
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.green.shade500,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.green.shade200,
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.check,
                            size: 25,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 25),

          // Email display with floating design
          Container(
            margin: const EdgeInsets.symmetric(vertical: 5),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade200,
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
              border: Border.all(color: Colors.green.shade200, width: 1),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _recoveryMethod == 'email'
                        ? Icons.alternate_email_rounded
                        : Icons.smartphone_rounded,
                    color: Colors.green.shade800,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _recoveryMethod == 'email'
                            ? 'Dikirim ke Email'
                            : 'Dikirim ke Nomor',
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontSize: 12,
                          fontWeight: FontWeight.w300,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _recoveryMethod == 'email'
                            ? _emailController.text.trim()
                            : '+62 ${_phoneController.text.trim()}',
                        style: TextStyle(
                          color: Colors.green.shade800,
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Animated instruction cards
          if (_recoveryMethod == 'email')
            _buildInstructionCard(
              icon: Icons.inbox_rounded,
              title: 'Periksa Inbox Anda',
              description:
                  'Kami telah mengirimkan email dengan instruksi untuk reset password.',
              delay: 300,
            ),

          const SizedBox(height: 15),

          _buildInstructionCard(
            icon:
                _recoveryMethod == 'email'
                    ? Icons.mark_email_unread_rounded
                    : Icons.sms_failed_rounded,
            title:
                _recoveryMethod == 'email'
                    ? 'Cek Folder Spam'
                    : 'Belum Menerima SMS?',
            description:
                _recoveryMethod == 'email'
                    ? 'Jika tidak menemukan email di inbox, periksa folder spam atau promosi.'
                    : 'Tunggu beberapa saat atau coba kirim ulang kode OTP jika diperlukan.',
            delay: 600,
          ),

          const SizedBox(height: 30),

          // Continue to reset button
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeOutBack,
            builder: (context, value, child) {
              return Transform.scale(
                scale: value,
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
                        Navigator.pushNamed(
                          context,
                          '/reset-password',
                          arguments: {
                            'email':
                                _recoveryMethod == 'email'
                                    ? _emailController.text.trim()
                                    : "",
                            'token': '',
                          },
                        );
                      },
                      splashColor: Colors.white.withOpacity(0.2),
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
                              const Text(
                                'LANJUT KE RESET PASSWORD',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 10),
                              const Icon(
                                Icons.arrow_forward_rounded,
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
              );
            },
          ),

          const SizedBox(height: 20),

          // Back to login button with floating effect
          TweenAnimationBuilder<double>(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 1000),
            curve: Curves.easeOutBack,
            builder: (context, value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, 20 * (1 - value)),
                  child: TextButton(
                    onPressed: () {
                      Navigator.pushReplacementNamed(context, '/login');
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.grey.shade700,
                      padding: const EdgeInsets.symmetric(
                        vertical: 10,
                        horizontal: 20,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.arrow_back_rounded, size: 16),
                        const SizedBox(width: 8),
                        const Text(
                          'KEMBALI KE LOGIN',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ],
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

  Widget _buildInstructionCard({
    required IconData icon,
    required String title,
    required String description,
    required int delay,
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 800 + delay),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Opacity(
          opacity: value.clamp(0.0, 1.0),
          child: Transform.translate(
            offset: Offset(40 * (1 - value), 0),
            child: Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: Colors.grey.shade200, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.shade100,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, size: 20, color: Colors.blue.shade700),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          description,
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade700,
                            height: 1.4,
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
      },
    );
  }

  Widget _buildHelpSection(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade100,
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.help_outline_rounded,
                color: theme.primaryColor,
                size: 20,
              ),
              const SizedBox(width: 10),
              Text(
                'Bantuan',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          _buildHelpItem(
            'Tidak menerima email?',
            'Periksa folder spam atau coba dengan email lain yang terdaftar.',
            Icons.mark_email_unread_rounded,
          ),
          _buildHelpItem(
            'Lupa email terdaftar?',
            'Hubungi kami melalui +62 812-6320-6428.',
            Icons.support_agent_rounded,
          ),
          // _buildHelpItem(
          //   'Masalah lainnya?',
          //   'Kunjungi Pusat Bantuan atau hubungi email support@ferryapp.com',
          //   Icons.info_outline_rounded,
          // ),
        ],
      ),
    );
  }

  Widget _buildHelpItem(String title, String description, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 2),
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 15, color: Colors.blue.shade700),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  description,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                ),
              ],
            ),
          ),
        ],
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
