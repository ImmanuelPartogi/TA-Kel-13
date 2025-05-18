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
import 'package:ferry_booking_app/utils/theme_helper.dart';
import 'package:ferry_booking_app/widgets/connection_status_banner.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:url_launcher/url_launcher.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({Key? key}) : super(key: key);

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late ChatbotProvider _chatbotProvider;
  late AuthProvider _authProvider;
  bool _isInitialized = false;
  bool _showScrollButton = false;
  bool _isTyping = false;
  bool _shouldScrollToBottom =
      true; // Ubah menjadi true agar selalu scroll ke bawah di awal

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

  // Listener untuk scroll position - dioptimalkan
  void _scrollListener() {
    if (_scrollController.hasClients) {
      final maxScroll = _scrollController.position.maxScrollExtent;
      final currentScroll = _scrollController.position.pixels;
      final shouldShow = currentScroll < maxScroll - 50;

      if (shouldShow != _showScrollButton) {
        setState(() {
          _showScrollButton = shouldShow;
        });
      }
    }
  }

  Future<void> _initializeChat() async {
    if (!_isInitialized) {
      try {
        await _chatbotProvider.loadConversation();
        _isInitialized = true;

        // Pastikan selalu scroll ke bawah setelah inisialisasi
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _scrollToBottom();
        });
      } catch (e) {
        print("Error initializing chat: $e");
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Gagal memuat riwayat percakapan'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  // Scroll ke pesan terbaru - perbaikan untuk memastikan scroll berfungsi
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      try {
        Future.delayed(const Duration(milliseconds: 100), () {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        });
      } catch (e) {
        print("Error scrolling to bottom: $e");
      }
    }
  }

  // Mengirim pesan
  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    // Haptic feedback saat kirim pesan
    HapticFeedback.lightImpact();

    _messageController.clear();
    setState(() {
      _isTyping = true;
    });

    try {
      // Kirim pesan ke server
      await _chatbotProvider.sendMessage(message);

      // Selalu scroll ke bawah setelah mengirim pesan
      _shouldScrollToBottom = true;

      // Pastikan scroll ke bawah setelah UI di-refresh
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
      });
    } catch (e) {
      print("Error sending message: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal mengirim pesan'),
            backgroundColor: Colors.red,
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

  // Dialog feedback
  void _showFeedbackDialog(int messageId, bool isHelpful) {
    final feedbackController = TextEditingController();

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text(
              isHelpful ? 'Terima kasih!' : 'Maaf kamu tidak terbantu',
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isHelpful
                      ? 'Kami senang dapat membantu Anda.'
                      : 'Mohon bantu kami meningkatkan layanan chatbot.',
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: feedbackController,
                  decoration: InputDecoration(
                    hintText:
                        isHelpful
                            ? 'Berikan saran tambahan (opsional)'
                            : 'Mohon beri tahu kami bagaimana kami dapat membantu',
                    border: const OutlineInputBorder(),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                onPressed: () {
                  _chatbotProvider.sendFeedback(
                    messageId,
                    isHelpful,
                    feedbackText:
                        feedbackController.text.trim().isNotEmpty
                            ? feedbackController.text.trim()
                            : null,
                  );
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Terima kasih atas feedback Anda!'),
                      backgroundColor: isHelpful ? Colors.green : _primaryColor,
                    ),
                  );
                },
                child: const Text('Kirim'),
              ),
            ],
          ),
    );
  }

  // Menu opsi
  void _showOptionsMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  height: 5,
                  width: 40,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.restart_alt_rounded,
                      color: _primaryColor,
                    ),
                  ),
                  title: const Text('Mulai Percakapan Baru'),
                  subtitle: const Text('Hapus semua pesan dan mulai ulang'),
                  onTap: () {
                    Navigator.pop(context);
                    _showResetConfirmation();
                  },
                ),
                const Divider(),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.lightbulb_outline_rounded,
                      color: _primaryColor,
                    ),
                  ),
                  title: const Text('Pertanyaan Populer'),
                  subtitle: const Text(
                    'Lihat pertanyaan yang sering ditanyakan',
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    _showPopularQuestions();
                  },
                ),
                const Divider(),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.color_lens_outlined,
                      color: _primaryColor,
                    ),
                  ),
                  title: const Text('Tampilan'),
                  subtitle: const Text('Ubah tema chatbot'),
                  onTap: () {
                    Navigator.pop(context);
                    _showThemeSelector();
                  },
                ),
                if (_authProvider.isLoggedIn) ...[
                  const Divider(),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: _primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.history_rounded, color: _primaryColor),
                    ),
                    title: const Text('Riwayat Percakapan'),
                    subtitle: const Text('Lihat percakapan sebelumnya'),
                    onTap: () {
                      Navigator.pop(context);
                      _showConversationHistory();
                    },
                  ),
                ],
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
      builder:
          (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            title: const Text('Pilih Tema'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SimpleDialogOption(
                  onPressed: () {
                    Navigator.pop(context);
                    ThemeHelper.setLightMode(context);
                    _initializeTheme();
                  },
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.light_mode_rounded,
                        color: Colors.amber,
                      ),
                    ),
                    title: const Text('Light Mode'),
                    trailing: !_isDarkMode ? const Icon(Icons.check) : null,
                  ),
                ),
                SimpleDialogOption(
                  onPressed: () {
                    Navigator.pop(context);
                    ThemeHelper.setDarkMode(context);
                    _initializeTheme();
                  },
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.indigo.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.dark_mode_rounded,
                        color: Colors.indigo,
                      ),
                    ),
                    title: const Text('Dark Mode'),
                    trailing: _isDarkMode ? const Icon(Icons.check) : null,
                  ),
                ),
                SimpleDialogOption(
                  onPressed: () {
                    Navigator.pop(context);
                    ThemeHelper.setSystemMode(context);
                    _initializeTheme();
                  },
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.settings_suggest_rounded,
                        color: Colors.grey,
                      ),
                    ),
                    title: const Text('Sistem (Auto)'),
                  ),
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
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 5,
                width: 40,
                margin: const EdgeInsets.symmetric(
                  vertical: 10,
                  horizontal: 20,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                child: Text(
                  'Pertanyaan Populer',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: _primaryColor,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: popularQuestions.length,
                  itemBuilder: (context, index) {
                    return Container(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _primaryColor.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: _primaryColor.withOpacity(0.1),
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: _primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            Icons.question_answer_rounded,
                            color: _primaryColor,
                          ),
                        ),
                        title: Text(popularQuestions[index]),
                        onTap: () {
                          Navigator.pop(context);
                          _messageController.text = popularQuestions[index];
                          _sendMessage();
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // Tampilkan riwayat percakapan
  void _showConversationHistory() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Fitur akan segera tersedia!'),
        backgroundColor: _secondaryColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Konfirmasi reset percakapan
  void _showResetConfirmation() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            title: const Text('Mulai Percakapan Baru?'),
            content: const Text(
              'Semua pesan di percakapan ini akan dihapus dan tidak dapat dipulihkan. Lanjutkan?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  HapticFeedback.mediumImpact();
                  try {
                    _chatbotProvider.clearConversation();
                    _shouldScrollToBottom = true;

                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Percakapan berhasil dihapus'),
                          backgroundColor: Colors.green,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    print("Error clearing conversation: $e");
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Gagal menghapus percakapan'),
                          backgroundColor: Colors.red,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      );
                    }
                  }
                },
                child: const Text('Hapus'),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Jika flag _shouldScrollToBottom == true, scroll otomatis SETELAH build selesai
    if (_shouldScrollToBottom) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scrollToBottom();
        setState(() {
          _shouldScrollToBottom = false; // Reset flag setelah scroll
        });
      });
    }

    final size = MediaQuery.of(context).size;
    final theme = Theme.of(context);

    return Scaffold(
      // AppBar yang diperbaiki dengan gradien dan styling yang lebih baik
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
              colors: [_primaryColor, _primaryColor.withBlue(245)],
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  // Ganti icon dengan icon chatbot yang lebih sesuai
                  const Icon(
                    Icons.sailing,
                    color: Colors.white,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Vectura',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        Text(
                          'Smart Assistant',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.more_vert, color: Colors.white),
                    onPressed: _showOptionsMenu,
                  ),
                ],
              ),
            ),
          ),
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
            // Elemen background decorative
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
            // Ikon perahu kecil di background (minimal)
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
              bottom: size.height * 0.25,
              left: size.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 22,
                color: theme.primaryColor.withOpacity(0.1),
              ),
            ),

            Column(
              children: [
                // Status koneksi
                Consumer<ChatbotProvider>(
                  builder:
                      (context, provider, _) =>
                          provider.isOffline
                              ? ConnectionStatusBanner(
                                isDarkMode: _isDarkMode,
                                message:
                                    'Anda sedang offline. Pesan akan dikirim saat koneksi tersedia.',
                              )
                              : const SizedBox.shrink(),
                ),

                // Daftar pesan
                Expanded(
                  child: Consumer<ChatbotProvider>(
                    builder: (context, provider, _) {
                      if (provider.isLoading && provider.messages.isEmpty) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      if (provider.messages.isEmpty) {
                        return _buildEmptyState();
                      }

                      return Stack(
                        children: [
                          GestureDetector(
                            onTap: () => FocusScope.of(context).unfocus(),
                            child: ListView.builder(
                              controller: _scrollController,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              itemCount:
                                  provider.messages.length +
                                  (_isTyping ? 1 : 0),
                              itemBuilder: (context, index) {
                                if (index < provider.messages.length) {
                                  return _buildMessageItem(
                                    provider.messages[index],
                                  );
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
                              child: FloatingActionButton(
                                mini: true,
                                backgroundColor: theme.primaryColor,
                                foregroundColor: Colors.white,
                                elevation: 3,
                                child: const Icon(Icons.keyboard_arrow_down),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  _scrollToBottom();
                                },
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                ),

                // Saran pertanyaan
                Consumer<ChatbotProvider>(
                  builder:
                      (context, provider, _) =>
                          provider.suggestedQuestions.isNotEmpty
                              ? Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 4,
                                ),
                                child: SuggestedQuestions(
                                  questions: provider.suggestedQuestions,
                                  onTap: (question) {
                                    HapticFeedback.selectionClick();
                                    provider.sendSuggestedQuestion(question);
                                    _shouldScrollToBottom = true;
                                  },
                                ),
                              )
                              : const SizedBox.shrink(),
                ),

                // Input pesan yang didesain ulang tanpa fitur attachment
                _buildMessageInputArea(),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Area input pesan yang diperbarui dengan tampilan yang lebih bersih dan tanpa attachment button
  Widget _buildMessageInputArea() {
    return Consumer<ChatbotProvider>(
      builder:
          (context, provider, _) => Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, -1),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SafeArea(
              top: false,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Text field utama dengan desain yang selaras
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.grey.shade200,
                          width: 1,
                        ),
                      ),
                      child: TextField(
                        controller: _messageController,
                        minLines: 1,
                        maxLines: 4,
                        textCapitalization: TextCapitalization.sentences,
                        decoration: InputDecoration(
                          hintText: 'Tulis pesan Anda...',
                          hintStyle: TextStyle(
                            color: Colors.grey.shade400,
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          isDense: true,
                        ),
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                        enabled: !provider.isSending && !provider.isOffline,
                      ),
                    ),
                  ),

                  const SizedBox(width: 8),

                  // Tombol kirim dengan desain yang bersih
                  Container(
                    decoration: BoxDecoration(
                      gradient:
                          provider.isSending || provider.isOffline
                              ? LinearGradient(
                                colors: [
                                  Colors.grey.shade400,
                                  Colors.grey.shade500,
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                              : LinearGradient(
                                colors: [
                                  _primaryColor.withBlue(245),
                                  _primaryColor,
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color:
                              provider.isSending || provider.isOffline
                                  ? Colors.grey.withOpacity(0.2)
                                  : _primaryColor.withOpacity(0.2),
                          blurRadius: 3,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon:
                          provider.isSending
                              ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                              : const Icon(Icons.send_rounded),
                      onPressed:
                          provider.isSending || provider.isOffline
                              ? null
                              : _sendMessage,
                      color: Colors.white,
                      padding: const EdgeInsets.all(8),
                      constraints: const BoxConstraints(),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
  }

  // Empty state - disesuaikan dengan tema login
  Widget _buildEmptyState() {
  return Center(
    child: Container(
      padding: const EdgeInsets.all(30),
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  _primaryColor.withBlue(245),
                  _primaryColor,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: _primaryColor.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: const Icon(
              Icons.chat_bubble_outline,
              size: 60,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Selamat Datang di Chatbot Ferry Booking',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            'Tanyakan informasi tentang jadwal, pemesanan tiket, atau bantuan lainnya.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey.shade700,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            icon: const Icon(Icons.chat_rounded),
            label: const Text(
              'MULAI PERCAKAPAN',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: _primaryColor,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              elevation: 3,
            ),
            onPressed: () {
              // Kirim pesan pembuka yang akan memicu respons chatbot yang benar
              _chatbotProvider.sendMessage('Halo');
            },
          ),
        ],
      ),
    ),
  );
}

  // Item pesan dengan tampilan yang lebih bersih
  Widget _buildMessageItem(ChatMessage message) {
    final isFailedMessage = message.messageStatus == 'failed';
    final isPendingMessage = message.messageStatus == 'pending';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment:
            message.isFromUser
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
        children: [
          // Bubble chat
          Container(
            margin: EdgeInsets.only(
              left: message.isFromUser ? 50 : 0,
              right: message.isFromUser ? 0 : 50,
            ),
            child: ChatBubble(
              clipper: ChatBubbleClipper6(
                type:
                    message.isFromUser
                        ? BubbleType.sendBubble
                        : BubbleType.receiverBubble,
                radius: 16,
              ),
              alignment:
                  message.isFromUser ? Alignment.topRight : Alignment.topLeft,
              margin: const EdgeInsets.only(top: 4),
              backGroundColor:
                  isFailedMessage
                      ? Colors.red[100]
                      : isPendingMessage
                      ? Colors.orange[100]
                      : message.isFromUser
                      ? _primaryColor
                      : Colors.white,
              shadowColor: Colors.black.withOpacity(0.05),
              elevation: 3,
              child: Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.7,
                ),
                padding: const EdgeInsets.all(12),
                child: _buildMessageContent(message),
              ),
            ),
          ),

          // Info waktu
          Padding(
            padding: const EdgeInsets.only(top: 6.0, left: 8.0, right: 8.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment:
                  message.isFromUser
                      ? MainAxisAlignment.end
                      : MainAxisAlignment.start,
              children: [
                Text(
                  _formatTime(message.createdAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // Tombol retry untuk pesan yang gagal
          if (isFailedMessage)
            Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: TextButton.icon(
                icon: const Icon(Icons.refresh, size: 14),
                label: const Text('Coba lagi', style: TextStyle(fontSize: 12)),
                style: TextButton.styleFrom(
                  foregroundColor: _primaryColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                onPressed: () {
                  HapticFeedback.selectionClick();
                  try {
                    _chatbotProvider.resendMessage(message.message);
                    _shouldScrollToBottom = true;
                  } catch (e) {
                    print("Error resending message: $e");
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('Gagal mengirim ulang pesan'),
                          backgroundColor: Colors.red,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      );
                    }
                  }
                },
              ),
            ),

          // Tombol feedback
          if (!message.isFromUser && message.id > 0)
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: TextButton.icon(
                      icon: Icon(
                        Icons.thumb_up,
                        size: 14,
                        color: Colors.green.shade700,
                      ),
                      label: Text(
                        'Membantu',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.green.shade700,
                        ),
                      ),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 0,
                        ),
                        minimumSize: const Size(0, 30),
                      ),
                      onPressed: () {
                        HapticFeedback.selectionClick();
                        _showFeedbackDialog(message.id, true);
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: TextButton.icon(
                      icon: Icon(
                        Icons.thumb_down,
                        size: 14,
                        color: Colors.red.shade700,
                      ),
                      label: Text(
                        'Tidak Membantu',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.red.shade700,
                        ),
                      ),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 0,
                        ),
                        minimumSize: const Size(0, 30),
                      ),
                      onPressed: () {
                        HapticFeedback.selectionClick();
                        _showFeedbackDialog(message.id, false);
                      },
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
            color:
                message.isFromUser
                    ? Colors.white
                    : (_isDarkMode ? Colors.white : Colors.black87),
            fontSize: 15,
            height: 1.5,
          ),
          a: TextStyle(
            color: message.isFromUser ? Colors.white70 : _primaryColor,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
          h1: TextStyle(
            color: message.isFromUser ? Colors.white : Colors.black87,
            fontSize: 22,
            fontWeight: FontWeight.bold,
            height: 1.5,
          ),
          h2: TextStyle(
            color: message.isFromUser ? Colors.white : Colors.black87,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            height: 1.5,
          ),
          h3: TextStyle(
            color: message.isFromUser ? Colors.white : Colors.black87,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            height: 1.5,
          ),
          listBullet: TextStyle(
            color: message.isFromUser ? Colors.white : Colors.black87,
            fontSize: 15,
            height: 1.5,
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
        color:
            message.isFromUser
                ? Colors.white
                : (_isDarkMode ? Colors.white : Colors.black87),
        fontSize: 15,
        height: 1.5,
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
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else if (messageDate == yesterday) {
      return 'Kemarin';
    } else {
      return '${time.day}/${time.month}/${time.year}';
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}
