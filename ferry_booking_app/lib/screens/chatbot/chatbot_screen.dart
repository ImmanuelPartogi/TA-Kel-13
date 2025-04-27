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
import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:ferry_booking_app/utils/theme_helper.dart';
import 'package:ferry_booking_app/widgets/connection_status_banner.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:url_launcher/url_launcher.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({Key? key}) : super(key: key);

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late ChatbotProvider _chatbotProvider;
  late AuthProvider _authProvider;
  bool _isInitialized = false;
  bool _showScrollButton = false;
  bool _isTyping = false;
  late AnimationController _animationController;
  late Animation<double> _animation;
  
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
    
    // Inisialisasi controller animasi
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
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
      await _chatbotProvider.loadConversation();
      _isInitialized = true;
      _scrollToBottom();
    }
  }
  
  // Scroll ke pesan terbaru
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
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
    
    await _chatbotProvider.sendMessage(message);
    
    setState(() {
      _isTyping = false;
    });
    
    _scrollToBottom();
  }
  
  // Dialog feedback dengan animasi
  void _showFeedbackDialog(int messageId, bool isHelpful) {
    final feedbackController = TextEditingController();
    
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(
              isHelpful ? Icons.sentiment_satisfied_alt : Icons.sentiment_dissatisfied,
              color: isHelpful ? Colors.green : Colors.orange,
            ),
            const SizedBox(width: 10),
            Text(isHelpful ? 'Terima kasih!' : 'Maaf kamu tidak terbantu'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isHelpful
                  ? 'Kami senang dapat membantu Anda.'
                  : 'Mohon bantu kami meningkatkan layanan chatbot.',
              style: TextStyle(color: _isDarkMode ? Colors.grey[300] : Colors.grey[700]),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: feedbackController,
              decoration: InputDecoration(
                hintText: isHelpful
                    ? 'Berikan saran tambahan (opsional)'
                    : 'Mohon beri tahu kami bagaimana kami dapat membantu',
                border: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: const BorderRadius.all(Radius.circular(12)),
                  borderSide: BorderSide(color: _primaryColor, width: 2),
                ),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Batal', style: TextStyle(color: _isDarkMode ? Colors.grey[400] : Colors.grey[700])),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isHelpful ? Colors.green : _primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              elevation: 2,
            ),
            onPressed: () {
              _chatbotProvider.sendFeedback(
                messageId,
                isHelpful,
                feedbackText: feedbackController.text.trim().isNotEmpty
                    ? feedbackController.text.trim()
                    : null,
              );
              Navigator.pop(context);
              
              // Animasi feedback berhasil dikirim
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.white),
                      const SizedBox(width: 10),
                      const Text('Terima kasih atas feedback Anda!'),
                    ],
                  ),
                  behavior: SnackBarBehavior.floating,
                  backgroundColor: isHelpful ? Colors.green[600] : _primaryColor,
                  duration: const Duration(seconds: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  margin: const EdgeInsets.all(8),
                ),
              );
            },
            child: const Text('Kirim'),
          ),
        ],
      ),
    );
  }
  
  // Menu opsi dengan animasi
  void _showOptionsMenu() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _isDarkMode ? Colors.grey[850] : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
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
                const SizedBox(height: 16),
                Text(
                  'Pengaturan Chatbot',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
                const SizedBox(height: 16),
                _buildAnimatedOptionItem(
                  context: context,
                  icon: Icons.restart_alt,
                  title: 'Mulai Percakapan Baru',
                  subtitle: 'Hapus semua pesan dan mulai ulang',
                  onTap: () {
                    Navigator.pop(context);
                    _showResetConfirmation();
                  },
                  index: 0,
                ),
                const Divider(),
                _buildAnimatedOptionItem(
                  context: context,
                  icon: Icons.lightbulb_outline,
                  title: 'Pertanyaan Populer',
                  subtitle: 'Lihat pertanyaan yang sering ditanyakan',
                  onTap: () {
                    Navigator.pop(context);
                    _showPopularQuestions();
                  },
                  index: 1,
                ),
                const Divider(),
                _buildAnimatedOptionItem(
                  context: context,
                  icon: Icons.color_lens_outlined,
                  title: 'Tampilan',
                  subtitle: 'Ubah tema chatbot',
                  onTap: () {
                    Navigator.pop(context);
                    _showThemeSelector();
                  },
                  index: 2,
                ),
                if (_authProvider.isLoggedIn) ...[
                  const Divider(),
                  _buildAnimatedOptionItem(
                    context: context,
                    icon: Icons.history,
                    title: 'Riwayat Percakapan',
                    subtitle: 'Lihat percakapan sebelumnya',
                    onTap: () {
                      Navigator.pop(context);
                      _showConversationHistory();
                    },
                    index: 3,
                  ),
                ],
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }
  
  // Tampilkan dialog tema
  void _showThemeSelector() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Pilih Tema'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildThemeOption(
              title: 'Light Mode',
              icon: Icons.light_mode,
              isSelected: !_isDarkMode,
              onTap: () {
                Navigator.pop(context);
                ThemeHelper.setLightMode(context);
                _initializeTheme();
              },
            ),
            const SizedBox(height: 8),
            _buildThemeOption(
              title: 'Dark Mode',
              icon: Icons.dark_mode,
              isSelected: _isDarkMode,
              onTap: () {
                Navigator.pop(context);
                ThemeHelper.setDarkMode(context);
                _initializeTheme();
              },
            ),
            const SizedBox(height: 8),
            _buildThemeOption(
              title: 'Sistem (Auto)',
              icon: Icons.settings_suggest,
              isSelected: false,
              onTap: () {
                Navigator.pop(context);
                ThemeHelper.setSystemMode(context);
                _initializeTheme();
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
        ],
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? _primaryColor.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? _primaryColor : Colors.grey.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? _primaryColor : null,
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? _primaryColor : null,
              ),
            ),
            const Spacer(),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: _primaryColor,
              ),
          ],
        ),
      ),
    );
  }
  
  // Tampilkan pertanyaan populer
  void _showPopularQuestions() {
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
      backgroundColor: _isDarkMode ? Colors.grey[850] : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 12.0),
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
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(
                      Icons.trending_up,
                      color: _primaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Pertanyaan Populer',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: _isDarkMode ? Colors.white : Colors.black,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: popularQuestions.length,
                  itemBuilder: (context, index) {
                    return _buildPopularQuestionItem(
                      question: popularQuestions[index],
                      index: index,
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
        );
      },
    );
  }
  
  // Item pertanyaan populer
  Widget _buildPopularQuestionItem({
    required String question,
    required int index,
    required VoidCallback onTap,
  }) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 200 + (index * 50)),
      builder: (context, double value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Card(
        color: _isDarkMode ? Colors.grey[800] : Colors.white,
        elevation: 2,
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Icon(
                  Icons.question_answer_outlined,
                  color: _primaryColor.withOpacity(0.7),
                  size: 20,
                ),
                const SizedBox(width: 12),
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
                  Icons.arrow_forward_ios,
                  color: Colors.grey,
                  size: 14,
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
            Icon(Icons.info_outline, color: Colors.white),
            const SizedBox(width: 10),
            const Text('Fitur akan segera tersedia!'),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: _secondaryColor,
        duration: const Duration(seconds: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        margin: const EdgeInsets.all(8),
      ),
    );
  }
  
  // Konfirmasi reset percakapan dengan animasi
  void _showResetConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.orange),
            const SizedBox(width: 10),
            const Text('Mulai Percakapan Baru?'),
          ],
        ),
        content: const Text(
          'Semua pesan di percakapan ini akan dihapus dan tidak dapat dipulihkan. Lanjutkan?'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              elevation: 2,
            ),
            onPressed: () {
              Navigator.pop(context);
              // Haptic feedback saat reset
              HapticFeedback.mediumImpact();
              _chatbotProvider.clearConversation();
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }
  
  // Widget untuk item opsi dengan animasi
  Widget _buildAnimatedOptionItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required int index,
  }) {
    return TweenAnimationBuilder(
      tween: Tween<double>(begin: 0, end: 1),
      duration: Duration(milliseconds: 300 + (index * 100)),
      builder: (context, double value, child) {
        return Transform.translate(
          offset: Offset(20 * (1 - value), 0),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: ListTile(
        leading: Icon(icon, color: _primaryColor),
        title: Text(
          title,
          style: TextStyle(
            color: _isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
          ),
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _backgroundColor,
      appBar: AppBar(
        backgroundColor: _isDarkMode ? Colors.grey[900] : Colors.white,
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.support_agent,
                color: _primaryColor,
                size: 24,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Chatbot Ferry Booking',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: _isDarkMode ? Colors.white : Colors.black87,
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
                        color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        elevation: _isDarkMode ? 0 : 1,
        actions: [
          IconButton(
            icon: Icon(
              Icons.more_vert,
              color: _isDarkMode ? Colors.white : Colors.black87,
            ),
            onPressed: _showOptionsMenu,
          ),
        ],
      ),
      body: Consumer<ChatbotProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.messages.isEmpty) {
            return _buildLoadingState();
          }
          
          // Scroll setelah build jika ada pesan
          if (provider.messages.isNotEmpty) {
            WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
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
                          
                          // Tombol scroll ke bawah dengan animasi
                          AnimatedBuilder(
                            animation: _animation,
                            builder: (context, child) {
                              return Positioned(
                                right: 16,
                                bottom: 16,
                                child: ScaleTransition(
                                  scale: _animation,
                                  child: FloatingActionButton(
                                    mini: true,
                                    backgroundColor: _primaryColor.withOpacity(0.9),
                                    foregroundColor: Colors.white,
                                    elevation: 4,
                                    child: const Icon(Icons.keyboard_arrow_down),
                                    onPressed: () {
                                      HapticFeedback.selectionClick();
                                      _scrollToBottom();
                                    },
                                  ),
                                ),
                              );
                            },
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
                  },
                  // isDarkMode: _isDarkMode,
                  // primaryColor: _primaryColor,
                ),
              
              // Input pesan
              Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: _isDarkMode ? Colors.grey[900] : Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      spreadRadius: 1,
                      blurRadius: 3,
                      offset: const Offset(0, -1),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Row(
                    children: [
                      // Tombol mikrofon
                      Container(
                        decoration: BoxDecoration(
                          color: _primaryColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: Icon(
                            Icons.mic,
                            color: _primaryColor.withOpacity(provider.isSending || provider.isOffline ? 0.4 : 0.8),
                          ),
                          onPressed: provider.isSending || provider.isOffline 
                            ? null
                            : () {
                                HapticFeedback.selectionClick();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Row(
                                      children: [
                                        Icon(Icons.info_outline, color: Colors.white),
                                        const SizedBox(width: 10),
                                        const Text('Input suara akan segera tersedia!'),
                                      ],
                                    ),
                                    behavior: SnackBarBehavior.floating,
                                    backgroundColor: _primaryColor,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    margin: const EdgeInsets.all(8),
                                  ),
                                );
                              },
                        ),
                      ),
                      // Text field
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: _isDarkMode ? Colors.grey[800] : Colors.grey[100],
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _messageController,
                                  style: TextStyle(
                                    color: _isDarkMode ? Colors.white : Colors.black87,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: 'Tulis pesan Anda...',
                                    hintStyle: TextStyle(
                                      color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(24),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: Colors.transparent,
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 8,
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
                                  color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Tombol kirim
                      Container(
                        decoration: BoxDecoration(
                          color: provider.isSending || provider.isOffline
                              ? Colors.grey
                              : _primaryColor,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: _primaryColor.withOpacity(provider.isSending || provider.isOffline ? 0 : 0.3),
                              spreadRadius: 1,
                              blurRadius: 3,
                            ),
                          ],
                        ),
                        child: IconButton(
                          onPressed: provider.isSending || provider.isOffline ? null : _sendMessage,
                          icon: provider.isSending
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(
                                  Icons.send,
                                  color: Colors.white,
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
  
  // Loading state dengan shimmer effect
  Widget _buildLoadingState() {
    return Shimmer.fromColors(
      baseColor: _isDarkMode ? Colors.grey[800]! : Colors.grey[300]!,
      highlightColor: _isDarkMode ? Colors.grey[700]! : Colors.grey[100]!,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        itemBuilder: (_, __) => Align(
          alignment: __ % 2 == 0 ? Alignment.centerRight : Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Container(
              width: 250,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  // Empty state dengan animasi dan ilustrasi
  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        TweenAnimationBuilder(
          tween: Tween<double>(begin: 0, end: 1),
          duration: const Duration(milliseconds: 800),
          builder: (context, double value, child) {
            return Transform.scale(
              scale: 0.8 + (value * 0.2),
              child: Opacity(
                opacity: value,
                child: child,
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: _primaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.chat_bubble_outline,
              size: 80,
              color: _primaryColor,
            ),
          ),
        ),
        const SizedBox(height: 24),
        TweenAnimationBuilder(
          tween: Tween<double>(begin: 0, end: 1),
          duration: const Duration(milliseconds: 1000),
          builder: (context, double value, child) {
            return Opacity(
              opacity: value,
              child: Transform.translate(
                offset: Offset(0, 20 * (1 - value)),
                child: child,
              ),
            );
          },
          child: Text(
            'Selamat datang di Chatbot Ferry Booking',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: _isDarkMode ? Colors.white : Colors.grey[800],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: AnimatedTextKit(
            animatedTexts: [
              TypewriterAnimatedText(
                'Tanyakan informasi tentang jadwal, pemesanan tiket, atau bantuan lainnya.',
                textAlign: TextAlign.center,
                textStyle: TextStyle(
                  color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
                  fontSize: 14,
                ),
                speed: const Duration(milliseconds: 50),
              ),
            ],
            totalRepeatCount: 1,
            displayFullTextOnTap: true,
          ),
        ),
        const SizedBox(height: 32),
        TweenAnimationBuilder(
          tween: Tween<double>(begin: 0, end: 1),
          duration: const Duration(milliseconds: 1200),
          builder: (context, double value, child) {
            return Opacity(
              opacity: value,
              child: Transform.translate(
                offset: Offset(0, 20 * (1 - value)),
                child: child,
              ),
            );
          },
          child: ElevatedButton.icon(
            onPressed: () {
              _messageController.text = 'Halo, saya butuh bantuan';
              _sendMessage();
            },
            icon: const Icon(Icons.chat),
            label: const Text('Mulai Percakapan'),
            style: ElevatedButton.styleFrom(
              backgroundColor: _primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              elevation: 4,
            ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }
  
  // Item pesan dengan berbagai status dan format
  Widget _buildMessageItem(ChatMessage message) {
    final isFailedMessage = message.messageStatus == 'failed';
    final isPendingMessage = message.messageStatus == 'pending';
    
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
        crossAxisAlignment: message.isFromUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          // Header untuk grup pesan baru
          if (showGroupSeparator)
            Padding(
              padding: const EdgeInsets.only(bottom: 4.0, left: 8.0, right: 8.0),
              child: Text(
                message.isFromUser ? 'Anda' : 'Chatbot',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: _isDarkMode ? Colors.grey[400] : Colors.grey[600],
                ),
              ),
            ),
            
          // Jika ada indikator status untuk pesan yang gagal atau pending
          if (isFailedMessage || isPendingMessage)
            Padding(
              padding: const EdgeInsets.only(bottom: 4.0, left: 8.0, right: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: message.isFromUser 
                    ? MainAxisAlignment.end 
                    : MainAxisAlignment.start,
                children: [
                  Icon(
                    isFailedMessage ? Icons.error_outline : Icons.access_time,
                    size: 12,
                    color: isFailedMessage ? Colors.red : Colors.orange,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isFailedMessage ? 'Gagal terkirim' : 'Menunggu koneksi',
                    style: TextStyle(
                      fontSize: 10,
                      color: isFailedMessage ? Colors.red : Colors.orange,
                    ),
                  ),
                ],
              ),
            ),
          
          // Bubble chat dengan efek animasi saat muncul
          TweenAnimationBuilder(
            tween: Tween<double>(begin: 0.8, end: 1.0),
            duration: const Duration(milliseconds: 300),
            builder: (context, double value, child) {
              return Transform.scale(
                scale: value,
                alignment: message.isFromUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Opacity(
                  opacity: value,
                  child: child,
                ),
              );
            },
            child: ChatBubble(
              clipper: ChatBubbleClipper6(
                type: message.isFromUser 
                  ? BubbleType.sendBubble
                  : BubbleType.receiverBubble,
                radius: 16,
              ),
              alignment: message.isFromUser 
                  ? Alignment.topRight
                  : Alignment.topLeft,
              margin: const EdgeInsets.only(top: 6),
              backGroundColor: isFailedMessage
                  ? Colors.red[100]
                  : isPendingMessage
                      ? Colors.orange[100]
                      : message.isFromUser
                          ? _userBubbleColor
                          : _botBubbleColor,
              child: Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.7,
                ),
                child: _buildMessageContent(message),
              ),
            ),
          ),
          
          // Info waktu dan status pengiriman
          Padding(
            padding: const EdgeInsets.only(top: 2.0, left: 8.0, right: 8.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: message.isFromUser 
                  ? MainAxisAlignment.end 
                  : MainAxisAlignment.start,
              children: [
                Text(
                  _formatTime(message.createdAt),
                  style: TextStyle(
                    fontSize: 10,
                    color: _isDarkMode ? Colors.grey[500] : Colors.grey[600],
                  ),
                ),
                // Status pesan berupa icon centang
                if (message.isFromUser && !isFailedMessage && !isPendingMessage) ...[
                  const SizedBox(width: 4),
                  Icon(
                    Icons.check,
                    size: 12,
                    color: _isDarkMode ? Colors.grey[500] : Colors.grey[600],
                  ),
                ],
              ],
            ),
          ),
          
          // Tombol retry untuk pesan yang gagal
          if (isFailedMessage)
            Padding(
              padding: const EdgeInsets.only(top: 4, right: 8.0),
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  _chatbotProvider.resendMessage(message.message);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Icon(
                        Icons.refresh,
                        size: 14,
                        color: _primaryColor,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Coba lagi',
                        style: TextStyle(
                          color: _primaryColor,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          
          // Tombol feedback jika pesan dari chatbot
          if (!message.isFromUser && message.id > 0)
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      _showFeedbackDialog(message.id, true);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _isDarkMode ? Colors.grey[800] : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.green,
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.thumb_up,
                            size: 14,
                            color: Colors.green,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Membantu',
                            style: TextStyle(
                              color: Colors.green,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      _showFeedbackDialog(message.id, false);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _isDarkMode ? Colors.grey[800] : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.red,
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.thumb_down,
                            size: 14,
                            color: Colors.red,
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'Tidak Membantu',
                            style: TextStyle(
                              color: Colors.red,
                              fontSize: 12,
                            ),
                          ),
                        ],
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
    final hasMarkdown = message.message.contains('**') || 
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
          ),
          a: TextStyle(
            color: message.isFromUser ? Colors.white70 : _primaryColor,
          ),
          code: TextStyle(
            backgroundColor: _isDarkMode ? Colors.grey[700] : Colors.grey[200],
            color: _isDarkMode ? Colors.grey[300] : Colors.black87,
            fontFamily: 'monospace',
          ),
          codeblockDecoration: BoxDecoration(
            color: _isDarkMode ? Colors.grey[800] : Colors.grey[200],
            borderRadius: BorderRadius.circular(8),
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