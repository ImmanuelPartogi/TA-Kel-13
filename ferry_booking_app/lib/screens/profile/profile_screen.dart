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
// Import DateTimeHelper
import 'package:ferry_booking_app/utils/date_time_helper.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700), // Sedikit lebih cepat
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(
          0.0,
          0.5,
          curve: Curves.easeOutCubic,
        ), // Perubahan kurva
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

    // Memulai animasi dengan delay lebih pendek
    Future.delayed(const Duration(milliseconds: 50), () {
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
      return Center(child: CircularProgressIndicator(color: primaryColor));
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
              Colors.blue.shade100.withOpacity(0.25), // Opacity lebih rendah
            ],
            stops: const [0.0, 0.6, 1.0], // Gradasi lebih terstruktur
          ),
        ),
        child: Stack(
          children: [
            // Elemen dekoratif latar belakang - dengan ukuran yang lebih proporsional
            Positioned(
              top: 80,
              right: -45,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.08),
                ),
              ),
            ),
            Positioned(
              bottom: 50,
              left: -80,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.08),
                ),
              ),
            ),

            // Ikon kapal di latar belakang dengan pola yang lebih terstruktur
            ..._buildBackgroundIcons(size, primaryColor),

            // Konten utama
            SafeArea(
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 22.0,
                      vertical: 12.0,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header dengan foto profil
                        _buildProfileHeader(user, theme),

                        const SizedBox(height: 32),

                        // Statistik Akun
                        _buildSectionHeader('Statistik Akun'),
                        const SizedBox(height: 14),
                        _buildStatsCard(user, theme),

                        const SizedBox(height: 32),

                        // Informasi Pribadi
                        _buildSectionHeader('Informasi Pribadi'),
                        const SizedBox(height: 14),
                        _buildPersonalInfoCard(user, theme),

                        const SizedBox(height: 32),

                        // Opsi Akun
                        _buildSectionHeader('Pengaturan Akun'),
                        const SizedBox(height: 14),
                        _buildAccountOptionsCard(context, authProvider, theme),

                        const SizedBox(height: 32),
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

  // Fungsi untuk membangun ikon latar belakang dengan pola yang lebih terstruktur
  List<Widget> _buildBackgroundIcons(Size size, Color primaryColor) {
    return [
      Positioned(
        top: size.height * 0.18,
        left: size.width * 0.12,
        child: Icon(
          Icons.sailing_outlined,
          size: 20,
          color: primaryColor.withOpacity(0.13),
        ),
      ),
      Positioned(
        top: size.height * 0.32,
        right: size.width * 0.14,
        child: Icon(
          Icons.directions_boat_outlined,
          size: 24,
          color: primaryColor.withOpacity(0.10),
        ),
      ),
      Positioned(
        bottom: size.height * 0.28,
        left: size.width * 0.18,
        child: Icon(
          Icons.directions_boat_filled_outlined,
          size: 22,
          color: primaryColor.withOpacity(0.08),
        ),
      ),
      Positioned(
        bottom: size.height * 0.42,
        right: size.width * 0.16,
        child: Icon(
          Icons.water,
          size: 16,
          color: primaryColor.withOpacity(0.10),
        ),
      ),
    ];
  }

  // Header section dengan foto profil yang lebih profesional
  Widget _buildProfileHeader(user, ThemeData theme) {
    return Center(
      child: Column(
        children: [
          // Avatar dengan efek refleksi yang lebih halus
          Stack(
            alignment: Alignment.center,
            children: [
              // Bayangan
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.2),
                      blurRadius: 25,
                      offset: const Offset(0, 10),
                      spreadRadius: -4,
                    ),
                  ],
                ),
              ),
              // Container avatar utama
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor.withBlue(245),
                      theme.primaryColor,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withOpacity(0.85),
                    width: 3,
                  ),
                ),
                child: Center(
                  child: Text(
                    user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                    style: const TextStyle(
                      fontSize: 44,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              // Efek refleksi yang lebih halus
              Positioned(
                top: 18,
                left: 25,
                child: Container(
                  width: 40,
                  height: 18,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.5),
                        Colors.white.withOpacity(0.0),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Nama pengguna dengan efek bayangan yang lebih halus
          ShaderMask(
            shaderCallback: (Rect bounds) {
              return LinearGradient(
                colors: [Colors.black.withOpacity(0.9), Colors.black],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(bounds);
            },
            child: Text(
              user.name,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 0.3,
              ),
            ),
          ),

          const SizedBox(height: 6),
          Text(
            user.email,
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey[700],
              letterSpacing: 0.2,
            ),
          ),

          const SizedBox(height: 16),

          // Tombol Edit Profil
          _buildEditProfileButton(theme),
        ],
      ),
    );
  }

  // Tombol Edit Profil dengan animasi yang lebih halus
  Widget _buildEditProfileButton(ThemeData theme) {
    return TextButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const EditProfileScreen()),
        );
      },
      style: TextButton.styleFrom(
        padding: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
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
                Icon(Icons.edit_outlined, size: 15, color: theme.primaryColor),
                const SizedBox(width: 6),
                Text(
                  'Edit Profil',
                  style: TextStyle(
                    color: theme.primaryColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              height: 2,
              width: 82,
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

  // Header untuk setiap bagian yang lebih rapi
  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 1,
            margin: const EdgeInsets.only(left: 6),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.grey.shade300,
                  Colors.grey.shade100,
                  Colors.transparent,
                ],
                stops: const [0.1, 0.5, 0.9],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Kartu statistik yang lebih modern
  Widget _buildStatsCard(user, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.06),
            blurRadius: 15,
            offset: const Offset(0, 6),
            spreadRadius: -4,
          ),
        ],
      ),
      padding: const EdgeInsets.all(22),
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

  // Item statistik yang lebih bersih
  Widget _buildStatItem(
    String label,
    String value,
    IconData icon,
    ThemeData theme,
  ) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.primaryColor.withOpacity(0.75),
                theme.primaryColor.withOpacity(0.95),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: theme.primaryColor.withOpacity(0.15),
                blurRadius: 10,
                offset: const Offset(0, 5),
                spreadRadius: -2,
              ),
            ],
          ),
          child: Icon(icon, color: Colors.white, size: 30),
        ),
        const SizedBox(height: 14),
        Text(
          value,
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 14,
            letterSpacing: 0.2,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  // Kartu informasi pribadi yang lebih profesional
  Widget _buildPersonalInfoCard(user, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.06),
            blurRadius: 15,
            offset: const Offset(0, 6),
            spreadRadius: -4,
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          _buildProfileInfo('Nama Lengkap', user.name, Icons.person, theme),
          Divider(color: Colors.grey[100], thickness: 1, height: 26),
          _buildProfileInfo('Email', user.email, Icons.email, theme),
          Divider(color: Colors.grey[100], thickness: 1, height: 26),
          _buildProfileInfo('Nomor Telepon', user.phone, Icons.phone, theme),
          if (user.address != null && user.address!.isNotEmpty) ...[
            Divider(color: Colors.grey[100], thickness: 1, height: 26),
            _buildProfileInfo('Alamat', user.address!, Icons.home, theme),
          ],
          if (user.idNumber != null && user.idNumber!.isNotEmpty) ...[
            Divider(color: Colors.grey[100], thickness: 1, height: 26),
            _buildProfileInfo(
              'Nomor ${user.idType ?? 'Identitas'}',
              user.idNumber!,
              Icons.badge,
              theme,
            ),
          ],
          if (user.dateOfBirthday != null) ...[
            Divider(color: Colors.grey[100], thickness: 1, height: 26),
            _buildProfileInfo(
              'Tanggal Lahir',
              DateTimeHelper.formatDate(user.dateOfBirthday!),
              Icons.cake,
              theme,
            ),
          ],
          if (user.gender != null) ...[
            Divider(color: Colors.grey[100], thickness: 1, height: 26),
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

  // Item informasi profil yang lebih bersih
  Widget _buildProfileInfo(
    String label,
    String value,
    IconData icon,
    ThemeData theme,
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: theme.primaryColor.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 20, color: theme.primaryColor),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 13,
                  letterSpacing: 0.1,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Kartu opsi akun yang lebih modern
  Widget _buildAccountOptionsCard(
    BuildContext context,
    authProvider,
    ThemeData theme,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.06),
            blurRadius: 15,
            offset: const Offset(0, 6),
            spreadRadius: -4,
          ),
        ],
      ),
      child: Column(
        children: [
          _buildMenuOption('Ubah Profil', Icons.edit_outlined, () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const EditProfileScreen(),
              ),
            );
          }, theme),
          _buildDivider(),
          _buildMenuOption('Ubah Password', Icons.lock_outline, () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ChangePasswordScreen(),
              ),
            );
          }, theme),
          // _buildDivider(),
          // _buildMenuOption(
          //   'Notifikasi',
          //   Icons.notifications_outlined,
          //   () {
          //     Navigator.push(
          //       context,
          //       MaterialPageRoute(
          //         builder: (context) => const NotificationSettingsScreen(),
          //       ),
          //     );
          //   },
          //   theme,
          // ),
          _buildDivider(),
          _buildMenuOption('Bantuan', Icons.help_outline, () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const HelpScreen()),
            );
          }, theme),
          _buildDivider(),
          _buildMenuOption('Tentang Aplikasi', Icons.info_outline, () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const AboutAppScreen()),
            );
          }, theme),
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
            textColor: Colors.red.shade600,
            iconColor: Colors.red.shade600,
          ),
        ],
      ),
    );
  }

  // Divider untuk menu yang lebih halus
  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Divider(color: Colors.grey[100], thickness: 1, height: 1),
    );
  }

  // Opsi menu yang lebih bersih
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
        borderRadius: BorderRadius.circular(20),
        splashColor: (iconColor ?? theme.primaryColor).withOpacity(0.03),
        highlightColor: (iconColor ?? theme.primaryColor).withOpacity(0.04),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (iconColor ?? theme.primaryColor).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: iconColor ?? theme.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: textColor ?? Colors.black87,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              Icon(Icons.arrow_forward_ios, color: Colors.grey[350], size: 14),
            ],
          ),
        ),
      ),
    );
  }

  // Dialog logout yang lebih modern
  Future<bool> _showLogoutDialog(BuildContext context, ThemeData theme) async {
    return await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                title: const Text(
                  'Logout',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                content: const Text(
                  'Apakah Anda yakin ingin keluar?',
                  style: TextStyle(fontSize: 15),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      'Tidak',
                      style: TextStyle(color: Colors.grey[700], fontSize: 14),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.primaryColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'Ya',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
                actionsPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
              ),
        ) ??
        false;
  }
}