import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'dart:ui';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({Key? key}) : super(key: key);

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _idNumberController;
  late TextEditingController _passwordController;
  String? _idType;
  String? _gender;
  DateTime? _dateOfBirth;
  String? _initialEmail;
  bool _isChangingEmail = false;
  bool _obscurePassword = true;
  
  // Animation controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _initUserData();
    
    // Initialize animation controllers
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

  void _initUserData() {
    final user = Provider.of<AuthProvider>(context, listen: false).user;

    if (user != null) {
      _nameController = TextEditingController(text: user.name);
      _emailController = TextEditingController(text: user.email);
      _initialEmail = user.email;
      _phoneController = TextEditingController(text: user.phone);
      _addressController = TextEditingController(text: user.address ?? '');
      _idNumberController = TextEditingController(text: user.idNumber ?? '');
      _passwordController = TextEditingController();
      _idType = user.idType;
      _gender = user.gender;

      if (user.dateOfBirthday != null) {
        try {
          _dateOfBirth = DateTime.parse(user.dateOfBirthday!);
        } catch (e) {
          _dateOfBirth = null;
        }
      }
    } else {
      _nameController = TextEditingController();
      _emailController = TextEditingController();
      _phoneController = TextEditingController();
      _addressController = TextEditingController();
      _idNumberController = TextEditingController();
      _passwordController = TextEditingController();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _idNumberController.dispose();
    _passwordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final theme = Theme.of(context);
    
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(1990),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: theme.primaryColor,
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: theme.primaryColor,
              ),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _dateOfBirth) {
      setState(() {
        _dateOfBirth = picked;
      });
    }
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final profileData = {
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'id_number': _idNumberController.text.trim(),
        'id_type': _idType,
        'gender': _gender,
        'date_of_birthday': _dateOfBirth?.toIso8601String().split('T')[0],
      };
      
      // Tambahkan password jika email diubah
      if (_isChangingEmail && _passwordController.text.isNotEmpty) {
        profileData['current_password'] = _passwordController.text;
      }

      final success = await authProvider.updateProfile(profileData);

      if (success && mounted) {
        // Tampilkan SnackBar sukses
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 10),
                Text('Profil berhasil diperbarui'),
              ],
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );

        // Tunggu sebentar agar SnackBar muncul terlebih dahulu
        await Future.delayed(const Duration(milliseconds: 500));

        // Baru navigasi kembali
        if (mounted) {
          Navigator.pop(context);
        }
      }
    }
  }

  // Cek apakah email berubah
  void _checkEmailChange(String value) {
    setState(() {
      _isChangingEmail = value.trim() != _initialEmail;
    });
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
            
            // Main Content
            SafeArea(
              child: Column(
                children: [
                  // Custom App Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Back Button
                        Container(
                          width: 45,
                          height: 45,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            borderRadius: BorderRadius.circular(15),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(15),
                              onTap: () => Navigator.pop(context),
                              child: const Icon(
                                Icons.arrow_back_ios_new_rounded,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                        
                        // Title
                        Text(
                          'Edit Profil',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        
                        // Empty Space for balance
                        const SizedBox(width: 45),
                      ],
                    ),
                  ),
                  
                  // Form Content
                  Expanded(
                    child: authProvider.isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : FadeTransition(
                          opacity: _fadeAnimation,
                          child: SlideTransition(
                            position: _slideAnimation,
                            child: Form(
                              key: _formKey,
                              child: SingleChildScrollView(
                                padding: const EdgeInsets.all(24.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Section Title
                                    Text(
                                      'Informasi Pribadi',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    
                                    // Name Field
                                    _buildAnimatedTextField(
                                      controller: _nameController,
                                      icon: Icons.person_rounded,
                                      label: 'Nama Lengkap',
                                      hintText: 'Masukkan nama lengkap Anda',
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Silakan masukkan nama lengkap';
                                        }
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // Email Field
                                    _buildAnimatedTextField(
                                      controller: _emailController,
                                      icon: Icons.alternate_email_rounded,
                                      label: 'Email',
                                      hintText: 'Masukkan email Anda',
                                      keyboardType: TextInputType.emailAddress,
                                      onChanged: _checkEmailChange,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Silakan masukkan email';
                                        }
                                        if (!value.contains('@') || !value.contains('.')) {
                                          return 'Masukkan email yang valid';
                                        }
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // Password Field (muncul hanya jika email berubah)
                                    if (_isChangingEmail)
                                      Column(
                                        children: [
                                          _buildAnimatedTextField(
                                            controller: _passwordController,
                                            icon: Icons.lock_rounded,
                                            label: 'Password Anda',
                                            hintText: 'Masukkan password Anda',
                                            isPassword: true,
                                            helperText: 'Diperlukan untuk verifikasi perubahan email',
                                            validator: (value) {
                                              if (_isChangingEmail && (value == null || value.isEmpty)) {
                                                return 'Password diperlukan untuk mengubah email';
                                              }
                                              return null;
                                            },
                                          ),
                                          const SizedBox(height: 18),
                                        ],
                                      ),
                                    
                                    // Phone Field
                                    _buildAnimatedTextField(
                                      controller: _phoneController,
                                      icon: Icons.phone_rounded,
                                      label: 'Nomor Telepon',
                                      hintText: 'Masukkan nomor telepon Anda',
                                      keyboardType: TextInputType.phone,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Silakan masukkan nomor telepon';
                                        }
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // Address Field
                                    _buildAnimatedTextField(
                                      controller: _addressController,
                                      icon: Icons.home_rounded,
                                      label: 'Alamat',
                                      hintText: 'Masukkan alamat Anda',
                                      maxLines: 2,
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // Section Title for Additional Info
                                    Text(
                                      'Informasi Tambahan',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    
                                    // ID Type Dropdown
                                    _buildDropdownField(
                                      label: 'Jenis Identitas',
                                      icon: Icons.badge_rounded,
                                      value: _idType,
                                      hint: 'Pilih jenis identitas',
                                      items: const [
                                        DropdownMenuItem(value: 'KTP', child: Text('KTP')),
                                        DropdownMenuItem(value: 'SIM', child: Text('SIM')),
                                        DropdownMenuItem(value: 'PASPOR', child: Text('Paspor')),
                                      ],
                                      onChanged: (value) {
                                        setState(() {
                                          _idType = value;
                                        });
                                      },
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // ID Number Field
                                    _buildAnimatedTextField(
                                      controller: _idNumberController,
                                      icon: Icons.credit_card_rounded,
                                      label: 'Nomor Identitas',
                                      hintText: 'Masukkan nomor identitas Anda',
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // Date of Birth Field
                                    _buildDatePickerField(
                                      label: 'Tanggal Lahir',
                                      icon: Icons.cake_rounded,
                                      value: _dateOfBirth,
                                      hint: 'Pilih tanggal lahir',
                                      onTap: () => _selectDate(context),
                                    ),
                                    const SizedBox(height: 18),
                                    
                                    // Gender Radio Buttons
                                    _buildGenderSelector(
                                      label: 'Jenis Kelamin',
                                      value: _gender,
                                      onChanged: (value) {
                                        setState(() {
                                          _gender = value;
                                        });
                                      },
                                    ),
                                    const SizedBox(height: 32),
                                    
                                    // Save Button
                                    Container(
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
                                          onTap: authProvider.isLoading ? null : _saveProfile,
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
                                                : Text(
                                                    'SIMPAN PERUBAHAN',
                                                    style: const TextStyle(
                                                      fontSize: 16,
                                                      fontWeight: FontWeight.bold,
                                                      letterSpacing: 1,
                                                      color: Colors.white,
                                                    ),
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    
                                    // Error Message
                                    if (authProvider.errorMessage != null)
                                      AnimatedContainer(
                                        duration: const Duration(milliseconds: 300),
                                        margin: const EdgeInsets.only(top: 24),
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
                                                    'Proses Gagal',
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnimatedTextField({
    required TextEditingController controller,
    required IconData icon,
    required String label,
    required String hintText,
    String? helperText,
    bool isPassword = false,
    int maxLines = 1,
    TextInputType? keyboardType,
    Function(String)? onChanged,
    String? Function(String?)? validator,
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
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: TextFormField(
            controller: controller,
            obscureText: isPassword ? _obscurePassword : false,
            maxLines: maxLines,
            keyboardType: keyboardType,
            onChanged: onChanged,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 14,
                fontWeight: FontWeight.normal,
              ),
              prefixIcon: Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.all(14),
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
              contentPadding: EdgeInsets.symmetric(
                vertical: 16,
                horizontal: maxLines > 1 ? 20 : 0,
              ),
              helperText: helperText,
              helperStyle: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
            validator: validator,
          ),
        ),
      ],
    );
  }
  
  Widget _buildDropdownField({
    required String label,
    required IconData icon,
    required String? value,
    required String hint,
    required List<DropdownMenuItem<String>> items,
    required Function(String?) onChanged,
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
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: DropdownButtonFormField<String>(
            value: value,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 14,
                fontWeight: FontWeight.normal,
              ),
              prefixIcon: Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.all(14),
                child: Icon(
                  icon,
                  color: Colors.grey.shade600,
                  size: 22,
                ),
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                vertical: 16,
                horizontal: 0,
              ),
            ),
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
            icon: Icon(
              Icons.keyboard_arrow_down_rounded,
              color: Colors.grey.shade600,
            ),
            isExpanded: true,
            dropdownColor: Colors.white,
            borderRadius: BorderRadius.circular(16),
            items: items,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
  
  Widget _buildDatePickerField({
    required String label,
    required IconData icon,
    required DateTime? value,
    required String hint,
    required VoidCallback onTap,
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
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.grey.shade200,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              children: [
                Container(
                  margin: const EdgeInsets.only(right: 12, left: 12),
                  padding: const EdgeInsets.all(10),
                  child: Icon(
                    icon,
                    color: Colors.grey.shade600,
                    size: 22,
                  ),
                ),
                Text(
                  value != null
                      ? '${_dateOfBirth!.day}/${_dateOfBirth!.month}/${_dateOfBirth!.year}'
                      : hint,
                  style: TextStyle(
                    fontSize: 15,
                    color: value != null ? Colors.black87 : Colors.grey.shade400,
                    fontWeight: value != null ? FontWeight.w500 : FontWeight.normal,
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: Icon(
                    Icons.calendar_today_rounded,
                    color: Colors.grey.shade600,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildGenderSelector({
    required String label,
    required String? value,
    required Function(String?) onChanged,
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
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildGenderOption(
                label: 'Laki-laki',
                icon: Icons.male_rounded,
                value: 'MALE',
                groupValue: value,
                onChanged: onChanged,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildGenderOption(
                label: 'Perempuan',
                icon: Icons.female_rounded,
                value: 'FEMALE',
                groupValue: value,
                onChanged: onChanged,
              ),
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildGenderOption({
    required String label,
    required IconData icon,
    required String value,
    required String? groupValue,
    required Function(String?) onChanged,
  }) {
    final theme = Theme.of(context);
    final isSelected = value == groupValue;
    
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: isSelected 
              ? theme.primaryColor.withOpacity(0.1)
              : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? theme.primaryColor
                : Colors.grey.shade200,
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: theme.primaryColor.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                    spreadRadius: -4,
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? theme.primaryColor : Colors.grey.shade600,
              size: 22,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? theme.primaryColor : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}