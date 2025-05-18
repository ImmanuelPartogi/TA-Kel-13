import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  
  // Fokus nodes untuk navigasi antar field
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
    // Tambahkan listener untuk password strength
    _passwordController.addListener(_checkPasswordStrength);
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
        _showSimpleSuccessMessage();
        Navigator.pushReplacementNamed(context, '/home');
      }
    }
  }
  
  void _showSimpleSuccessMessage() {
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
            // Elemen background (disederhanakan)
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
            
            // Konten utama
            SafeArea(
              child: SingleChildScrollView(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 30.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 20),

                        // Header dengan tombol kembali dan logo
                        Row(
                          children: [
                            // Tombol kembali (disederhanakan)
                            InkWell(
                              onTap: () {
                                Navigator.pushReplacementNamed(context, '/login');
                              },
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 5,
                                      offset: const Offset(0, 2),
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
                            const Spacer(),
                            
                            // Logo app (disederhanakan)
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: theme.primaryColor,
                                borderRadius: BorderRadius.circular(18),
                                boxShadow: [
                                  BoxShadow(
                                    color: theme.primaryColor.withOpacity(0.3),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.directions_boat_rounded,
                                size: 28,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Teks Welcome (disederhanakan)
                        Text(
                          'Buat Akun Baru',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            fontSize: 28,
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

                        // Form dengan border card (disederhanakan)
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
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
                              _buildTextField(
                                controller: _nameController,
                                focusNode: _nameFocus,
                                icon: Icons.person_outline_rounded,
                                label: 'Nama Lengkap',
                                hintText: 'Masukkan nama lengkap Anda',
                                nextFocus: _emailFocus,
                              ),
                              const SizedBox(height: 20),
                              
                              // Email Field
                              _buildTextField(
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
                              _buildTextField(
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
                              _buildTextField(
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
                              _buildTextField(
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

                        // Register Button (disederhanakan)
                        ElevatedButton(
                          onPressed: authProvider.isLoading ? null : _register,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.primaryColor,
                            foregroundColor: Colors.white,
                            minimumSize: const Size(double.infinity, 55),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            elevation: 3,
                          ),
                          child: authProvider.isLoading
                            ? const SizedBox(
                                height: 24,
                                width: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                'DAFTAR SEKARANG',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.2,
                                ),
                              ),
                        ),

                        const SizedBox(height: 30),

                        // Login Link (disederhanakan)
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
                              const SizedBox(width: 8),
                              GestureDetector(
                                onTap: () {
                                  Navigator.pushReplacementNamed(context, '/login');
                                },
                                child: Text(
                                  'Masuk',
                                  style: TextStyle(
                                    color: theme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Error Message (disederhanakan)
                        if (authProvider.errorMessage != null)
                          Container(
                            margin: const EdgeInsets.only(bottom: 24),
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(15),
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
          ],
        ),
      ),
    );
  }
  
  Widget _buildTextField({
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
              prefixIcon: Icon(
                icon,
                color: Colors.grey.shade600,
                size: 22,
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
}