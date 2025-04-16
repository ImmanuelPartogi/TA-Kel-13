import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/config/theme.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({Key? key}) : super(key: key);

  @override
  _NotificationSettingsScreenState createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  bool _isLoading = false;
  
  // Notification preferences
  bool _bookingUpdates = true;
  bool _paymentReminders = true;
  bool _travelUpdates = true;
  bool _promotions = true;
  bool _appUpdates = true;
  
  @override
  void initState() {
    super.initState();
    _loadSettings();
  }
  
  Future<void> _loadSettings() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Implementasi sebenarnya akan mengambil pengaturan notifikasi dari API
      // Untuk sementara, kita akan menggunakan nilai default
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Kode untuk mendapatkan pengaturan dari provider:
      // final user = Provider.of<AuthProvider>(context, listen: false).user;
      // if (user != null && user.notificationSettings != null) {
      //   setState(() {
      //     _bookingUpdates = user.notificationSettings.bookingUpdates;
      //     _paymentReminders = user.notificationSettings.paymentReminders;
      //     _travelUpdates = user.notificationSettings.travelUpdates;
      //     _promotions = user.notificationSettings.promotions;
      //     _appUpdates = user.notificationSettings.appUpdates;
      //   });
      // }
      
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  
  Future<void> _saveSettings() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Implementasi sebenarnya akan menyimpan pengaturan notifikasi ke API
      // Untuk sementara, kita hanya menampilkan snackbar sukses
      await Future.delayed(const Duration(milliseconds: 800));
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pengaturan notifikasi berhasil disimpan'),
            backgroundColor: Colors.green,
          ),
        );
      }
      
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pengaturan Notifikasi'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.notifications_active,
                          size: 64,
                          color: AppTheme.primaryColor,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Kelola Notifikasi',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Pilih jenis notifikasi yang ingin Anda terima',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                  
                  // Notification Settings
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        SwitchListTile(
                          title: const Text('Update Pemesanan'),
                          subtitle: const Text(
                              'Notifikasi tentang perubahan atau konfirmasi pemesanan Anda'),
                          value: _bookingUpdates,
                          onChanged: (value) {
                            setState(() {
                              _bookingUpdates = value;
                            });
                          },
                          secondary: Icon(
                            Icons.confirmation_number,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Pengingat Pembayaran'),
                          subtitle: const Text(
                              'Notifikasi tentang pembayaran yang perlu dilakukan atau status pembayaran'),
                          value: _paymentReminders,
                          onChanged: (value) {
                            setState(() {
                              _paymentReminders = value;
                            });
                          },
                          secondary: Icon(
                            Icons.payment,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Update Perjalanan'),
                          subtitle: const Text(
                              'Notifikasi tentang perubahan jadwal, keterlambatan, atau pembatalan'),
                          value: _travelUpdates,
                          onChanged: (value) {
                            setState(() {
                              _travelUpdates = value;
                            });
                          },
                          secondary: Icon(
                            Icons.directions_boat,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Promo & Penawaran'),
                          subtitle: const Text(
                              'Notifikasi tentang diskon, penawaran khusus, dan promosi terbaru'),
                          value: _promotions,
                          onChanged: (value) {
                            setState(() {
                              _promotions = value;
                            });
                          },
                          secondary: Icon(
                            Icons.local_offer,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Update Aplikasi'),
                          subtitle: const Text(
                              'Notifikasi tentang update aplikasi dan fitur baru'),
                          value: _appUpdates,
                          onChanged: (value) {
                            setState(() {
                              _appUpdates = value;
                            });
                          },
                          secondary: Icon(
                            Icons.system_update,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Notification Channels
                  const Text(
                    'Saluran Notifikasi',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        SwitchListTile(
                          title: const Text('Notifikasi Aplikasi'),
                          subtitle: const Text('Notifikasi melalui aplikasi ini'),
                          value: true, // Always enabled
                          onChanged: null, // Can't be disabled
                          secondary: Icon(
                            Icons.app_registration,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('Email'),
                          subtitle: const Text('Notifikasi melalui email terdaftar'),
                          value: true,
                          onChanged: (value) {
                            // Implementasi sebenarnya akan menyimpan pengaturan ini
                          },
                          secondary: Icon(
                            Icons.email,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        const Divider(height: 1),
                        SwitchListTile(
                          title: const Text('SMS'),
                          subtitle: const Text('Notifikasi melalui SMS ke nomor terdaftar'),
                          value: false,
                          onChanged: (value) {
                            // Implementasi sebenarnya akan menyimpan pengaturan ini
                          },
                          secondary: Icon(
                            Icons.sms,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: _isLoading ? null : _saveSettings,
                      child: _isLoading
                          ? const CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : const Text(
                              'Simpan Pengaturan',
                              style: TextStyle(fontSize: 16),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}