import 'package:ferry_booking_app/screens/help/help_screen.dart';
import 'package:ferry_booking_app/screens/profile/about_app_screen.dart';
import 'package:ferry_booking_app/screens/notification/notification_settings_screen.dart';
import 'package:ferry_booking_app/screens/profile/change_password_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/config/theme.dart';
import 'package:ferry_booking_app/screens/profile/edit_profile_screen.dart';
import 'dart:ui';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
      ),
    );
    
    // Memulai animasi setelah sedikit delay untuk UX yang lebih baik
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;

    if (user == null) {
      return Center(
        child: CircularProgressIndicator(
          color: primaryColor,
        ),
      );
    }

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.white,
              Colors.blue.shade50,
              Colors.blue.shade100.withOpacity(0.3),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Elemen dekoratif latar belakang
            Positioned(
              top: -60,
              right: -60,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: primaryColor.withOpacity(0.08),
                ),
              ),
            ),
            Positioned(
              bottom: -80,
              left: -80,
              child: Container(
                width: 230,
                height: 230,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: primaryColor.withOpacity(0.08),
                ),
              ),
            ),
            
            // Ikon kapal di latar belakang
            ..._buildBackgroundIcons(size, primaryColor),
            
            // Konten utama
            SafeArea(
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header dengan foto profil
                        _buildProfileHeader(user, theme),
                        
                        const SizedBox(height: 36),

                        // Statistik Akun
                        _buildSectionHeader('Statistik Akun'),
                        const SizedBox(height: 16),
                        _buildStatsCard(user, theme),
                        
                        const SizedBox(height: 36),

                        // Informasi Pribadi
                        _buildSectionHeader('Informasi Pribadi'),
                        const SizedBox(height: 16),
                        _buildPersonalInfoCard(user, theme),
                        
                        const SizedBox(height: 36),

                        // Opsi Akun
                        _buildSectionHeader('Pengaturan Akun'),
                        const SizedBox(height: 16),
                        _buildAccountOptionsCard(context, authProvider, theme),
                        
                        const SizedBox(height: 40),
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

  // Fungsi untuk membangun ikon latar belakang
  List<Widget> _buildBackgroundIcons(Size size, Color primaryColor) {
    return [
      Positioned(
        top: size.height * 0.15,
        left: size.width * 0.1,
        child: Icon(
          Icons.sailing_outlined,
          size: 22,
          color: primaryColor.withOpacity(0.15),
        ),
      ),
      Positioned(
        top: size.height * 0.3,
        right: size.width * 0.15,
        child: Icon(
          Icons.directions_boat_outlined,
          size: 26,
          color: primaryColor.withOpacity(0.12),
        ),
      ),
      Positioned(
        bottom: size.height * 0.25,
        left: size.width * 0.2,
        child: Icon(
          Icons.directions_boat_filled_outlined,
          size: 24,
          color: primaryColor.withOpacity(0.1),
        ),
      ),
      Positioned(
        bottom: size.height * 0.4,
        right: size.width * 0.15,
        child: Icon(
          Icons.water,
          size: 18,
          color: primaryColor.withOpacity(0.12),
        ),
      ),
    ];
  }

  // Header section dengan foto profil
  Widget _buildProfileHeader(user, ThemeData theme) {
    return Center(
      child: Column(
        children: [
          // Avatar dengan efek refleksi
          Stack(
            alignment: Alignment.center,
            children: [
              // Bayangan
              Container(
                width: 115,
                height: 115,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.25),
                      blurRadius: 30,
                      offset: const Offset(0, 12),
                      spreadRadius: -5,
                    ),
                  ],
                ),
              ),
              // Container avatar utama
              Container(
                width: 115,
                height: 115,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor.withBlue(250),
                      theme.primaryColor,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withOpacity(0.8),
                    width: 3,
                  ),
                ),
                child: Center(
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                    style: const TextStyle(
                      fontSize: 46,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              // Efek refleksi
              Positioned(
                top: 15,
                left: 22,
                child: Container(
                  width: 45,
                  height: 22,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.6),
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
          
          const SizedBox(height: 22),
          
          // Nama pengguna dengan efek bayangan
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return LinearGradient(
                colors: [
                  Colors.black.withOpacity(0.85),
                  Colors.black,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(bounds);
            },
            child: Text(
              user.name,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 0.5,
              ),
            ),
          ),
          
          const SizedBox(height: 6),
          Text(
            user.email,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[700],
              letterSpacing: 0.3,
            ),
          ),
          
          const SizedBox(height: 14),
          
          // Tombol Edit Profil
          _buildEditProfileButton(theme),
        ],
      ),
    );
  }

  // Tombol Edit Profil dengan animasi
  Widget _buildEditProfileButton(ThemeData theme) {
    return TextButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => const EditProfileScreen(),
          ),
        );
      },
      style: TextButton.styleFrom(
        padding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.edit_outlined,
                  size: 16,
                  color: theme.primaryColor,
                ),
                const SizedBox(width: 6),
                Text(
                  'Edit Profil',
                  style: TextStyle(
                    color: theme.primaryColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 2,
              width: 85,
              margin: const EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                color: theme.primaryColor,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Header untuk setiap bagian
  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 1,
            margin: const EdgeInsets.only(left: 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.grey.shade300,
                  Colors.grey.shade100,
                  Colors.transparent,
                ],
                stops: const [0.1, 0.6, 1.0],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Kartu statistik
  Widget _buildStatsCard(user, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
            spreadRadius: -5,
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              'Total Perjalanan',
              user.totalBookings.toString(),
              Icons.directions_boat,
              theme,
            ),
          ),
          // Di sini bisa ditambahkan statistik lain jika diperlukan
        ],
      ),
    );
  }

  // Item statistik
  Widget _buildStatItem(String label, String value, IconData icon, ThemeData theme) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.primaryColor.withOpacity(0.7),
                theme.primaryColor.withOpacity(0.9),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: theme.primaryColor.withOpacity(0.2),
                blurRadius: 12,
                offset: const Offset(0, 6),
                spreadRadius: -2,
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 32),
        ),
        const SizedBox(height: 16),
        Text(
          value,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 14,
            letterSpacing: 0.3,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  // Kartu informasi pribadi
  Widget _buildPersonalInfoCard(user, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
            spreadRadius: -5,
          ),
        ],
      ),
      padding: const EdgeInsets.all(22),
      child: Column(
        children: [
          _buildProfileInfo('Nama Lengkap', user.name, Icons.person, theme),
          Divider(color: Colors.grey[200], thickness: 1, height: 30),
          _buildProfileInfo('Email', user.email, Icons.email, theme),
          Divider(color: Colors.grey[200], thickness: 1, height: 30),
          _buildProfileInfo('Nomor Telepon', user.phone, Icons.phone, theme),
          if (user.address != null && user.address!.isNotEmpty) ...[
            Divider(color: Colors.grey[200], thickness: 1, height: 30),
            _buildProfileInfo('Alamat', user.address!, Icons.home, theme),
          ],
          if (user.idNumber != null && user.idNumber!.isNotEmpty) ...[
            Divider(color: Colors.grey[200], thickness: 1, height: 30),
            _buildProfileInfo(
              'Nomor ${user.idType ?? 'Identitas'}',
              user.idNumber!,
              Icons.badge,
              theme,
            ),
          ],
          if (user.dateOfBirthday != null) ...[
            Divider(color: Colors.grey[200], thickness: 1, height: 30),
            _buildProfileInfo(
              'Tanggal Lahir',
              user.dateOfBirthday!,
              Icons.cake,
              theme,
            ),
          ],
          if (user.gender != null) ...[
            Divider(color: Colors.grey[200], thickness: 1, height: 30),
            _buildProfileInfo(
              'Jenis Kelamin',
              user.gender == 'MALE' ? 'Laki-laki' : 'Perempuan',
              Icons.person_outline,
              theme,
            ),
          ],
        ],
      ),
    );
  }

  // Item informasi profil
  Widget _buildProfileInfo(String label, String value, IconData icon, ThemeData theme) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: theme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, size: 22, color: theme.primaryColor),
        ),
        const SizedBox(width: 18),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                  letterSpacing: 0.2,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Kartu opsi akun
  Widget _buildAccountOptionsCard(BuildContext context, authProvider, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
            spreadRadius: -5,
          ),
        ],
      ),
      child: Column(
        children: [
          _buildMenuOption(
            'Ubah Profil',
            Icons.edit_outlined,
            () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const EditProfileScreen(),
                ),
              );
            },
            theme,
          ),
          _buildDivider(),
          _buildMenuOption(
            'Ubah Password',
            Icons.lock_outline,
            () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ChangePasswordScreen(),
                ),
              );
            },
            theme,
          ),
          _buildDivider(),
          _buildMenuOption(
            'Notifikasi',
            Icons.notifications_outlined,
            () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const NotificationSettingsScreen(),
                ),
              );
            },
            theme,
          ),
          _buildDivider(),
          _buildMenuOption(
            'Bantuan',
            Icons.help_outline,
            () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const HelpScreen(),
                ),
              );
            },
            theme,
          ),
          _buildDivider(),
          _buildMenuOption(
            'Tentang Aplikasi',
            Icons.info_outline,
            () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AboutAppScreen(),
                ),
              );
            },
            theme,
          ),
          _buildDivider(),
          _buildMenuOption(
            'Logout',
            Icons.logout_rounded,
            () async {
              final result = await _showLogoutDialog(context, theme);
              if (result && context.mounted) {
                await authProvider.logout();
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
            theme,
            textColor: Colors.red,
            iconColor: Colors.red,
          ),
        ],
      ),
    );
  }

  // Divider untuk menu
  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Divider(
        color: Colors.grey[200],
        thickness: 1,
        height: 1,
      ),
    );
  }

  // Opsi menu
  Widget _buildMenuOption(
    String title,
    IconData icon,
    VoidCallback onTap,
    ThemeData theme, {
    Color? textColor,
    Color? iconColor,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        splashColor: (iconColor ?? theme.primaryColor).withOpacity(0.03),
        highlightColor: (iconColor ?? theme.primaryColor).withOpacity(0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22.0, vertical: 18.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (iconColor ?? theme.primaryColor).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  icon,
                  color: iconColor ?? theme.primaryColor,
                  size: 22,
                ),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: textColor ?? Colors.black87,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: Colors.grey[400],
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Dialog logout
  Future<bool> _showLogoutDialog(BuildContext context, ThemeData theme) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        title: const Text(
          'Logout',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        content: const Text(
          'Apakah Anda yakin ingin keluar?',
          style: TextStyle(fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Tidak',
              style: TextStyle(
                color: Colors.grey[800],
                fontSize: 15,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Ya',
              style: TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ) ?? false;
  }
}