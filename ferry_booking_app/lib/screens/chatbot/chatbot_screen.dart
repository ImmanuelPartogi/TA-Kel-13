import 'package:ferry_booking_app/widgets/suggested_questions.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/chatbot_provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/models/chat_message.dart';
import 'package:flutter_chat_bubble/bubble_type.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_chat_bubble/clippers/chat_bubble_clipper_6.dart';
import 'package:ferry_booking_app/widgets/typing_indicator.dart';
import 'package:flutter/services.dart';
import 'package:shimmer/shimmer.dart';
import 'package:ferry_booking_app/utils/theme_helper.dart';
import 'package:ferry_booking_app/widgets/connection_status_banner.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:url_launcher/url_launcher.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({Key? key}) : super(key: key);

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late ChatbotProvider _chatbotProvider;
  late AuthProvider _authProvider;
  bool _isInitialized = false;
  bool _showScrollButton = false;
  bool _isTyping = false;
  late AnimationController _animationController;
  late Animation<double> _animation;
  bool _shouldScrollToBottom = false; // Flag untuk mengontrol scroll otomatis
  
  // Theme config
  late Color _primaryColor;
  late Color _secondaryColor;
  late Color _backgroundColor;
  late Color _userBubbleColor;
  late Color _botBubbleColor;
  bool _isDarkMode = false;

  @override
  void initState() {
    super.initState();
    _chatbotProvider = Provider.of<ChatbotProvider>(context, listen: false);
    _authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Inisialisasi controller animasi (untuk tombol scroll ke bawah)
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200), // Durasi animasi dipercepat
    );

    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );

    // Set token dari auth provider
    if (_authProvider.isLoggedIn) {
      _chatbotProvider.setToken(_authProvider.token);
    }

    // Setup scroll listener
    _scrollController.addListener(_scrollListener);

    // Load conversation setelah build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeChat();
      _initializeTheme();
      
      // Listen to theme changes
      ThemeHelper.addListener(() {
        if (mounted) {
          _initializeTheme();
        }
      });
    });
  }

  void _initializeTheme() {
    _isDarkMode = ThemeHelper.isDarkMode(context);
    _primaryColor = Theme.of(context).primaryColor;
    _secondaryColor = Theme.of(context).colorScheme.secondary;
    _backgroundColor = _isDarkMode ? Colors.grey[850]! : Colors.grey[50]!;
    _userBubbleColor = _isDarkMode ? Colors.indigo[700]! : _primaryColor;
    _botBubbleColor = _isDarkMode ? Colors.grey[700]! : Colors.grey[200]!;
    setState(() {});
  }

  // Listener untuk scroll position
  void _scrollListener() {
    if (_scrollController.hasClients) {
      final maxScroll = _scrollController.position.maxScrollExtent;
      final currentScroll = _scrollController.position.pixels;

      // Tampilkan tombol scroll jika tidak di bawah
      if (currentScroll < maxScroll - 50 && !_showScrollButton) {
        setState(() {
          _showScrollButton = true;
        });
        _animationController.forward();
      } else if (currentScroll >= maxScroll - 50 && _showScrollButton) {
        setState(() {
          _showScrollButton = false;
        });
        _animationController.reverse();
      }
    }
  }

  Future<void> _initializeChat() async {
    if (!_isInitialized) {
      try {
        await _chatbotProvider.loadConversation();
        _isInitialized = true;
        _shouldScrollToBottom = true; // Set flag untuk scroll otomatis pertama kali
      } catch (e) {
        print("Error initializing chat: $e");
        // Tampilkan snackbar error jika gagal memuat percakapan
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.white),
                  const SizedBox(width: 10),
                  const Text('Gagal memuat riwayat percakapan'),
                ],
              ),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );
        }
      }
    }
  }

  // Scroll ke pesan terbaru dengan penanganan error
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      try {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200), // Durasi animasi dipercepat
          curve: Curves.easeOut,
        );
      } catch (e) {
        print("Error scrolling to bottom: $e");
      }
    }
  }

  // Mengirim pesan dengan haptic feedback
  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    // Haptic feedback saat kirim pesan
    HapticFeedback.lightImpact();

    _messageController.clear();

    // Tambahkan efek typing sebelum respon dari server
    setState(() {
      _isTyping = true;
    });

    try {
      await _chatbotProvider.sendMessage(message);
      _shouldScrollToBottom = true; // Set flag untuk scroll otomatis setelah kirim pesan
    } catch (e) {
      print("Error sending message: $e");
      // Tampilkan snackbar error jika gagal mengirim pesan
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: Colors.white),
                const SizedBox(width: 10),
                const Text('Gagal mengirim pesan'),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    }

    if (mounted) {
      setState(() {
        _isTyping = false;
      });
    }
  }

  // Dialog feedback dengan animasi minimal
  void _showFeedbackDialog(int messageId, bool isHelpful) {
    final feedbackController = TextEditingController();
    final theme = Theme.of(context);

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[850] : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10, // Mengurangi blur
                offset: const Offset(0, 5), // Mengurangi offset
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: (isHelpful ? Colors.green : Colors.orange).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Icon(
                      isHelpful
                        ? Icons.sentiment_satisfied_alt
                        : Icons.sentiment_dissatisfied,
                      color: isHelpful ? Colors.green : Colors.orange,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Text(
                      isHelpful ? 'Terima kasih!' : 'Maaf kamu tidak terbantu',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: _isDarkMode ? Colors.white : Colors.black87,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              Text(
                isHelpful
                  ? 'Kami senang dapat membantu Anda.'
                  : 'Mohon bantu kami meningkatkan layanan chatbot.',
                style: TextStyle(
                  color: _isDarkMode ? Colors.grey[300] : Colors.grey[700],
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 20),
              Container(
                decoration: BoxDecoration(
                  color: _isDarkMode ? Colors.grey[800] : Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _isDarkMode ? Colors.grey[700]! : Colors.grey[200]!,
                    width: 1,
                  ),
                ),
                child: TextField(
                  controller: feedbackController,
                  style: TextStyle(
                    color: _isDarkMode ? Colors.white : Colors.black87,
                  ),
                  decoration: InputDecoration(
                    hintText: isHelpful
                      ? 'Berikan saran tambahan (opsional)'
                      : 'Mohon beri tahu kami bagaimana kami dapat membantu',
                    hintStyle: TextStyle(
                      color: _isDarkMode ? Colors.grey[400] : Colors.grey[400],
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                  ),
                  maxLines: 3,
                ),
              ),
              const SizedBox(height: 25),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 120,
                    height: 45,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                      child: InkWell(
                        onTap: () => Navigator.pop(context),
                        borderRadius: BorderRadius.circular(15),
                        child: Ink(
                          decoration: BoxDecoration(
                            color: _isDarkMode ? Colors.grey[800] : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(15),
                            border: Border.all(
                              color: _isDarkMode ? Colors.grey[700]! : Colors.grey.shade300,
                              width: 1.5,
                            ),
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            child: Text(
                              'Batal',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: _isDarkMode ? Colors.grey[400] : Colors.grey[700],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(
                    width: 120,
                    height: 45,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: (isHelpful ? Colors.green : theme.primaryColor).withOpacity(0.2), // Mengurangi opasitas
                          blurRadius: 8, // Mengurangi blur
                          offset: const Offset(0, 4), // Mengurangi offset
                          spreadRadius: -3, // Mengurangi spread
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                      child: InkWell(
                        onTap: () {
                          _chatbotProvider.sendFeedback(
                            messageId,
                            isHelpful,
                            feedbackText: feedbackController.text.trim().isNotEmpty
                              ? feedbackController.text.trim()
                              : null,
                          );
                          Navigator.pop(context);

                          // Notifikasi feedback berhasil dikirim (lebih sederhana)
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Terima kasih atas feedback Anda!'),
                              backgroundColor: isHelpful ? Colors.green[600] : theme.primaryColor,
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(15),
                        child: Ink(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: isHelpful 
                                ? [Colors.green.shade400, Colors.green.shade600]
                                : [theme.primaryColor.withBlue(255), theme.primaryColor],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            child: const Text(
                              'Kirim',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Menu opsi dengan animasi minimal
  void _showOptionsMenu() {
    final theme = Theme.of(context);
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[850] : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05), // Mengurangi opasitas
                blurRadius: 10, // Mengurangi blur
                offset: const Offset(0, -3), // Mengurangi offset
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _isDarkMode ? Colors.grey[700] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: theme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Icon(
                          Icons.settings_rounded,
                          color: theme.primaryColor,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 15),
                      Text(
                        'Pengaturan Chatbot',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _isDarkMode ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildOptionItem(
                    context: context,
                    icon: Icons.restart_alt_rounded,
                    title: 'Mulai Percakapan Baru',
                    subtitle: 'Hapus semua pesan dan mulai ulang',
                    onTap: () {
                      Navigator.pop(context);
                      _showResetConfirmation();
                    },
                  ),
                  const SizedBox(height: 15),
                  Container(
                    height: 1,
                    color: Colors.grey.shade200,
                  ),
                  const SizedBox(height: 15),
                  _buildOptionItem(
                    context: context,
                    icon: Icons.lightbulb_outline_rounded,
                    title: 'Pertanyaan Populer',
                    subtitle: 'Lihat pertanyaan yang sering ditanyakan',
                    onTap: () {
                      Navigator.pop(context);
                      _showPopularQuestions();
                    },
                  ),
                  const SizedBox(height: 15),
                  Container(
                    height: 1,
                    color: Colors.grey.shade200,
                  ),
                  const SizedBox(height: 15),
                  _buildOptionItem(
                    context: context,
                    icon: Icons.color_lens_outlined,
                    title: 'Tampilan',
                    subtitle: 'Ubah tema chatbot',
                    onTap: () {
                      Navigator.pop(context);
                      _showThemeSelector();
                    },
                  ),
                  if (_authProvider.isLoggedIn) ...[
                    const SizedBox(height: 15),
                    Container(
                      height: 1,
                      color: Colors.grey.shade200,
                    ),
                    const SizedBox(height: 15),
                    _buildOptionItem(
                      context: context,
                      icon: Icons.history_rounded,
                      title: 'Riwayat Percakapan',
                      subtitle: 'Lihat percakapan sebelumnya',
                      onTap: () {
                        Navigator.pop(context);
                        _showConversationHistory();
                      },
                    ),
                  ],
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Tampilkan dialog tema
  void _showThemeSelector() {
    final theme = Theme.of(context);
    
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[850] : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05), // Mengurangi opasitas
                blurRadius: 10, // Mengurangi blur
                offset: const Offset(0, 5), // Mengurangi offset
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Icon(
                      Icons.color_lens_rounded,
                      color: theme.primaryColor,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Text(
                    'Pilih Tema',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: _isDarkMode ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _buildThemeOption(
                title: 'Light Mode',
                icon: Icons.light_mode_rounded,
                isSelected: !_isDarkMode,
                onTap: () {
                  Navigator.pop(context);
                  ThemeHelper.setLightMode(context);
                  _initializeTheme();
                },
              ),
              const SizedBox(height: 12),
              _buildThemeOption(
                title: 'Dark Mode',
                icon: Icons.dark_mode_rounded,
                isSelected: _isDarkMode,
                onTap: () {
                  Navigator.pop(context);
                  ThemeHelper.setDarkMode(context);
                  _initializeTheme();
                },
              ),
              const SizedBox(height: 12),
              _buildThemeOption(
                title: 'Sistem (Auto)',
                icon: Icons.settings_suggest_rounded,
                isSelected: false,
                onTap: () {
                  Navigator.pop(context);
                  ThemeHelper.setSystemMode(context);
                  _initializeTheme();
                },
              ),
              const SizedBox(height: 25),
              Container(
                width: double.infinity,
                height: 45,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(15),
                  child: InkWell(
                    onTap: () => Navigator.pop(context),
                    borderRadius: BorderRadius.circular(15),
                    child: Ink(
                      decoration: BoxDecoration(
                        color: _isDarkMode ? Colors.grey[800] : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: _isDarkMode ? Colors.grey[700]! : Colors.grey.shade300,
                          width: 1.5,
                        ),
                      ),
                      child: Container(
                        alignment: Alignment.center,
                        child: Text(
                          'Tutup',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: _isDarkMode ? Colors.grey[400] : Colors.grey[700],
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
      ),
    );
  }

  // Option tema
  Widget _buildThemeOption({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: BoxDecoration(
        color: isSelected 
          ? theme.primaryColor.withOpacity(0.1) 
          : _isDarkMode ? Colors.grey[800] : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected 
            ? theme.primaryColor 
            : _isDarkMode ? Colors.grey[700]! : Colors.grey.shade200,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isSelected
                      ? theme.primaryColor.withOpacity(0.2)
                      : _isDarkMode 
                        ? Colors.grey[700]!.withOpacity(0.5)
                        : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon, 
                    color: isSelected ? theme.primaryColor : null,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? theme.primaryColor : null,
                    fontSize: 15,
                  ),
                ),
                const Spacer(),
                if (isSelected) 
                  Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: theme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check, 
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Tampilkan pertanyaan populer
  void _showPopularQuestions() {
    final theme = Theme.of(context);
    final popularQuestions = [
      'Bagaimana cara memesan tiket feri?',
      'Apa saja metode pembayaran yang tersedia?',
      'Berapa batas bagasi yang diperbolehkan?',
      'Bagaimana prosedur check-in?',
      'Bagaimana cara membatalkan tiket?',
      'Apakah saya bisa membawa kendaraan?',
      'Bagaimana kebijakan refund?',
      'Apa saja fasilitas di kapal?',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[850] : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05), // Mengurangi opasitas
                blurRadius: 10, // Mengurangi blur
                offset: const Offset(0, -3), // Mengurangi offset
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _isDarkMode ? Colors.grey[700] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: theme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Icon(
                          Icons.trending_up_rounded,
                          color: theme.primaryColor,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 15),
                      Text(
                        'Pertanyaan Populer',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _isDarkMode ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: popularQuestions.length,
                    itemBuilder: (context, index) {
                      return _buildPopularQuestionItem(
                        question: popularQuestions[index],
                        onTap: () {
                          Navigator.pop(context);
                          _messageController.text = popularQuestions[index];
                          _sendMessage();
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // Item pertanyaan populer
  Widget _buildPopularQuestionItem({
    required String question,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: _isDarkMode ? Colors.grey[800] : Colors.white,
        borderRadius: BorderRadius.circular(16),
        // Menghilangkan shadow untuk optimasi
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.question_answer_rounded,
                    color: theme.primaryColor.withOpacity(0.8),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Text(
                    question,
                    style: TextStyle(
                      fontSize: 14,
                      color: _isDarkMode ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded, 
                  color: _isDarkMode ? Colors.grey[600] : Colors.grey[400], 
                  size: 14
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Tampilkan riwayat percakapan
  void _showConversationHistory() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.white),
            const SizedBox(width: 10),
            const Text('Fitur akan segera tersedia!'),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: _secondaryColor,
        duration: const Duration(seconds: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(8),
      ),
    );
  }

  // Konfirmasi reset percakapan
  void _showResetConfirmation() {
    final theme = Theme.of(context);
    
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[850] : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05), // Mengurangi opasitas
                blurRadius: 10, // Mengurangi blur
                offset: const Offset(0, 5), // Mengurangi offset
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.orange,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 15),
                  const Text(
                    'Mulai Percakapan Baru?',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Semua pesan di percakapan ini akan dihapus dan tidak dapat dipulihkan. Lanjutkan?',
                style: TextStyle(
                  fontSize: 15,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 25),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 120,
                    height: 45,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                      child: InkWell(
                        onTap: () => Navigator.pop(context),
                        borderRadius: BorderRadius.circular(15),
                        child: Ink(
                          decoration: BoxDecoration(
                            color: _isDarkMode ? Colors.grey[800] : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(15),
                            border: Border.all(
                              color: _isDarkMode ? Colors.grey[700]! : Colors.grey.shade300,
                              width: 1.5,
                            ),
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            child: Text(
                              'Batal',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: _isDarkMode ? Colors.grey[400] : Colors.grey[700],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(
                    width: 120,
                    height: 45,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.2), // Mengurangi opasitas
                          blurRadius: 8, // Mengurangi blur
                          offset: const Offset(0, 4), // Mengurangi offset
                          spreadRadius: -3, // Mengurangi spread
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                      child: InkWell(
                        onTap: () {
                          Navigator.pop(context);
                          // Haptic feedback saat reset
                          HapticFeedback.mediumImpact();
                          try {
                            _chatbotProvider.clearConversation();
                            _shouldScrollToBottom = true; // Set flag untuk scroll otomatis setelah reset
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Row(
                                    children: [
                                      const Icon(Icons.check_circle, color: Colors.white),
                                      const SizedBox(width: 10),
                                      const Text('Percakapan berhasil dihapus'),
                                    ],
                                  ),
                                  backgroundColor: Colors.green,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                            }
                          } catch (e) {
                            print("Error clearing conversation: $e");
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Row(
                                    children: [
                                      const Icon(Icons.error_outline, color: Colors.white),
                                      const SizedBox(width: 10),
                                      const Text('Gagal menghapus percakapan'),
                                    ],
                                  ),
                                  backgroundColor: Colors.red,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                            }
                          }
                        },
                        borderRadius: BorderRadius.circular(15),
                        child: Ink(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.red.shade400,
                                Colors.red.shade600,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Container(
                            alignment: Alignment.center,
                            child: const Text(
                              'Hapus',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Widget untuk item opsi tanpa animasi
  Widget _buildOptionItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: BoxDecoration(
        color: _isDarkMode ? Colors.grey[800]!.withOpacity(0.5) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        // Menghilangkan shadow untuk optimasi
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: theme.primaryColor,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: _isDarkMode ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios_rounded, 
                  color: _isDarkMode ? Colors.grey[600] : Colors.grey[400], 
                  size: 14
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    
    // Jika flag _shouldScrollToBottom == true, scroll otomatis SETELAH build selesai
    if (_shouldScrollToBottom) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
        setState(() {
          _shouldScrollToBottom = false; // Reset flag setelah scroll
        });
      });
    }
    
    return Scaffold(
      backgroundColor: Colors.transparent,
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
            // Background elements (disederhanakan)
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
              child: Column(
                children: [
                  // Custom AppBar
                  _buildAppBar(),
                  
                  // Main content area
                  Expanded(
                    child: Consumer<ChatbotProvider>(
                      builder: (context, provider, _) {
                        if (provider.isLoading && provider.messages.isEmpty) {
                          return _buildLoadingState();
                        }
            
                        return Column(
                          children: [
                            // Status koneksi
                            if (provider.isOffline)
                              ConnectionStatusBanner(
                                isDarkMode: _isDarkMode,
                                message: 'Anda sedang offline. Pesan akan dikirim saat koneksi tersedia.',
                              ),
            
                            // Daftar pesan
                            Expanded(
                              child: provider.messages.isEmpty
                                ? _buildEmptyState()
                                : Stack(
                                  children: [
                                    GestureDetector(
                                      onTap: () => FocusScope.of(context).unfocus(),
                                      child: ListView.builder(
                                        controller: _scrollController,
                                        padding: const EdgeInsets.all(16),
                                        itemCount: provider.messages.length + (_isTyping ? 1 : 0),
                                        itemBuilder: (context, index) {
                                          if (index < provider.messages.length) {
                                            return _buildMessageItem(provider.messages[index]);
                                          } else {
                                            // Efek mengetik
                                            return const TypingIndicator();
                                          }
                                        },
                                      ),
                                    ),
            
                                    // Tombol scroll ke bawah (hanya tampilkan jika perlu)
                                    if (_showScrollButton)
                                      Positioned(
                                        right: 16,
                                        bottom: 16,
                                        child: Container(
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(25),
                                            boxShadow: [
                                              BoxShadow(
                                                color: theme.primaryColor.withOpacity(0.2), // Mengurangi opasitas
                                                blurRadius: 8, // Mengurangi blur
                                                offset: const Offset(0, 3), // Mengurangi offset
                                                spreadRadius: -3, // Mengurangi spread
                                              ),
                                            ],
                                          ),
                                          child: FloatingActionButton(
                                            heroTag: 'chatbotScreenFab',
                                            mini: true,
                                            backgroundColor: theme.primaryColor,
                                            foregroundColor: Colors.white,
                                            elevation: 0,
                                            child: const Icon(
                                              Icons.keyboard_arrow_down,
                                            ),
                                            onPressed: () {
                                              HapticFeedback.selectionClick();
                                              _scrollToBottom();
                                            },
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                            ),
            
                            // Saran pertanyaan
                            if (provider.suggestedQuestions.isNotEmpty)
                              SuggestedQuestions(
                                questions: provider.suggestedQuestions,
                                onTap: (question) {
                                  HapticFeedback.selectionClick();
                                  provider.sendSuggestedQuestion(question);
                                  _shouldScrollToBottom = true; // Set flag untuk scroll setelah kirim pertanyaan
                                },
                              ),
            
                            // Input pesan
                            _buildMessageInput(provider),
                          ],
                        );
                      },
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
  
  Widget _buildAppBar() {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03), // Mengurangi opasitas
            blurRadius: 6, // Mengurangi blur
            offset: const Offset(0, 3), // Mengurangi offset
          ),
        ],
      ),
      child: Row(
        children: [
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(15),
            child: InkWell(
              borderRadius: BorderRadius.circular(15),
              onTap: () {
                Navigator.pop(context);
              },
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  // Menghilangkan shadow untuk optimasi
                ),
                child: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 22,
                  color: theme.primaryColor,
                ),
              ),
            ),
          ),
          const SizedBox(width: 15),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: theme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Icon(
              Icons.support_agent_rounded,
              color: theme.primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Chatbot Ferry Booking',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '24/7 Layanan Pelanggan',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.normal,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(15),
            child: InkWell(
              borderRadius: BorderRadius.circular(15),
              onTap: _showOptionsMenu,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  // Menghilangkan shadow untuk optimasi
                ),
                child: Icon(
                  Icons.more_horiz_rounded,
                  size: 22,
                  color: theme.primaryColor,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMessageInput(ChatbotProvider provider) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03), // Mengurangi opasitas
            blurRadius: 6, // Mengurangi blur
            offset: const Offset(0, -3), // Mengurangi offset
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Tombol mikrofon
            Container(
              decoration: BoxDecoration(
                color: theme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
                // Menghilangkan shadow untuk optimasi
              ),
              child: IconButton(
                icon: Icon(
                  Icons.mic_rounded,
                  color: theme.primaryColor.withOpacity(
                    provider.isSending || provider.isOffline ? 0.4 : 0.8,
                  ),
                ),
                onPressed: provider.isSending || provider.isOffline
                  ? null
                  : () {
                    HapticFeedback.selectionClick();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Input suara akan segera tersedia!'),
                        backgroundColor: theme.primaryColor,
                      ),
                    );
                  },
              ),
            ),
            
            // Text field
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.grey.shade200,
                    width: 1,
                  ),
                  // Menghilangkan shadow untuk optimasi
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageController,
                        style: TextStyle(
                          color: Colors.black87,
                          fontSize: 15,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Tulis pesan Anda...',
                          hintStyle: TextStyle(
                            color: Colors.grey[400],
                            fontSize: 15,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: Colors.transparent,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                        enabled: !provider.isSending && !provider.isOffline,
                      ),
                    ),
                    if (_messageController.text.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: () {
                          setState(() {
                            _messageController.clear();
                          });
                        },
                        splashRadius: 20,
                        color: Colors.grey[600],
                      ),
                  ],
                ),
              ),
            ),
            
            // Tombol kirim
            const SizedBox(width: 12),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: theme.primaryColor.withOpacity(
                      provider.isSending || provider.isOffline ? 0 : 0.2,
                    ),
                    spreadRadius: -3, // Mengurangi spread
                    blurRadius: 8, // Mengurangi blur
                    offset: const Offset(0, 3), // Mengurangi offset
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(15),
                child: InkWell(
                  onTap: provider.isSending || provider.isOffline ? null : _sendMessage,
                  borderRadius: BorderRadius.circular(15),
                  child: Ink(
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: provider.isSending || provider.isOffline
                          ? [Colors.grey, Colors.grey]
                          : [theme.primaryColor.withBlue(255), theme.primaryColor],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: provider.isSending
                      ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                      : const Icon(
                        Icons.send_rounded, 
                        color: Colors.white,
                        size: 22,
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

  // Loading state dengan shimmer effect
  Widget _buildLoadingState() {
    // Optimasi Shimmer effect
    return Shimmer.fromColors(
      baseColor: _isDarkMode ? Colors.grey[800]! : Colors.grey[300]!,
      highlightColor: _isDarkMode ? Colors.grey[700]! : Colors.grey[100]!,
      period: const Duration(milliseconds: 1500), // Memperlambat animasi untuk mengurangi beban CPU
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 3, // Mengurangi jumlah item
        itemBuilder: (_, __) => Align(
          alignment: __ % 2 == 0 ? Alignment.centerRight : Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Container(
              width: 250,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // Empty state dengan minimal animasi yang lebih ringkas
  Widget _buildEmptyState() {
    final theme = Theme.of(context);
    
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: theme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(30),
          ),
          child: Icon(
            Icons.chat_bubble_outline_rounded,
            size: 80,
            color: theme.primaryColor,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Selamat datang di Chatbot Ferry Booking',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: _isDarkMode ? Colors.white : Colors.grey[800],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Text(
            'Tanyakan informasi tentang jadwal, pemesanan tiket, atau bantuan lainnya.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
              fontSize: 15,
            ),
          ),
        ),
        const SizedBox(height: 32),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(25),
            boxShadow: [
              BoxShadow(
                color: theme.primaryColor.withOpacity(0.2), // Mengurangi opasitas
                blurRadius: 8, // Mengurangi blur
                offset: const Offset(0, 3), // Mengurangi offset
                spreadRadius: -3, // Mengurangi spread
              ),
            ],
          ),
          child: ElevatedButton.icon(
            onPressed: () {
              _messageController.text = 'Halo, saya butuh bantuan';
              _sendMessage();
            },
            icon: const Icon(Icons.chat_rounded),
            label: const Text('Mulai Percakapan'),
            style: ElevatedButton.styleFrom(
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(25),
              ),
              elevation: 0,
              backgroundColor: theme.primaryColor,
            ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  // Item pesan dengan animasi minimal
  Widget _buildMessageItem(ChatMessage message) {
    final isFailedMessage = message.messageStatus == 'failed';
    final isPendingMessage = message.messageStatus == 'pending';
    final theme = Theme.of(context);

    // Tambahkan jarak yang lebih besar jika pesan dari pengirim berbeda
    // (untuk memisahkan 'grup' pesan)
    bool showGroupSeparator = false;
    if (message != _chatbotProvider.messages.first) {
      final prevIndex = _chatbotProvider.messages.indexOf(message) - 1;
      final prevMessage = _chatbotProvider.messages[prevIndex];
      showGroupSeparator = prevMessage.isFromUser != message.isFromUser;
    }

    return Padding(
      padding: EdgeInsets.only(
        top: showGroupSeparator ? 16.0 : 4.0,
        bottom: 4.0,
      ),
      child: Column(
        crossAxisAlignment: message.isFromUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          // Header untuk grup pesan baru
          if (showGroupSeparator)
            Padding(
              padding: const EdgeInsets.only(
                bottom: 8.0,
                left: 8.0,
                right: 8.0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: message.isFromUser 
                        ? theme.primaryColor.withOpacity(0.1)
                        : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      message.isFromUser ? Icons.person : Icons.support_agent_rounded,
                      size: 14,
                      color: message.isFromUser ? theme.primaryColor : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    message.isFromUser ? 'Anda' : 'Chatbot',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: message.isFromUser ? theme.primaryColor : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),

          // Jika ada indikator status untuk pesan yang gagal atau pending
          if (isFailedMessage || isPendingMessage)
            Padding(
              padding: const EdgeInsets.only(
                bottom: 4.0,
                left: 8.0,
                right: 8.0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: message.isFromUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: (isFailedMessage ? Colors.red : Colors.orange).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isFailedMessage ? Icons.error_outline : Icons.access_time_rounded,
                          size: 12,
                          color: isFailedMessage ? Colors.red : Colors.orange,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isFailedMessage ? 'Gagal terkirim' : 'Menunggu koneksi',
                          style: TextStyle(
                            fontSize: 11,
                            color: isFailedMessage ? Colors.red : Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Bubble chat dengan efek animasi minimal
          ChatBubble(
            clipper: ChatBubbleClipper6(
              type: message.isFromUser ? BubbleType.sendBubble : BubbleType.receiverBubble,
              radius: 20,
            ),
            alignment: message.isFromUser ? Alignment.topRight : Alignment.topLeft,
            margin: const EdgeInsets.only(top: 6),
            backGroundColor: isFailedMessage
              ? Colors.red[100]
              : isPendingMessage
              ? Colors.orange[100]
              : message.isFromUser
              ? theme.primaryColor
              : Colors.white,
            elevation: 1, // Mengurangi elevasi
            shadowColor: Colors.black.withOpacity(0.05), // Mengurangi opasitas shadow
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.7,
              ),
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
              child: _buildMessageContent(message),
            ),
          ),

          // Info waktu dan status pengiriman
          Padding(
            padding: const EdgeInsets.only(top: 4.0, left: 8.0, right: 8.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: message.isFromUser ? MainAxisAlignment.end : MainAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _formatTime(message.createdAt),
                        style: TextStyle(
                          fontSize: 10,
                          color: _isDarkMode ? Colors.grey[400] : Colors.grey[700],
                        ),
                      ),
                      // Status pesan berupa icon centang
                      if (message.isFromUser && !isFailedMessage && !isPendingMessage) ...[
                        const SizedBox(width: 4),
                        Icon(
                          Icons.check,
                          size: 12,
                          color: _isDarkMode ? Colors.grey[400] : Colors.grey[700],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tombol retry untuk pesan yang gagal
          if (isFailedMessage)
            Padding(
              padding: const EdgeInsets.only(top: 4, right: 8.0),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.1), // Mengurangi opasitas
                      blurRadius: 5, // Mengurangi blur
                      offset: const Offset(0, 2), // Mengurangi offset
                      spreadRadius: -2, // Mengurangi spread
                    ),
                  ],
                ),
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(15),
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      try {
                        _chatbotProvider.resendMessage(message.message);
                        _shouldScrollToBottom = true; // Set flag untuk scroll otomatis setelah kirim ulang
                      } catch (e) {
                        print("Error resending message: $e");
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Row(
                                children: [
                                  const Icon(Icons.error_outline, color: Colors.white),
                                  const SizedBox(width: 10),
                                  const Text('Gagal mengirim ulang pesan'),
                                ],
                              ),
                              backgroundColor: Colors.red,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          );
                        }
                      }
                    },
                    borderRadius: BorderRadius.circular(15),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            theme.primaryColor.withBlue(255),
                            theme.primaryColor,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.refresh_rounded, 
                            size: 14, 
                            color: Colors.white
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Coba lagi',
                            style: TextStyle(
                              color: Colors.white, 
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

          // Tombol feedback jika pesan dari chatbot
          if (!message.isFromUser && message.id > 0)
            Padding(
              padding: const EdgeInsets.only(top: 8, left: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green.withOpacity(0.1), // Mengurangi opasitas
                          blurRadius: 5, // Mengurangi blur
                          offset: const Offset(0, 2), // Mengurangi offset
                          spreadRadius: -2, // Mengurangi spread
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                      child: InkWell(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          _showFeedbackDialog(message.id, true);
                        },
                        borderRadius: BorderRadius.circular(15),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.green.shade400,
                                Colors.green.shade600,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(
                                Icons.thumb_up_rounded, 
                                size: 14, 
                                color: Colors.white
                              ),
                              SizedBox(width: 6),
                              Text(
                                'Membantu',
                                style: TextStyle(
                                  color: Colors.white, 
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                      child: InkWell(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          _showFeedbackDialog(message.id, false);
                        },
                        borderRadius: BorderRadius.circular(15),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(15),
                            border: Border.all(color: Colors.red, width: 1.5),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(
                                Icons.thumb_down_rounded, 
                                size: 14, 
                                color: Colors.red
                              ),
                              SizedBox(width: 6),
                              Text(
                                'Tidak Membantu',
                                style: TextStyle(
                                  color: Colors.red, 
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
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
    );
  }

  // Konten pesan dengan dukungan markdown
  Widget _buildMessageContent(ChatMessage message) {
    // Cek apakah pesan berisi markdown
    final hasMarkdown =
        message.message.contains('**') ||
        message.message.contains('*') ||
        message.message.contains('__') ||
        message.message.contains('_') ||
        message.message.contains('#') ||
        message.message.contains('[') ||
        message.message.contains('](') ||
        message.message.contains('```') ||
        message.message.contains('`') ||
        message.message.contains('- ') ||
        message.message.contains('1. ');

    if (hasMarkdown && !message.isFromUser) {
      return MarkdownBody(
        data: message.message,
        styleSheet: MarkdownStyleSheet(
          p: TextStyle(
            color: message.isFromUser ? Colors.white : (_isDarkMode ? Colors.white : Colors.black),
            fontSize: 15,
          ),
          a: TextStyle(
            color: message.isFromUser ? Colors.white70 : Theme.of(context).primaryColor,
          ),
          code: TextStyle(
            backgroundColor: _isDarkMode ? Colors.grey[700] : Colors.grey[200],
            color: _isDarkMode ? Colors.grey[300] : Colors.black87,
            fontFamily: 'monospace',
          ),
          codeblockDecoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[800] : Colors.grey[200],
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        onTapLink: (text, href, title) {
          if (href != null) {
            launchUrl(Uri.parse(href));
          }
        },
      );
    }

    // Default text rendering
    return SelectableText(
      message.message,
      style: TextStyle(
        color: message.isFromUser ? Colors.white : (_isDarkMode ? Colors.white : Colors.black),
        fontSize: 15,
      ),
    );
  }

  // Format waktu pesan
  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(time.year, time.month, time.day);

    if (messageDate == today) {
      // Format jam:menit untuk hari ini
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else if (messageDate == yesterday) {
      // "Kemarin" untuk pesan kemarin
      return 'Kemarin, ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else {
      // Format tanggal lengkap untuk pesan lama
      return '${time.day}/${time.month}/${time.year}, ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    _messageController.dispose();
    _animationController.dispose();
    super.dispose();
  }
}