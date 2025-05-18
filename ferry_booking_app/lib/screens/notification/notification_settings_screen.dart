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
      await Future.delayed(const Duration(milliseconds: 500));
      
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
      backgroundColor: Colors.white,
      body: SafeArea(
        child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back button
                  Align(
                    alignment: Alignment.topLeft,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Header
                  Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.notifications_active,
                          size: 80,
                          color: AppTheme.primaryColor,
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Pengaturan Notifikasi',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Kelola jenis notifikasi yang ingin Anda terima',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                  
                  // Notification Settings
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          spreadRadius: 1,
                          blurRadius: 10,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        SwitchListTile(
                          title: const Text(
                            'Update Pemesanan',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Perubahan atau konfirmasi pemesanan Anda',
                            style: TextStyle(fontSize: 13),
                          ),
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
                        Divider(height: 1, thickness: 0.5, indent: 70),
                        SwitchListTile(
                          title: const Text(
                            'Pengingat Pembayaran',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Pembayaran yang perlu dilakukan atau status pembayaran',
                            style: TextStyle(fontSize: 13),
                          ),
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
                        Divider(height: 1, thickness: 0.5, indent: 70),
                        SwitchListTile(
                          title: const Text(
                            'Update Perjalanan',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Perubahan jadwal, keterlambatan, atau pembatalan',
                            style: TextStyle(fontSize: 13),
                          ),
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
                        Divider(height: 1, thickness: 0.5, indent: 70),
                        SwitchListTile(
                          title: const Text(
                            'Promo & Penawaran',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Diskon, penawaran khusus, dan promosi terbaru',
                            style: TextStyle(fontSize: 13),
                          ),
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
                        Divider(height: 1, thickness: 0.5, indent: 70),
                        SwitchListTile(
                          title: const Text(
                            'Update Aplikasi',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Update aplikasi dan fitur baru',
                            style: TextStyle(fontSize: 13),
                          ),
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
                  
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          spreadRadius: 1,
                          blurRadius: 10,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        SwitchListTile(
                          title: const Text(
                            'Notifikasi Aplikasi',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Notifikasi melalui aplikasi ini',
                            style: TextStyle(fontSize: 13),
                          ),
                          value: true,
                          onChanged: null,
                          secondary: Icon(
                            Icons.app_registration,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        Divider(height: 1, thickness: 0.5, indent: 70),
                        SwitchListTile(
                          title: const Text(
                            'Email',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Notifikasi melalui email terdaftar',
                            style: TextStyle(fontSize: 13),
                          ),
                          value: true,
                          onChanged: (value) {},
                          secondary: Icon(
                            Icons.email,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        Divider(height: 1, thickness: 0.5, indent: 70),
                        SwitchListTile(
                          title: const Text(
                            'SMS',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: const Text(
                            'Notifikasi melalui SMS ke nomor terdaftar',
                            style: TextStyle(fontSize: 13),
                          ),
                          value: false,
                          onChanged: (value) {},
                          secondary: Icon(
                            Icons.sms,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Save Button
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        foregroundColor: Colors.white,
                        backgroundColor: AppTheme.primaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 2,
                      ),
                      onPressed: _isLoading ? null : _saveSettings,
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'SIMPAN PENGATURAN',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                ],
              ),
            ),
      ),
    );
  }
}