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
import 'package:ferry_booking_app/utils/date_time_helper.dart';
import 'package:flutter_svg/flutter_svg.dart'; // Tambahkan package ini

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
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

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
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
      ),
    );

    // Mulai animasi dengan delay singkat
    Future.delayed(const Duration(milliseconds: 100), () {
      _animationController.forward();
    });

    // Tambahkan listener untuk scroll controller
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.offset > 10 && !_isScrolled) {
      setState(() {
        _isScrolled = true;
      });
    } else if (_scrollController.offset <= 10 && _isScrolled) {
      setState(() {
        _isScrolled = false;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
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
        child: CircularProgressIndicator(color: primaryColor, strokeWidth: 3),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          // Background gradient with wave pattern
          _buildBackground(size, theme),

          // Main content
          CustomScrollView(
            controller: _scrollController,
            physics: const BouncingScrollPhysics(),
            slivers: [
              // Custom app bar
              _buildAppBar(user, theme, size),

              // Main content
              SliverToBoxAdapter(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),

                          // Statistics cards - more modern row of cards
                          _buildStatisticsSection(user, theme),

                          const SizedBox(height: 25),

                          // Personal Information
                          _buildSectionHeader(
                            'Informasi Pribadi',
                            Icons.person_outline,
                            theme,
                          ),
                          const SizedBox(height: 16),
                          _buildPersonalInfoCard(user, theme),

                          const SizedBox(height: 25),

                          // Account Settings
                          _buildSectionHeader(
                            'Pengaturan Akun',
                            Icons.settings_outlined,
                            theme,
                          ),
                          const SizedBox(height: 16),
                          _buildAccountSettingsCard(
                            context,
                            authProvider,
                            theme,
                          ),

                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Animated floating action button
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            right: 20,
            bottom: _isScrolled ? 20 : -60,
            child: FloatingActionButton(
              onPressed: () {
                _scrollController.animateTo(
                  0,
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeOutCubic,
                );
              },
              backgroundColor: theme.primaryColor,
              elevation: 4,
              child: const Icon(
                Icons.arrow_upward_rounded,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Background with wave pattern
  Widget _buildBackground(Size size, ThemeData theme) {
    return Stack(
      children: [
        // Base gradient
        Container(
          width: size.width,
          height: size.height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.white,
                Colors.grey.shade50,
                Colors.blue.shade50.withOpacity(0.5),
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
        ),

        // Top wave decoration
        Positioned(
          top: 0,
          child: Container(
            width: size.width,
            height: size.height * 0.25, // Sedikit dikurangi dari 0.28
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [theme.primaryColor, theme.primaryColor.withBlue(255)],
              ),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(30), // Sedikit dikurangi dari 40
                bottomRight: Radius.circular(30), // Sedikit dikurangi dari 40
              ),
            ),
          ),
        ),

        // Wave pattern overlay
        Positioned(
          top: 0,
          child: Opacity(
            opacity: 0.1,
            child: ClipPath(
              clipper: WaveClipper(),
              child: Container(
                width: size.width,
                height: size.height * 0.25, // Sedikit dikurangi dari 0.28
                color: Colors.white,
              ),
            ),
          ),
        ),

        // Decorative elements
        Positioned(
          top: size.height * 0.12,
          left: 20,
          child: Opacity(
            opacity: 0.15,
            child: Icon(Icons.sailing_outlined, size: 38, color: Colors.white),
          ),
        ),

        Positioned(
          top: size.height * 0.18,
          right: 30,
          child: Opacity(
            opacity: 0.15,
            child: Icon(
              Icons.directions_boat_filled_outlined,
              size: 45,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  // Custom app bar with profile info
  SliverAppBar _buildAppBar(user, ThemeData theme, Size size) {
    return SliverAppBar(
      expandedHeight:
          size.height *
          0.30, // Sedikit ditingkatkan untuk memberikan ruang lebih
      pinned: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          color: Colors.transparent,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 15),
            child: Column(
              mainAxisAlignment:
                  MainAxisAlignment
                      .end, // Ubah ke end untuk menghindari overflow
              mainAxisSize:
                  MainAxisSize
                      .min, // Menggunakan min size untuk menghindari overflow
              children: [
                _buildProfileAvatar(user, theme),
                const SizedBox(height: 12),
                Text(
                  user.name,
                  style: const TextStyle(
                    fontSize: 22, // Sedikit dikurangi
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: const TextStyle(
                    fontSize: 13, // Sedikit dikurangi
                    color: Colors.white70,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(height: 8),
                _buildEditProfileButton(theme),
              ],
            ),
          ),
        ),
        centerTitle: true,
        titlePadding: EdgeInsets.zero,
      ),
      title: AnimatedOpacity(
        duration: const Duration(milliseconds: 300),
        opacity: _isScrolled ? 1.0 : 0.0,
        child: Text(
          'Profil',
          style: TextStyle(
            color: _isScrolled ? theme.primaryColor : Colors.transparent,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      centerTitle: true,
    );
  }

  // Modern profile avatar
  Widget _buildProfileAvatar(user, ThemeData theme) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Outer ring with gradient
        Container(
          width: 100, // Sedikit dikurangi dari 110
          height: 100, // Sedikit dikurangi dari 110
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [
                Colors.white.withOpacity(0.8),
                Colors.white.withOpacity(0.2),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),

        // Main avatar container
        Container(
          width: 90, // Sedikit dikurangi dari 100
          height: 90, // Sedikit dikurangi dari 100
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [theme.primaryColor.withBlue(245), theme.primaryColor],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: theme.primaryColor.withOpacity(0.3),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Center(
            child: Text(
              user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
              style: const TextStyle(
                fontSize: 36, // Sedikit dikurangi dari 40
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),

        // Subtle shine effect
        Positioned(
          top: 25,
          left: 30,
          child: Container(
            width: 20, // Sedikit dikurangi dari 25
            height: 8, // Sedikit dikurangi dari 10
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: Colors.white.withOpacity(0.4),
            ),
          ),
        ),
      ],
    );
  }

  // Modern edit profile button
  Widget _buildEditProfileButton(ThemeData theme) {
    return TextButton(
      onPressed: () {
        Navigator.push(
          context,
          PageRouteBuilder(
            pageBuilder:
                (context, animation, secondaryAnimation) =>
                    const EditProfileScreen(),
            transitionsBuilder: (
              context,
              animation,
              secondaryAnimation,
              child,
            ) {
              var begin = const Offset(0.0, 0.1);
              var end = Offset.zero;
              var curve = Curves.easeOutCubic;
              var tween = Tween(
                begin: begin,
                end: end,
              ).chain(CurveTween(curve: curve));
              return SlideTransition(
                position: animation.drive(tween),
                child: child,
              );
            },
          ),
        );
      },
      style: TextButton.styleFrom(
        backgroundColor: Colors.white24,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 6,
        ), // Sedikit dikurangi
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.edit_outlined,
            color: Colors.white,
            size: 14, // Sedikit dikurangi dari 16
          ),
          const SizedBox(width: 6), // Sedikit dikurangi dari 8
          const Text(
            'Edit Profil',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w500,
              fontSize: 12, // Sedikit dikurangi dari 13
            ),
          ),
        ],
      ),
    );
  }

  // Modern section header
  Widget _buildSectionHeader(String title, IconData icon, ThemeData theme) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: theme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: theme.primaryColor, size: 18),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade800,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }

  // Statistics section with modern cards
  Widget _buildStatisticsSection(user, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Statistik', Icons.analytics_outlined, theme),
        const SizedBox(height: 16),
        Container(
          height: 140,
          child: ListView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            children: [
              _buildStatCard(
                'Total Perjalanan',
                user.totalBookings.toString(),
                Icons.directions_boat_filled,
                theme,
                gradient: LinearGradient(
                  colors: [
                    theme.primaryColor,
                    theme.primaryColor.withBlue(240),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              // Hanya menampilkan satu kartu statistik karena yang lain belum tersedia di model User
              _buildStatCard(
                'Status Member',
                user.totalBookings > 10 ? 'Premium' : 'Regular',
                Icons.card_membership,
                theme,
                gradient: LinearGradient(
                  colors: [Colors.orange.shade400, Colors.amber.shade600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Modern stat card
  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    ThemeData theme, {
    required Gradient gradient,
  }) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background pattern
          Positioned(
            bottom: -20,
            right: -20,
            child: Icon(icon, size: 100, color: Colors.white.withOpacity(0.1)),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: Colors.white, size: 20),
                ),
                const Spacer(),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Personal info card with modern design
  Widget _buildPersonalInfoCard(user, ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildProfileInfo('Nama Lengkap', user.name, Icons.person, theme),
          _buildInfoDivider(),
          _buildProfileInfo('Email', user.email, Icons.email_outlined, theme),
          _buildInfoDivider(),
          _buildProfileInfo(
            'Nomor Telepon',
            user.phone,
            Icons.phone_outlined,
            theme,
          ),
          if (user.address != null && user.address!.isNotEmpty) ...[
            _buildInfoDivider(),
            _buildProfileInfo(
              'Alamat',
              user.address!,
              Icons.home_outlined,
              theme,
            ),
          ],
          if (user.idNumber != null && user.idNumber!.isNotEmpty) ...[
            _buildInfoDivider(),
            _buildProfileInfo(
              'Nomor ${user.idType ?? 'Identitas'}',
              user.idNumber!,
              Icons.badge_outlined,
              theme,
            ),
          ],
          if (user.dateOfBirthday != null) ...[
            _buildInfoDivider(),
            _buildProfileInfo(
              'Tanggal Lahir',
              DateTimeHelper.formatDate(user.dateOfBirthday!),
              Icons.cake_outlined,
              theme,
            ),
          ],
          if (user.gender != null) ...[
            _buildInfoDivider(),
            _buildProfileInfo(
              'Jenis Kelamin',
              user.gender == 'MALE' ? 'Laki-laki' : 'Perempuan',
              Icons.people_outlined,
              theme,
            ),
          ],
        ],
      ),
    );
  }

  // Modern profile info item
  Widget _buildProfileInfo(
    String label,
    String value,
    IconData icon,
    ThemeData theme,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 20.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: theme.primaryColor.withOpacity(0.1),
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
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Subtle divider
  Widget _buildInfoDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Divider(color: Colors.grey.shade100, thickness: 1, height: 1),
    );
  }

  // Account settings card with modern design
  Widget _buildAccountSettingsCard(
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
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 5),
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
          _buildMenuDivider(),
          _buildMenuOption('Ubah Password', Icons.lock_outline, () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const ChangePasswordScreen(),
              ),
            );
          }, theme),
          _buildMenuDivider(),
          _buildMenuOption('Bantuan', Icons.help_outline, () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const HelpScreen()),
            );
          }, theme),
          _buildMenuDivider(),
          _buildMenuOption('Tentang Aplikasi', Icons.info_outline, () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const AboutAppScreen()),
            );
          }, theme),
          _buildMenuDivider(),
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

  // Menu option with hover effect
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
        splashColor: (iconColor ?? theme.primaryColor).withOpacity(0.05),
        highlightColor: (iconColor ?? theme.primaryColor).withOpacity(0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: (iconColor ?? theme.primaryColor).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
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
                    color: textColor ?? Colors.grey.shade800,
                  ),
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: Colors.grey.shade400,
                size: 14,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Subtle menu divider
  Widget _buildMenuDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Divider(color: Colors.grey.shade100, thickness: 1, height: 1),
    );
  }

  // Modern logout dialog
  Future<bool> _showLogoutDialog(BuildContext context, ThemeData theme) async {
    return await showDialog<bool>(
          context: context,
          builder:
              (context) => Dialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                elevation: 0,
                backgroundColor: Colors.transparent,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.logout_rounded,
                          color: Colors.red.shade400,
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Logout',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Apakah Anda yakin ingin keluar?',
                        style: TextStyle(fontSize: 15, color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 25),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            style: TextButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 10,
                              ),
                            ),
                            child: Text(
                              'Batal',
                              style: TextStyle(
                                fontSize: 15,
                                color: Colors.grey.shade700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton(
                            onPressed: () => Navigator.pop(context, true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade400,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 25,
                                vertical: 10,
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Logout',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
        ) ??
        false;
  }
}

// Custom wave clipper for background
class WaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    var path = Path();
    path.lineTo(0, size.height - 40);

    var firstControlPoint = Offset(size.width / 4, size.height);
    var firstEndPoint = Offset(size.width / 2, size.height - 30);
    path.quadraticBezierTo(
      firstControlPoint.dx,
      firstControlPoint.dy,
      firstEndPoint.dx,
      firstEndPoint.dy,
    );

    var secondControlPoint = Offset(size.width * 0.75, size.height - 60);
    var secondEndPoint = Offset(size.width, size.height - 20);
    path.quadraticBezierTo(
      secondControlPoint.dx,
      secondControlPoint.dy,
      secondEndPoint.dx,
      secondEndPoint.dy,
    );

    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
