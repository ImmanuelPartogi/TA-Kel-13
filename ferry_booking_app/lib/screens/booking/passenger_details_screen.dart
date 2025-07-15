import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'dart:math' as math;

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

  // Kapasitas dari ferry
  int _totalPassengerCapacity = 0;
  int _availablePassengerCapacity = 0;
  bool _isCapacityLoaded = false;

  @override
  void initState() {
    super.initState();
    // Inisialisasi data penumpang dari provider jika sudah ada
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initPassengerData();
      _loadCapacityData();
    });
  }

  void _loadCapacityData() {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    // Gunakan metode baru dari BookingProvider
    final availablePassengers = bookingProvider.getAvailablePassengerCapacity();
    final hasCapacity = bookingProvider.hasPassengerCapacityAvailable();

    setState(() {
      _totalPassengerCapacity =
          bookingProvider.selectedSchedule?.ferry?.capacityPassenger ?? 0;
      _availablePassengerCapacity = availablePassengers;
      _isCapacityLoaded = true;

      // Jika tidak ada kapasitas tersedia, batasi total penumpang ke jumlah saat ini
      if (!hasCapacity && _totalCurrentPassengers == 0) {
        // Jika belum ada penumpang, tetapkan minimal 1 dewasa
        _adultCount = 1;
        _childCount = 0;
        _infantCount = 0;

        // Tampilkan peringatan
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Perhatian: Kapasitas penumpang penuh (tersedia: $availablePassengers)',
              ),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 5),
            ),
          );
        });
      }
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

  // Menghitung total penumpang saat ini
  int get _totalCurrentPassengers => _adultCount + _childCount + _infantCount;

  // Menghitung jumlah penumpang tambahan yang masih dapat ditambahkan
  int get _remainingCapacity =>
      _availablePassengerCapacity - _totalCurrentPassengers;

  void _updatePassengerCount(String type, int value) {
    final oldTotal = _totalCurrentPassengers;
    int newValue = value;

    // Validasi bahwa total penumpang tidak melebihi kapasitas
    if (_isCapacityLoaded) {
      final int newTotal =
          oldTotal -
          (type == 'adult'
              ? _adultCount
              : type == 'child'
              ? _childCount
              : _infantCount) +
          value;

      if (newTotal > _availablePassengerCapacity) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Total penumpang tidak boleh melebihi kapasitas tersedia ($_availablePassengerCapacity)',
            ),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
    }

    setState(() {
      switch (type) {
        case 'adult':
          // Validasi bayi tidak lebih dari dewasa
          if (value < _infantCount) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Jumlah penumpang dewasa tidak boleh kurang dari jumlah bayi',
                ),
                backgroundColor: Colors.orange,
              ),
            );
            return;
          }
          _adultCount = newValue;
          break;
        case 'child':
          _childCount = newValue;
          break;
        case 'infant':
          // Validasi bayi tidak lebih dari dewasa
          if (newValue > _adultCount) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Jumlah bayi tidak boleh melebihi jumlah penumpang dewasa',
                ),
                backgroundColor: Colors.orange,
              ),
            );
            return;
          }
          _infantCount = newValue;
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
        const SnackBar(
          content: Text(
            'Jumlah bayi tidak boleh melebihi jumlah penumpang dewasa',
          ),
        ),
      );
      return;
    }

    // Validasi kapasitas tersedia - pastikan total tidak melebihi kapasitas
    if (_isCapacityLoaded &&
        _totalCurrentPassengers > _availablePassengerCapacity) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Total penumpang (${_totalCurrentPassengers}) melebihi kapasitas tersedia ($_availablePassengerCapacity)',
          ),
          backgroundColor: Colors.red,
        ),
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

  Widget _passengerCounter(
    String title,
    String subtitle,
    String type,
    int count, {
    int min = 0,
    int max = 10,
    IconData icon = Icons.person,
  }) {
    final theme = Theme.of(context);

    // Tentukan max yang efektif berdasarkan berbagai batasan
    int effectiveMax = max;

    // Jika kapasitas sudah dimuat, batasi berdasarkan kapasitas tersedia
    if (_isCapacityLoaded) {
      // Hitung max untuk tipe penumpang ini berdasarkan kapasitas dan jumlah penumpang saat ini
      int maxBasedOnCapacity = _availablePassengerCapacity;

      // Kurangi dengan jumlah penumpang lain (selain tipe ini)
      if (type == 'adult') {
        maxBasedOnCapacity -= (_childCount + _infantCount);
      } else if (type == 'child') {
        maxBasedOnCapacity -= (_adultCount + _infantCount);
      } else {
        // infant
        maxBasedOnCapacity -= (_adultCount + _childCount);
        // Bayi dibatasi juga oleh jumlah dewasa
        maxBasedOnCapacity = math.min(maxBasedOnCapacity, _adultCount);
      }

      // Gunakan nilai minimum antara max default dan max berdasarkan kapasitas
      effectiveMax = math.min(max, maxBasedOnCapacity);
    }

    // Untuk bayi, max dibatasi oleh jumlah dewasa
    if (type == 'infant') {
      effectiveMax = math.min(effectiveMax, _adultCount);
    }

    // Pastikan max tidak lebih kecil dari min
    effectiveMax = math.max(effectiveMax, min);

    // Cek apakah tombol tambah dinonaktifkan
    bool increaseDisabled = count >= effectiveMax;
    bool decreaseDisabled = count <= min;

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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Icon for passenger type
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: theme.primaryColor, size: 24),
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
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
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
                      // Decrease button - Perbarui tampilan visual
                      Material(
                        color:
                            decreaseDisabled
                                ? Colors
                                    .grey
                                    .shade100 // Warna latar ketika dinonaktifkan
                                : Colors.transparent,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(12),
                          bottomLeft: Radius.circular(12),
                        ),
                        child: InkWell(
                          onTap:
                              decreaseDisabled
                                  ? null
                                  : () =>
                                      _updatePassengerCount(type, count - 1),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(12),
                            bottomLeft: Radius.circular(12),
                          ),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            child: Icon(
                              Icons.remove,
                              color:
                                  decreaseDisabled
                                      ? Colors
                                          .grey[300] // Warna ikon ketika dinonaktifkan
                                      : theme.primaryColor,
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

                      // Increase button - Perbarui tampilan visual
                      Material(
                        color:
                            increaseDisabled
                                ? Colors
                                    .grey
                                    .shade100 // Warna latar ketika dinonaktifkan
                                : Colors.transparent,
                        borderRadius: const BorderRadius.only(
                          topRight: Radius.circular(12),
                          bottomRight: Radius.circular(12),
                        ),
                        child: InkWell(
                          onTap:
                              increaseDisabled
                                  ? null
                                  : () =>
                                      _updatePassengerCount(type, count + 1),
                          borderRadius: const BorderRadius.only(
                            topRight: Radius.circular(12),
                            bottomRight: Radius.circular(12),
                          ),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            child: Icon(
                              Icons.add,
                              color:
                                  increaseDisabled
                                      ? Colors
                                          .grey[300] // Warna ikon ketika dinonaktifkan
                                      : theme.primaryColor,
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

            // Tampilkan informasi kapasitas jika tersedia
            if (_isCapacityLoaded)
              Padding(
                padding: const EdgeInsets.only(top: 8.0, left: 56.0),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 14,
                      color:
                          _availablePassengerCapacity > 0
                              ? Colors.blue.shade700
                              : Colors.red.shade700,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _availablePassengerCapacity > 0
                          ? 'Kapasitas tersedia: $_availablePassengerCapacity penumpang'
                          : 'Kapasitas penuh! Tidak bisa menambah penumpang',
                      style: TextStyle(
                        fontSize: 12,
                        color:
                            _availablePassengerCapacity > 0
                                ? Colors.blue.shade700
                                : Colors.red.shade700,
                        fontStyle: FontStyle.italic,
                        fontWeight:
                            _availablePassengerCapacity <= 0
                                ? FontWeight.bold
                                : FontWeight.normal,
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
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
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

              // Kapasitas tersedia untuk penumpang
              if (_isCapacityLoaded)
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color:
                        _remainingCapacity > 0
                            ? Colors.green.shade50
                            : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color:
                          _remainingCapacity > 0
                              ? Colors.green.shade200
                              : Colors.red.shade200,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _remainingCapacity > 0
                            ? Icons.check_circle_outline
                            : Icons.error_outline,
                        color:
                            _remainingCapacity > 0
                                ? Colors.green
                                : Colors.red.shade700,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Status Kapasitas',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color:
                                    _remainingCapacity > 0
                                        ? Colors.green.shade800
                                        : Colors.red.shade800,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _remainingCapacity > 0
                                  ? 'Tersedia $_remainingCapacity kursi lagi dari $_availablePassengerCapacity kursi'
                                  : 'Kapasitas penuh! Maksimal $_availablePassengerCapacity penumpang',
                              style: TextStyle(
                                fontSize: 12,
                                color:
                                    _remainingCapacity > 0
                                        ? Colors.green.shade700
                                        : Colors.red.shade700,
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
                      max: 10, // Max default yang dapat disesuaikan
                      icon: Icons.person,
                    ),
                    _passengerCounter(
                      'Anak-anak',
                      'Usia 2-11 tahun',
                      'child',
                      _childCount,
                      max: 10, // Max default
                      icon: Icons.child_care,
                    ),
                    _passengerCounter(
                      'Bayi',
                      'Usia di bawah 2 tahun',
                      'infant',
                      _infantCount,
                      max: 5, // Max default untuk bayi
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
                            text:
                                'Setiap penumpang dewasa dapat membawa maksimal 1 bayi',
                          ),
                          const SizedBox(height: 8),
                          _buildInfoItem(
                            icon: Icons.badge,
                            text:
                                'Penumpang akan diminta menunjukkan identitas saat boarding',
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
                                '$_totalCurrentPassengers',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  color: theme.primaryColor,
                                ),
                              ),
                              if (_isCapacityLoaded)
                                Text(
                                  ' / $_availablePassengerCapacity',
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: Colors.grey.shade600,
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
        Icon(icon, size: 18, color: Colors.amber.shade800),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: TextStyle(color: Colors.grey.shade800, fontSize: 14),
          ),
        ),
      ],
    );
  }
}
