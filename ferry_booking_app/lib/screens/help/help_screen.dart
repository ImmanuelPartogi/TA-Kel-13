import 'package:flutter/material.dart';
import 'package:ferry_booking_app/config/theme.dart';

class HelpScreen extends StatefulWidget {
  const HelpScreen({Key? key}) : super(key: key);

  @override
  _HelpScreenState createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  @override
  void initState() {
    super.initState();
    
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
  
  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
                          'Bantuan',
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
                  
                  // Content
                  Expanded(
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: ListView(
                          padding: const EdgeInsets.all(24.0),
                          children: [
                            // Header
                            Center(
                              child: Column(
                                children: [
                                  // Support icon with gradient
                                  Container(
                                    padding: const EdgeInsets.all(20),
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
                                      boxShadow: [
                                        BoxShadow(
                                          color: theme.primaryColor.withOpacity(0.3),
                                          blurRadius: 15,
                                          offset: const Offset(0, 8),
                                          spreadRadius: -5,
                                        ),
                                      ],
                                    ),
                                    child: Icon(
                                      Icons.support_agent,
                                      size: 40,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  
                                  // Title with shadow
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
                                    child: const Text(
                                      'Pusat Bantuan',
                                      style: TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  
                                  // Subtitle
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 24),
                                    child: Text(
                                      'Jika Anda memiliki pertanyaan, temukan jawaban di sini',
                                      style: TextStyle(
                                        color: Colors.grey[700],
                                        fontSize: 14,
                                        height: 1.5,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  const SizedBox(height: 30),
                                ],
                              ),
                            ),

                            // FAQ Section
                            Row(
                              children: [
                                Icon(
                                  Icons.question_answer_rounded,
                                  size: 20,
                                  color: theme.primaryColor,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  'Pertanyaan Umum',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            _buildFaqItem(
                              context,
                              'Bagaimana cara memesan tiket?',
                              'Untuk memesan tiket, Anda perlu: \n\n'
                                  '1. Pergi ke tab Tiket\n'
                                  '2. Tekan tombol "Pesan Tiket" atau "+" \n'
                                  '3. Pilih rute perjalanan\n'
                                  '4. Pilih jadwal dan tanggal keberangkatan\n'
                                  '5. Isi data penumpang dan kendaraan (jika ada)\n'
                                  '6. Lakukan pembayaran dengan metode yang tersedia\n\n'
                                  'Setelah pembayaran berhasil, tiket akan tampil di tab Tiket.',
                              theme,
                              0
                            ),

                            _buildFaqItem(
                              context,
                              'Bagaimana cara membatalkan tiket?',
                              'Untuk membatalkan tiket: \n\n'
                                  '1. Pergi ke tab Tiket\n'
                                  '2. Pilih tiket yang ingin dibatalkan\n'
                                  '3. Scroll ke bawah dan tekan tombol "Batalkan Pemesanan"\n'
                                  '4. Konfirmasi pembatalan\n\n'
                                  'Perhatikan bahwa pembatalan hanya dapat dilakukan maksimal 24 jam sebelum keberangkatan. Kebijakan pengembalian dana berbeda-beda tergantung waktu pembatalan.',
                              theme,
                              1
                            ),

                            _buildFaqItem(
                              context,
                              'Metode pembayaran apa saja yang tersedia?',
                              'Kami menerima berbagai metode pembayaran, antara lain:\n\n'
                                  '- Transfer bank (Virtual Account)\n'
                                  '- E-Wallet (GoPay, ShopeePay)\n'
                                  'Setelah memesan tiket, Anda akan diarahkan ke halaman pembayaran dengan petunjuk lengkap.',
                              theme,
                              2
                            ),

                            _buildFaqItem(
                              context,
                              'Apa yang harus saya lakukan saat hari keberangkatan?',
                              'Pada hari keberangkatan: \n\n'
                                  '1. Datanglah ke pelabuhan minimal 30 menit sebelum jadwal keberangkatan\n'
                                  '2. Tunjukkan tiket digital di aplikasi kepada petugas\n'
                                  '3. Jika membawa kendaraan, ikuti petunjuk petugas untuk menaiki kapal\n\n'
                                  'Pastikan Anda telah menyiapkan dokumen identitas asli yang sesuai dengan data saat pemesanan.',
                              theme,
                              3
                            ),

                            _buildFaqItem(
                              context,
                              'Bagaimana jika kapal terlambat atau dibatalkan?',
                              'Jika terjadi keterlambatan atau pembatalan: \n\n'
                                  '1. Anda akan mendapatkan notifikasi melalui aplikasi\n'
                                  '2. Untuk keterlambatan, Anda dapat tetap menggunakan tiket pada jadwal baru\n'
                                  '3. Untuk pembatalan oleh kami, Anda berhak mendapatkan pengembalian dana penuh atau penggantian jadwal\n\n'
                                  'Silakan hubungi layanan pelanggan untuk informasi lebih lanjut.',
                              theme,
                              4
                            ),

                            const SizedBox(height: 30),

                            // Contact Section
                            Row(
                              children: [
                                Icon(
                                  Icons.contact_support_rounded,
                                  size: 20,
                                  color: theme.primaryColor,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  'Hubungi Kami',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.1),
                                    blurRadius: 15,
                                    offset: const Offset(0, 5),
                                    spreadRadius: -5,
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Column(
                                children: [
                                  _buildContactItem(
                                    context,
                                    Icons.phone_rounded,
                                    'Call Center',
                                    '0800-123-4567',
                                    theme,
                                    () {
                                      // Action to make phone call
                                    },
                                  ),
                                  Divider(color: Colors.grey.shade200, height: 1),
                                  _buildContactItem(
                                    context,
                                    Icons.email_rounded,
                                    'Email',
                                    'support@ferryapp.com',
                                    theme,
                                    () {
                                      // Action to send email
                                    },
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 40),
                            
                            // Help chatbot button
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
                                  onTap: () {
                                    Navigator.pushNamed(context, '/chatbot');
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
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.smart_toy_rounded,
                                            color: Colors.white,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 10),
                                          Text(
                                            'CHAT DENGAN ASSISTANT',
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 0.5,
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
                          ],
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

  Widget _buildFaqItem(BuildContext context, String question, String answer, ThemeData theme, int index) {
    // Each FAQ gets a slightly different accent color based on index for variety
    final List<Color> accentColors = [
      Colors.blue,
      Colors.deepPurple,
      Colors.indigo, 
      Colors.teal,
      Colors.green,
    ];
    
    final accentColor = accentColors[index % accentColors.length];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
            spreadRadius: -5,
          ),
        ],
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          iconColor: accentColor,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.help_outline_rounded,
                  color: accentColor,
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  question,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Text(
                answer,
                style: TextStyle(
                  color: Colors.grey[800],
                  height: 1.5,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildContactItem(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    ThemeData theme,
    VoidCallback onTap,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor.withOpacity(0.7),
                      theme.primaryColor.withOpacity(0.9),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                      spreadRadius: -2,
                    ),
                  ],
                ),
                child: Icon(
                  icon,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios_rounded,
                color: Colors.grey[400],
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }
}