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

    // Simpan data penumpang ke provider
    bookingProvider.updatePassengerCounts({
      'adult': _adultCount,
      'child': _childCount,
      'infant': _infantCount,
    });

    Navigator.pushNamed(context, '/booking/vehicles');
  }

  Widget _passengerCounter(String title, String subtitle, String type, int count, {int min = 0, int max = 10}) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: count <= min
                        ? null
                        : () => _updatePassengerCount(type, count - 1),
                    color: count <= min ? Colors.grey[400] : Colors.blue,
                  ),
                  Container(
                    width: 40,
                    alignment: Alignment.center,
                    child: Text(
                      count.toString(),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: count >= max
                        ? null
                        : () => _updatePassengerCount(type, count + 1),
                    color: count >= max ? Colors.grey[400] : Colors.blue,
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
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Detail Penumpang',
        showBackButton: true,
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Petunjuk
            Container(
              padding: const EdgeInsets.all(16.0),
              color: Colors.blue[50],
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue[700]),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Silakan pilih jumlah penumpang berdasarkan kategori',
                      style: TextStyle(color: Colors.blue[700]),
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
                  ),
                  _passengerCounter(
                    'Anak-anak', 
                    'Usia 2-11 tahun', 
                    'child', 
                    _childCount,
                  ),
                  _passengerCounter(
                    'Bayi', 
                    'Usia di bawah 2 tahun', 
                    'infant', 
                    _infantCount,
                  ),
                  const SizedBox(height: 16),
                  // Informasi tambahan
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: Colors.amber[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.info_outline, color: Colors.amber[700]),
                            const SizedBox(width: 8),
                            Text(
                              'Informasi Penting',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.amber[900],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '- Bayi tidak mendapatkan kursi tersendiri',
                          style: TextStyle(color: Colors.amber[900]),
                        ),
                        Text(
                          '- Setiap penumpang dewasa dapat membawa maksimal 1 bayi',
                          style: TextStyle(color: Colors.amber[900]),
                        ),
                        Text(
                          '- Penumpang akan diminta menunjukkan identitas saat boarding',
                          style: TextStyle(color: Colors.amber[900]),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bar Bawah
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 5,
                    offset: const Offset(0, -2),
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
                        Text(
                          'Total Penumpang: ${_adultCount + _childCount + _infantCount}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Dewasa: $_adultCount, Anak-anak: $_childCount, Bayi: $_infantCount',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Tombol lanjutkan
                  ElevatedButton(
                    onPressed: _continueToVehicle,
                    child: const Text('Lanjutkan'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}