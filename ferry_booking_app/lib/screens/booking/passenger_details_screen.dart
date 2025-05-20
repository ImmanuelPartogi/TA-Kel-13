import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class PassengerDetailsScreen extends StatefulWidget {
  const PassengerDetailsScreen({Key? key}) : super(key: key);

  @override
  _PassengerDetailsScreenState createState() => _PassengerDetailsScreenState();
}

class _PassengerDetailsScreenState extends State<PassengerDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Jumlah penumpang berdasarkan kategori
  int _adultCount = 1; // Minimal 1 penumpang dewasa
  int _childCount = 0;
  int _infantCount = 0;

  @override
  void initState() {
    super.initState();
    // Inisialisasi data penumpang dari provider jika sudah ada
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initPassengerData();
    });
  }

  void _initPassengerData() {
    final bookingProvider = Provider.of<BookingProvider>(
      context, 
      listen: false,
    );

    // Jika sudah ada data penumpang, tampilkan
    if (bookingProvider.passengerCounts.isNotEmpty) {
      setState(() {
        _adultCount = bookingProvider.passengerCounts['adult'] ?? 1;
        _childCount = bookingProvider.passengerCounts['child'] ?? 0;
        _infantCount = bookingProvider.passengerCounts['infant'] ?? 0;
      });
    } else {
      // Jika belum ada, inisialisasi dengan 1 dewasa
      bookingProvider.updatePassengerCounts({
        'adult': _adultCount,
        'child': _childCount,
        'infant': _infantCount,
      });
    }
  }

  void _updatePassengerCount(String type, int value) {
    setState(() {
      switch (type) {
        case 'adult':
          _adultCount = value;
          break;
        case 'child':
          _childCount = value;
          break;
        case 'infant':
          _infantCount = value;
          break;
      }
    });

    // Update di provider
    final bookingProvider = Provider.of<BookingProvider>(
      context, 
      listen: false,
    );
    
    bookingProvider.updatePassengerCounts({
      'adult': _adultCount,
      'child': _childCount,
      'infant': _infantCount,
    });
  }

  void _continueToVehicle() {
    final bookingProvider = Provider.of<BookingProvider>(
      context, 
      listen: false,
    );

    // Cek apakah ada minimal 1 penumpang
    if (_adultCount + _childCount + _infantCount < 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Silakan pilih minimal 1 penumpang')),
      );
      return;
    }

    // Validasi jumlah bayi tidak lebih dari dewasa
    if (_infantCount > _adultCount) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah bayi tidak boleh melebihi jumlah penumpang dewasa')),
      );
      return;
    }

    // Simpan data penumpang ke provider
    bookingProvider.updatePassengerCounts({
      'adult': _adultCount,
      'child': _childCount,
      'infant': _infantCount,
    });

    Navigator.pushNamed(context, '/booking/vehicles');
  }

  Widget _passengerCounter(String title, String subtitle, String type, int count, {int min = 0, int max = 10, IconData icon = Icons.person}) {
    final theme = Theme.of(context);
    
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            // Icon for passenger type
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon, 
                color: theme.primaryColor,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            
            // Title and subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
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
            
            // Counter with + and - buttons
            Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  // Decrease button
                  Material(
                    color: Colors.transparent,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12),
                      bottomLeft: Radius.circular(12),
                    ),
                    child: InkWell(
                      onTap: count <= min
                          ? null
                          : () => _updatePassengerCount(type, count - 1),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(12),
                        bottomLeft: Radius.circular(12),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        child: Icon(
                          Icons.remove,
                          color: count <= min ? Colors.grey[400] : theme.primaryColor,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                  
                  // Count display
                  Container(
                    width: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      border: Border(
                        left: BorderSide(color: Colors.grey.shade200),
                        right: BorderSide(color: Colors.grey.shade200),
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      count.toString(),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.primaryColor,
                      ),
                    ),
                  ),
                  
                  // Increase button
                  Material(
                    color: Colors.transparent,
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                    child: InkWell(
                      onTap: count >= max
                          ? null
                          : () => _updatePassengerCount(type, count + 1),
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(12),
                        bottomRight: Radius.circular(12),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        child: Icon(
                          Icons.add,
                          color: count >= max ? Colors.grey[400] : theme.primaryColor,
                          size: 20,
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: const CustomAppBar(
        title: 'Detail Penumpang',
        showBackButton: true,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Petunjuk
              Container(
                width: double.infinity,
                margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      theme.primaryColor.withOpacity(0.7),
                      theme.primaryColor.withOpacity(0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: theme.primaryColor.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.white, size: 24),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Informasi Penumpang',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Pilih jumlah penumpang untuk melanjutkan pemesanan tiket Anda',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Daftar Kategori Penumpang
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16.0),
                  children: [
                    _passengerCounter(
                      'Dewasa', 
                      'Usia 12 tahun ke atas', 
                      'adult', 
                      _adultCount, 
                      min: 1, // Minimal 1 penumpang dewasa
                      icon: Icons.person,
                    ),
                    _passengerCounter(
                      'Anak-anak', 
                      'Usia 2-11 tahun', 
                      'child', 
                      _childCount,
                      icon: Icons.child_care,
                    ),
                    _passengerCounter(
                      'Bayi', 
                      'Usia di bawah 2 tahun', 
                      'infant', 
                      _infantCount,
                      icon: Icons.child_friendly,
                    ),
                    const SizedBox(height: 16),
                    
                    // Informasi tambahan
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.amber.shade200,
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.amber.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.amber.shade100,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.lightbulb_outline,
                                  color: Colors.amber.shade800,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Informasi Penting',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: Colors.amber.shade800,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          _buildInfoItem(
                            icon: Icons.baby_changing_station,
                            text: 'Bayi tidak mendapatkan kursi tersendiri',
                          ),
                          const SizedBox(height: 8),
                          _buildInfoItem(
                            icon: Icons.person_add,
                            text: 'Setiap penumpang dewasa dapat membawa maksimal 1 bayi',
                          ),
                          const SizedBox(height: 8),
                          _buildInfoItem(
                            icon: Icons.badge,
                            text: 'Penumpang akan diminta menunjukkan identitas saat boarding',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Bar Bawah
              Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Ringkasan jumlah
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Total Penumpang: ',
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Colors.grey.shade700,
                                ),
                              ),
                              Text(
                                '${_adultCount + _childCount + _infantCount}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  color: theme.primaryColor,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Dewasa: $_adultCount, Anak-anak: $_childCount, Bayi: $_infantCount',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    
                    // Tombol lanjutkan
                    ElevatedButton(
                      onPressed: _continueToVehicle,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                      child: const Row(
                        children: [
                          Text(
                            'Lanjutkan',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward, size: 18),
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
    );
  }
  
  Widget _buildInfoItem({required IconData icon, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 18,
          color: Colors.amber.shade800,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: Colors.grey.shade800,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}