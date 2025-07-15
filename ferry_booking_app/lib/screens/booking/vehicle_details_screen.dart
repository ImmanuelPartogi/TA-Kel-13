import 'package:ferry_booking_app/models/vehicle.dart';
import 'package:ferry_booking_app/models/vehicle_category.dart';
import 'package:ferry_booking_app/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:intl/intl.dart';
import 'dart:developer' as developer;

class VehicleDetailsScreen extends StatefulWidget {
  const VehicleDetailsScreen({Key? key}) : super(key: key);

  @override
  _VehicleDetailsScreenState createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends State<VehicleDetailsScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  bool _isLoading = true;
  String? _errorMessage;
  List<VehicleCategory> _vehicleCategories = [];
  final ApiService _apiService = ApiService();

  // Animasi untuk efek transisi
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    // Inisialisasi animasi
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _fetchVehicleCategories();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Fungsi untuk mengambil data kategori kendaraan dari API
  Future<void> _fetchVehicleCategories() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Panggil API untuk mendapatkan daftar kategori kendaraan
      final response = await _apiService.get('vehicle-categories');

      if (response['success'] == true && response['data'] != null) {
        // Parse data kategori kendaraan
        final List<dynamic> categoriesData = response['data'];
        final List<VehicleCategory> categories =
            categoriesData
                .map((data) => VehicleCategory.fromJson(data))
                .toList();

        setState(() {
          _vehicleCategories = categories.where((cat) => cat.isActive).toList();
          _isLoading = false;
        });

        // Mulai animasi
        _animationController.forward();
      } else {
        setState(() {
          _errorMessage =
              response['message'] ?? 'Gagal memuat kategori kendaraan';
          _isLoading = false;
        });
      }
    } catch (e) {
      developer.log('Error fetching vehicle categories: $e');
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  void _retryFetchCategories() {
    _fetchVehicleCategories();
  }

  void _addVehicle() {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    if (bookingProvider.vehicles.length >= AppConfig.maxVehiclesPerBooking) {
      showDialog(
        context: context,
        builder:
            (context) => AlertDialog(
              title: const Text('Batas Maksimum'),
              content: Text(
                'Maksimal ${AppConfig.maxVehiclesPerBooking} kendaraan per pemesanan',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Mengerti'),
                ),
              ],
            ),
      );
      return;
    }

    // Gunakan metode baru untuk mengecek apakah ada jenis kendaraan yang tersedia
    final hasAvailableVehicles = bookingProvider.hasAnyVehicleTypeAvailable();

    if (!hasAvailableVehicles) {
      showDialog(
        context: context,
        builder:
            (context) => AlertDialog(
              title: const Text('Kapasitas Penuh'),
              content: const Text(
                'Maaf, seluruh kapasitas kendaraan untuk jadwal ini telah penuh.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Mengerti'),
                ),
              ],
            ),
      );
      return;
    }

    showDialog(
      context: context,
      builder:
          (context) => _VehicleDialog(
            vehicleCategories: _vehicleCategories,
            onSave: (vehicle) {
              bookingProvider.addVehicle(vehicle);
              Navigator.pop(context);
            },
          ),
    );
  }

  void _editVehicle(int index) {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final vehicle = bookingProvider.vehicles[index];

    showDialog(
      context: context,
      builder:
          (context) => _VehicleDialog(
            vehicle: vehicle,
            vehicleCategories: _vehicleCategories,
            onSave: (updatedVehicle) {
              bookingProvider.updateVehicle(index, updatedVehicle);
              Navigator.pop(context);

              // Hapus snackbar yang mengganggu dialog
            },
          ),
    );
  }

  void _removeVehicle(int index) {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            title: Row(
              children: [
                Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.orange.shade700,
                ),
                const SizedBox(width: 10),
                const Text('Konfirmasi Hapus'),
              ],
            ),
            content: const Text(
              'Apakah Anda yakin ingin menghapus kendaraan ini?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () {
                  bookingProvider.removeVehicle(index);
                  Navigator.of(context).pop();

                  // Hapus snackbar yang mengganggu dialog
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.delete_outline, size: 18),
                    SizedBox(width: 4),
                    Text('Hapus'),
                  ],
                ),
              ),
            ],
          ),
    );
  }

  void _continueToSummary() {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    // TAMBAHKAN: Konfirmasi jika tidak ada kendaraan
    if (bookingProvider.vehicles.isEmpty) {
      showDialog(
        context: context,
        builder:
            (context) => AlertDialog(
              title: Text('Konfirmasi'),
              content: Text(
                'Anda belum menambahkan kendaraan. Apakah Anda ingin melanjutkan tanpa kendaraan?',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Batal'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/booking/summary');
                  },
                  child: Text('Lanjutkan'),
                ),
              ],
            ),
      );
    } else {
      Navigator.pushNamed(context, '/booking/summary');
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final vehicles = bookingProvider.vehicles;
    final route = bookingProvider.selectedRoute;
    final theme = Theme.of(context);

    if (route == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/booking/routes');
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Hitung total biaya kendaraan
    double totalVehiclePrice = 0;
    for (var vehicle in vehicles) {
      final category = _vehicleCategories.firstWhere(
        (cat) => cat.id == vehicle.vehicle_category_id,
        orElse:
            () => VehicleCategory(
              id: 0,
              code: '',
              name: '',
              vehicleType: '',
              basePrice: 0,
              isActive: false,
            ),
      );
      totalVehiclePrice += category.basePrice;
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: const CustomAppBar(
        title: 'Detail Kendaraan',
        showBackButton: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: RefreshIndicator(
                onRefresh: _fetchVehicleCategories,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(
                    parent: BouncingScrollPhysics(),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Information Card
                          _buildInformationCard(theme),

                          _buildVehicleCapacityInfo(bookingProvider),

                          // Vehicle Prices Section
                          buildDetailedPriceSection(
                            context,
                            _vehicleCategories,
                            _isLoading,
                            _errorMessage,
                            _retryFetchCategories,
                          ),

                          // Vehicle List Section
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Kendaraan Anda',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey.shade800,
                                ),
                              ),
                              if (vehicles.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: theme.primaryColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    '${vehicles.length}/${AppConfig.maxVehiclesPerBooking}',
                                    style: TextStyle(
                                      color: theme.primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          // Vehicle List or Empty State
                          vehicles.isEmpty
                              ? _buildEmptyVehicleState()
                              : FadeTransition(
                                opacity: _fadeAnimation,
                                child: _buildVehicleList(vehicles, theme),
                              ),

                          // Space at the bottom
                          const SizedBox(height: 140),
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
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, -3),
              spreadRadius: 0,
            ),
          ],
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Total harga kendaraan
            if (vehicles.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Biaya Kendaraan',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  Text(
                    currencyFormat.format(totalVehiclePrice),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: theme.primaryColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Tombol aksi
            Row(
              children: [
                // Tombol Tambah
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('Tambah'),
                    onPressed:
                        _isLoading ||
                                _vehicleCategories.isEmpty ||
                                vehicles.length >=
                                    AppConfig.maxVehiclesPerBooking ||
                                !bookingProvider
                                    .hasAnyVehicleTypeAvailable() // Tambahkan kondisi ini
                            ? null
                            : _addVehicle,
                    style: ButtonStyle(
                      padding: MaterialStateProperty.all(
                        const EdgeInsets.symmetric(vertical: 16),
                      ),
                      shape: MaterialStateProperty.all(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      side: MaterialStateProperty.resolveWith((states) {
                        if (states.contains(MaterialState.disabled)) {
                          return BorderSide(
                            color: Colors.grey.shade300,
                            width: 1.5,
                          );
                        }
                        if (states.contains(MaterialState.pressed)) {
                          return BorderSide(
                            color: theme.primaryColor,
                            width: 2,
                          );
                        }
                        return BorderSide(
                          color: theme.primaryColor.withOpacity(0.7),
                          width: 1.5,
                        );
                      }),
                      overlayColor: MaterialStateProperty.all(
                        theme.primaryColor.withOpacity(0.05),
                      ),
                    ),
                  ),
                ),

                // Spacer
                const SizedBox(width: 16),

                // Tombol Lanjutkan
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.navigate_next, size: 18),
                    label: const Text('Lanjutkan'),
                    onPressed: _continueToSummary,
                    style: ButtonStyle(
                      padding: MaterialStateProperty.all(
                        const EdgeInsets.symmetric(vertical: 16),
                      ),
                      backgroundColor: MaterialStateProperty.resolveWith((
                        states,
                      ) {
                        if (states.contains(MaterialState.pressed)) {
                          return theme.primaryColor.withOpacity(0.9);
                        }
                        return theme.primaryColor;
                      }),
                      shape: MaterialStateProperty.all(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      elevation: MaterialStateProperty.all(0),
                      shadowColor: MaterialStateProperty.all(
                        theme.primaryColor.withOpacity(0.4),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInformationCard(ThemeData theme) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.directions_car,
              color: theme.primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Informasi Kendaraan',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Tambahkan kendaraan jika Anda membawa kendaraan. Jika tidak, lewati langkah ini.',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCapacityInfo(BookingProvider bookingProvider) {
    final schedule = bookingProvider.selectedSchedule;
    if (schedule == null || schedule.ferry == null) {
      return const SizedBox.shrink();
    }

    // Periksa apakah ada jenis kendaraan yang tersedia
    final hasAvailableVehicles = bookingProvider.hasAnyVehicleTypeAvailable();

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: hasAvailableVehicles ? Colors.blue.shade50 : Colors.red.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color:
              hasAvailableVehicles ? Colors.blue.shade200 : Colors.red.shade200,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
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
              Icon(
                hasAvailableVehicles
                    ? Icons.directions_car
                    : Icons.error_outline,
                color:
                    hasAvailableVehicles
                        ? Colors.blue.shade700
                        : Colors.red.shade700,
              ),
              const SizedBox(width: 12),
              Text(
                hasAvailableVehicles
                    ? 'Kapasitas Kendaraan Tersedia'
                    : 'Kapasitas Kendaraan Penuh',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color:
                      hasAvailableVehicles
                          ? Colors.blue.shade800
                          : Colors.red.shade800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildCapacityItem(
                icon: Icons.motorcycle,
                type: 'MOTORCYCLE',
                available: schedule.availableMotorcycle ?? 0,
                total: schedule.ferry!.capacityVehicleMotorcycle,
                label: 'Motor',
              ),
              _buildCapacityItem(
                icon: Icons.directions_car,
                type: 'CAR',
                available: schedule.availableCar ?? 0,
                total: schedule.ferry!.capacityVehicleCar,
                label: 'Mobil',
              ),
              _buildCapacityItem(
                icon: Icons.directions_bus,
                type: 'BUS',
                available: schedule.availableBus ?? 0,
                total: schedule.ferry!.capacityVehicleBus,
                label: 'Bus',
              ),
              _buildCapacityItem(
                icon: Icons.local_shipping,
                type: 'TRUCK',
                available: schedule.availableTruck ?? 0,
                total: schedule.ferry!.capacityVehicleTruck,
                label: 'Truk',
              ),
            ],
          ),
          // Tambahkan pesan ketika kapasitas habis
          if (!hasAvailableVehicles)
            Container(
              margin: const EdgeInsets.only(top: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    color: Colors.red.shade700,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Maaf, semua jenis kendaraan telah mencapai kapasitas maksimum. Anda tidak dapat menambahkan kendaraan lagi.',
                      style: TextStyle(
                        color: Colors.red.shade700,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
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

  Widget _buildCapacityItem({
    required IconData icon,
    required String type,
    required int available,
    required int total,
    required String label,
  }) {
    final bool isAvailable = available > 0;
    Color color = isAvailable ? Colors.green : Colors.red;
    if (isAvailable && available < total * 0.3) {
      color = Colors.orange; // Hampir penuh
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: Colors.grey.shade800,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$available',
              style: TextStyle(fontWeight: FontWeight.bold, color: color),
            ),
            Text(
              '/$total',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
          ],
        ),
        // Tambahkan status kapasitas
        if (!isAvailable)
          Container(
            margin: const EdgeInsets.only(top: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.red.shade100,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              'Penuh',
              style: TextStyle(
                fontSize: 10,
                color: Colors.red.shade700,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
      ],
    );
  }

  // Menggunakan widget buildDetailedPriceSection dari vehicle_price_details.dart

  Widget _buildEmptyVehicleState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      margin: const EdgeInsets.only(top: 8, bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.directions_car_outlined,
              size: 48,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Belum ada kendaraan',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Klik tombol di bawah untuk menambahkan kendaraan',
            style: TextStyle(color: Colors.grey[500], fontSize: 13),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed:
                _isLoading || _vehicleCategories.isEmpty ? null : _addVehicle,
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Tambah Kendaraan'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleList(List<Vehicle> vehicles, ThemeData theme) {
    return Column(
      children:
          vehicles.asMap().entries.map((entry) {
            final index = entry.key;
            final vehicle = entry.value;

            // Mendapatkan kategori kendaraan
            final category = _vehicleCategories.firstWhere(
              (cat) => cat.id == vehicle.vehicle_category_id,
              orElse: () => _vehicleCategories.first,
            );

            // Mendapatkan icon berdasarkan tipe kendaraan
            IconData vehicleIcon = _getVehicleTypeIcon(vehicle.type);

            return Dismissible(
              key: Key('vehicle_${vehicle.id}_$index'),
              direction: DismissDirection.endToStart,
              background: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 20),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.delete, color: Colors.white),
                    SizedBox(height: 4),
                    Text(
                      'Hapus',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              confirmDismiss: (direction) async {
                bool delete = false;
                await showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      title: const Text('Konfirmasi Hapus'),
                      content: const Text(
                        'Apakah Anda yakin ingin menghapus kendaraan ini?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () {
                            delete = false;
                            Navigator.of(context).pop();
                          },
                          child: const Text('Batal'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: () {
                            delete = true;
                            Navigator.of(context).pop();
                          },
                          child: const Text('Hapus'),
                        ),
                      ],
                    );
                  },
                );

                if (delete) {
                  _removeVehicle(index);
                }

                return delete;
              },
              child: Container(
                width: double.infinity,
                margin: const EdgeInsets.only(top: 8, bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(
                          category.code,
                        ).withOpacity(0.05),
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(12),
                          topRight: Radius.circular(12),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _getCategoryColor(
                                    category.code,
                                  ).withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  vehicleIcon,
                                  color: _getCategoryColor(category.code),
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    category.code,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    vehicle.licensePlate,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.grey.shade700,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              // Tambahkan badge harga
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: theme.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  currencyFormat.format(category.basePrice),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: theme.primaryColor,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              IconButton(
                                icon: Icon(
                                  Icons.edit_outlined,
                                  color: theme.primaryColor,
                                  size: 18,
                                ),
                                onPressed: () => _editVehicle(index),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                splashRadius: 20,
                              ),
                              const SizedBox(width: 12),
                              IconButton(
                                icon: const Icon(
                                  Icons.delete_outline,
                                  color: Colors.red,
                                  size: 18,
                                ),
                                onPressed: () => _removeVehicle(index),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                                splashRadius: 20,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Details
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailItem(
                            title: 'Plat Nomor',
                            value: vehicle.licensePlate,
                            icon: Icons.confirmation_number_outlined,
                          ),
                          if (vehicle.brand != null &&
                              vehicle.brand!.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            _buildDetailItem(
                              title: 'Merk/Model',
                              value: '${vehicle.brand} ${vehicle.model ?? ''}',
                              icon: Icons.branding_watermark_outlined,
                            ),
                          ],
                          if (vehicle.weight != null) ...[
                            const SizedBox(height: 12),
                            _buildDetailItem(
                              title: 'Berat',
                              value: '${vehicle.weight} kg',
                              icon: Icons.scale_outlined,
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Divider
                    Divider(color: Colors.grey.shade200, height: 1),

                    // Footer with vehicle details
                    Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.category_outlined,
                                size: 16,
                                color: Colors.grey.shade600,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                category.name,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            _getVehicleTypeName(vehicle.type),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: Colors.grey.shade700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
    );
  }

  IconData _getVehicleTypeIcon(String vehicleType) {
    switch (vehicleType) {
      case 'MOTORCYCLE':
        return Icons.motorcycle;
      case 'CAR':
        return Icons.directions_car;
      case 'BUS':
        return Icons.directions_bus;
      case 'TRUCK':
        return Icons.local_shipping;
      case 'PICKUP':
        return Icons.airport_shuttle;
      case 'TRONTON':
        return Icons.fire_truck;
      default:
        return Icons.directions_car;
    }
  }

  String _getVehicleTypeName(String vehicleType) {
    switch (vehicleType) {
      case 'MOTORCYCLE':
        return 'Sepeda Motor';
      case 'CAR':
        return 'Mobil';
      case 'BUS':
        return 'Bus';
      case 'TRUCK':
        return 'Truk';
      case 'PICKUP':
        return 'Pickup';
      case 'TRONTON':
        return 'Tronton';
      default:
        return vehicleType;
    }
  }

  Widget _buildDetailItem({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Icon(icon, size: 16, color: Colors.grey.shade700),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Color _getCategoryColor(String code) {
    if (code.contains("GOL I")) {
      return Colors.orange;
    } else if (code.contains("GOL II")) {
      return Colors.blue;
    } else if (code.contains("GOL III")) {
      return Colors.green;
    } else if (code.contains("GOL IV")) {
      return Colors.amber;
    } else if (code.contains("GOL V")) {
      return Colors.purple;
    } else if (code.contains("GOL VI")) {
      return Colors.teal;
    } else {
      return Theme.of(context).primaryColor;
    }
  }
}

// Dialog class untuk menambah/edit kendaraan
class _VehicleDialog extends StatefulWidget {
  final Vehicle? vehicle;
  final List<VehicleCategory> vehicleCategories;
  final Function(Vehicle) onSave;

  const _VehicleDialog({
    Key? key,
    this.vehicle,
    required this.vehicleCategories,
    required this.onSave,
  }) : super(key: key);

  @override
  __VehicleDialogState createState() => __VehicleDialogState();
}

class __VehicleDialogState extends State<_VehicleDialog> {
  final _formKey = GlobalKey<FormState>();
  int _vehicleCategoryId = 0;
  String _type = 'MOTORCYCLE';

  String _getValidVehicleType(String originalType) {
    final validTypes = {
      'MOTORCYCLE': 'MOTORCYCLE',
      'CAR': 'CAR',
      'BUS': 'BUS',
      'TRUCK': 'TRUCK',
      // Ubah PICKUP menjadi TRUCK karena server tidak menerima PICKUP
      'PICKUP': 'TRUCK',
      'TRONTON': 'TRUCK', // Ubah ini juga menjadi TRUCK
    };
    return validTypes[originalType] ??
        'CAR'; // Default ke CAR jika tidak ditemukan
  }

  late TextEditingController _licensePlateController;
  late TextEditingController _brandController;
  late TextEditingController _modelController;
  late TextEditingController _weightController;

  @override
  void initState() {
    super.initState();

    // Set nilai awal
    _licensePlateController = TextEditingController(
      text: widget.vehicle?.licensePlate ?? '',
    );
    _brandController = TextEditingController(text: widget.vehicle?.brand ?? '');
    _modelController = TextEditingController(text: widget.vehicle?.model ?? '');
    _weightController = TextEditingController(
      text: widget.vehicle?.weight?.toString() ?? '',
    );

    // UBAH: Set kategori kendaraan default hanya jika vehicle sudah ada
    if (widget.vehicle != null) {
      _vehicleCategoryId = widget.vehicle!.vehicle_category_id;
      _type = widget.vehicle!.type;
    } else {
      // Set nilai default ke 0/empty untuk memaksa pengguna memilih
      _vehicleCategoryId = 0;
      _type = '';
    }
  }

  @override
  void dispose() {
    _licensePlateController.dispose();
    _brandController.dispose();
    _modelController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  void _saveVehicle() {
    if (_formKey.currentState!.validate()) {
      // Validasi pemilihan kategori kendaraan
      if (_vehicleCategoryId <= 0) {
        // Tampilkan dialog informasi yang lebih profesional
        showDialog(
          context: context,
          builder:
              (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 10),
                    const Text('Informasi Diperlukan'),
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Kategori kendaraan belum dipilih',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Silakan pilih kategori kendaraan yang sesuai dengan jenis kendaraan Anda untuk melanjutkan.',
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.lightbulb_outline,
                            color: Colors.blue.shade700,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Kategori menentukan tarif kendaraan yang akan dikenakan.',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.blue.shade700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Mengerti'),
                  ),
                ],
              ),
        );

        // Tambahkan highlight visual pada section kategori
        // dengan scrolling otomatis ke kategori section
        // (Ini perlu implementasi ScrollController yang mengarah ke section kategori)
        return;
      }

      // Dapatkan kategori kendaraan berdasarkan ID yang dipilih
      VehicleCategory? selectedCategory;
      try {
        selectedCategory = widget.vehicleCategories.firstWhere(
          (cat) => cat.id == _vehicleCategoryId,
        );
      } catch (e) {
        showDialog(
          context: context,
          builder:
              (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.orange),
                    const SizedBox(width: 10),
                    const Text('Kategori Tidak Valid'),
                  ],
                ),
                content: const Text(
                  'Kategori kendaraan yang dipilih tidak valid. Silakan pilih kategori yang tersedia.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Tutup'),
                  ),
                ],
              ),
        );
        return;
      }

      final vehicle = Vehicle(
        id: widget.vehicle?.id ?? -1,
        bookingId: widget.vehicle?.bookingId ?? -1,
        userId: widget.vehicle?.userId ?? -1,
        type: _getValidVehicleType(
          selectedCategory.vehicleType,
        ), // Pastikan tipe valid
        vehicle_category_id: _vehicleCategoryId,
        licensePlate: _licensePlateController.text.trim().toUpperCase(),
        brand: _brandController.text.trim(),
        model: _modelController.text.trim(),
        weight:
            _weightController.text.isNotEmpty
                ? double.tryParse(_weightController.text.trim())
                : null,
        createdAt:
            widget.vehicle?.createdAt ?? DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      );

      widget.onSave(vehicle);
    }
  }

  void _selectVehicleCategory(int categoryId) {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    // Dapatkan kategori yang dipilih
    final selectedCategory = widget.vehicleCategories.firstWhere(
      (cat) => cat.id == categoryId,
      orElse: () => widget.vehicleCategories.first,
    );

    // Periksa apakah jenis kendaraan tersedia
    if (!bookingProvider.isVehicleTypeAvailable(selectedCategory.vehicleType)) {
      // Tampilkan dialog alih-alih snackbar
      showDialog(
        context: context,
        builder:
            (context) => AlertDialog(
              title: const Text('Kapasitas Penuh'),
              content: Text(
                'Jenis kendaraan ${_getVehicleTypeName(selectedCategory.vehicleType)} telah penuh. Silakan pilih jenis kendaraan lain.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Mengerti'),
                ),
              ],
            ),
      );
      return;
    }

    setState(() {
      _vehicleCategoryId = categoryId;
      // Juga update tipe kendaraan
      _type = selectedCategory.vehicleType;
    });
  }

  @override
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Mengelompokkan kategori berdasarkan tipe kendaraan
    final Map<String, List<VehicleCategory>> categoriesByType = {};
    for (var category in widget.vehicleCategories) {
      if (!categoriesByType.containsKey(category.vehicleType)) {
        categoriesByType[category.vehicleType] = [];
      }
      categoriesByType[category.vehicleType]!.add(category);
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.9,
          maxWidth: MediaQuery.of(context).size.width * 0.9,
        ),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with title and icon
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: theme.primaryColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.directions_car_outlined,
                        color: theme.primaryColor,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.vehicle == null
                            ? 'Tambah Kendaraan'
                            : 'Edit Kendaraan',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                          color: theme.primaryColor,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                      splashRadius: 20,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Category selector
                const Text(
                  'Kategori Kendaraan',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Pilih kategori yang sesuai dengan kendaraan Anda',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 16),

                // TAMBAHKAN KODE INDIKATOR DI SINI
                if (_vehicleCategoryId <= 0)
                  Container(
                    margin: const EdgeInsets.only(top: 8, bottom: 8),
                    padding: const EdgeInsets.symmetric(
                      vertical: 8,
                      horizontal: 12,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 16,
                          color: Colors.orange.shade800,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Harap pilih kategori kendaraan untuk melanjutkan',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.orange.shade800,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Kategori kendaraan dengan expandable sections
                ...categoriesByType.entries.map((entry) {
                  final vehicleType = entry.key;
                  final categories = entry.value;
                  final bookingProvider = Provider.of<BookingProvider>(
                    context,
                    listen: false,
                  );

                  // Periksa apakah jenis kendaraan tersedia pada ferry yang dipilih
                  final bool isAvailable = bookingProvider
                      .isVehicleTypeAvailable(vehicleType);

                  return ExpansionTile(
                    initiallyExpanded:
                        isAvailable, // Hanya expand yang tersedia secara default
                    leading: Icon(
                      _getVehicleTypeIcon(vehicleType),
                      color:
                          isAvailable
                              ? theme.primaryColor
                              : Colors.grey.shade400,
                    ),
                    title: Row(
                      children: [
                        Text(
                          _getVehicleTypeName(vehicleType),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color:
                                isAvailable
                                    ? Colors.black87
                                    : Colors.grey.shade400,
                          ),
                        ),
                        if (!isAvailable) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Penuh',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.red.shade700,
                              ),
                            ),
                          ),
                        ] else ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Tersedia ${_getAvailableCapacity(vehicleType, bookingProvider)}',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.green.shade700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    subtitle: Text(
                      isAvailable
                          ? '${categories.length} golongan tersedia'
                          : 'Kapasitas tidak tersedia pada kapal ini',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    children:
                        isAvailable
                            ? [
                              const SizedBox(height: 8),
                              GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 2,
                                      childAspectRatio: 2.0,
                                      crossAxisSpacing: 10,
                                      mainAxisSpacing: 10,
                                    ),
                                itemCount: categories.length,
                                itemBuilder: (context, index) {
                                  final category = categories[index];
                                  return _buildCategoryCard(category);
                                },
                              ),
                              const SizedBox(height: 8),
                            ]
                            : [], // Tidak tampilkan children jika tidak tersedia
                  );
                }).toList(),

                const SizedBox(height: 24),

                // License Plate Field
                const Text(
                  'Informasi Kendaraan',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _licensePlateController,
                  decoration: InputDecoration(
                    labelText: 'Plat Nomor',
                    hintText: 'Contoh: AB 1234 CD',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.confirmation_number),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 12,
                    ),
                  ),
                  textCapitalization: TextCapitalization.characters,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Silakan masukkan plat nomor';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Brand Field
                TextFormField(
                  controller: _brandController,
                  decoration: InputDecoration(
                    labelText: 'Merk',
                    hintText: 'Contoh: Toyota, Honda, dll',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.branding_watermark),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Model Field
                TextFormField(
                  controller: _modelController,
                  decoration: InputDecoration(
                    labelText: 'Model',
                    hintText: 'Contoh: Avanza, Jazz, dll',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.model_training),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Weight Field
                TextFormField(
                  controller: _weightController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Berat (kg)',
                    hintText: 'Opsional',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.scale),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 12,
                    ),
                  ),
                  validator: (value) {
                    if (value != null && value.isNotEmpty) {
                      final weight = double.tryParse(value);
                      if (weight == null) {
                        return 'Masukkan angka yang valid';
                      }
                      if (weight <= 0) {
                        return 'Berat harus lebih dari 0 kg';
                      }
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 32),

                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('Batal'),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _saveVehicle,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          widget.vehicle == null ? 'Simpan' : 'Perbarui',
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryCard(VehicleCategory category) {
    final isSelected = _vehicleCategoryId == category.id;
    final theme = Theme.of(context);
    final categoryColor = _getCategoryColor(category.code);
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    // Periksa apakah jenis kendaraan tersedia pada ferry yang dipilih
    final bool isAvailable = bookingProvider.isVehicleTypeAvailable(
      category.vehicleType,
    );

    // Dapatkan kapasitas tersedia
    final int availableCapacity = bookingProvider.getAvailableVehicleCapacity(
      category.vehicleType,
    );

    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return InkWell(
      onTap:
          isAvailable
              ? () => _selectVehicleCategory(category.id)
              : null, // Disable tap jika tidak tersedia
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color:
                isSelected
                    ? categoryColor
                    : isAvailable
                    ? Colors.grey.shade300
                    : Colors
                        .red
                        .shade200, // Ubah warna border untuk kapasitas penuh
            width: isSelected ? 2 : 1,
          ),
          color:
              !isAvailable
                  ? Colors
                      .red
                      .shade50 // Warna latar untuk kapasitas penuh
                  : isSelected
                  ? categoryColor.withOpacity(0.1)
                  : Colors.white,
        ),
        child: Row(
          children: [
            // Badge dengan icon status
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color:
                    isAvailable
                        ? categoryColor.withOpacity(0.1)
                        : Colors
                            .red
                            .shade100, // Warna latar badge untuk kapasitas penuh
                shape: BoxShape.circle,
              ),
              child:
                  isSelected
                      ? Icon(Icons.check_circle, color: categoryColor, size: 14)
                      : !isAvailable
                      ? Icon(
                        Icons.block,
                        color: Colors.red.shade400,
                        size: 14,
                      ) // Ikon blokir untuk kapasitas penuh
                      : Text(
                        category.code.substring(0, 3),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color:
                              isAvailable
                                  ? categoryColor
                                  : Colors.grey.shade400,
                        ),
                      ),
            ),
            const SizedBox(width: 6),
            // Informasi kategori dan harga
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    category.code,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color:
                          isAvailable
                              ? categoryColor
                              : Colors
                                  .red
                                  .shade400, // Ubah warna teks untuk kapasitas penuh
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Row(
                    children: [
                      Text(
                        isAvailable
                            ? currencyFormat.format(category.basePrice)
                            : 'Penuh', // Tampilkan 'Penuh' alih-alih 'Tidak Tersedia'
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color:
                              isAvailable
                                  ? theme.primaryColor
                                  : Colors
                                      .red
                                      .shade400, // Ubah warna teks untuk kapasitas penuh
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (isAvailable && availableCapacity > 0)
                        Text(
                          ' (${availableCapacity})',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.green.shade700,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getVehicleTypeIcon(String vehicleType) {
    switch (vehicleType) {
      case 'MOTORCYCLE':
        return Icons.motorcycle;
      case 'CAR':
        return Icons.directions_car;
      case 'BUS':
        return Icons.directions_bus;
      case 'TRUCK':
        return Icons.local_shipping;
      case 'PICKUP':
        return Icons.airport_shuttle;
      case 'TRONTON':
        return Icons.fire_truck;
      default:
        return Icons.directions_car;
    }
  }

  String _getVehicleTypeName(String vehicleType) {
    switch (vehicleType) {
      case 'MOTORCYCLE':
        return 'Sepeda Motor';
      case 'CAR':
        return 'Mobil';
      case 'BUS':
        return 'Bus';
      case 'TRUCK':
        return 'Truk';
      case 'PICKUP':
        return 'Pickup';
      case 'TRONTON':
        return 'Tronton';
      default:
        return vehicleType;
    }
  }

  String _getAvailableCapacity(
    String vehicleType,
    BookingProvider bookingProvider,
  ) {
    // Gunakan metode baru dari BookingProvider
    final availableCapacity = bookingProvider.getAvailableVehicleCapacity(
      vehicleType,
    );

    // Tampilkan pesan "Penuh" jika kapasitas 0
    return availableCapacity > 0 ? '$availableCapacity' : 'Penuh';
  }

  Color _getCategoryColor(String code) {
    if (code.contains("GOL I")) {
      return Colors.orange;
    } else if (code.contains("GOL II")) {
      return Colors.blue;
    } else if (code.contains("GOL III")) {
      return Colors.green;
    } else if (code.contains("GOL IV")) {
      return Colors.amber;
    } else if (code.contains("GOL V")) {
      return Colors.purple;
    } else if (code.contains("GOL VI")) {
      return Colors.teal;
    } else {
      return Theme.of(context).primaryColor;
    }
  }
}

// Helper functions for buildDetailedPriceSection (perlu didefinisikan jika belum ada di vehicle_price_details.dart)
Widget buildDetailedPriceSection(
  BuildContext context,
  List<VehicleCategory> categories,
  bool isLoading,
  String? errorMessage,
  Function retryFetchCategories,
) {
  final ThemeData theme = Theme.of(context);
  final currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  if (isLoading) {
    return _buildLoadingState();
  }

  if (errorMessage != null) {
    return _buildErrorState(errorMessage, retryFetchCategories);
  }

  if (categories.isEmpty) {
    return _buildEmptyState();
  }

  // Mengelompokkan kategori berdasarkan tipe kendaraan
  final Map<String, List<VehicleCategory>> categoriesByType = {};
  for (var category in categories) {
    if (!categoriesByType.containsKey(category.vehicleType)) {
      categoriesByType[category.vehicleType] = [];
    }
    categoriesByType[category.vehicleType]!.add(category);
  }

  return Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 4),
          spreadRadius: 0,
        ),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header Section
        Row(
          children: [
            Icon(Icons.payments_outlined, color: theme.primaryColor, size: 18),
            const SizedBox(width: 8),
            const Text(
              'Biaya Tambahan untuk Kendaraan',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15,
                color: Colors.black87,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        // Info tooltip
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.blue.shade100),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Colors.blue.shade700),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Tarif kendaraan berdasarkan golongan. Klik kartu untuk informasi detail.',
                  style: TextStyle(fontSize: 12, color: Colors.blue.shade700),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Ekspandable section by vehicle type
        ...categoriesByType.entries.map((entry) {
          final vehicleType = entry.key;
          final vehicleCategories = entry.value;

          return _buildVehicleTypeExpansion(
            context,
            vehicleType,
            vehicleCategories,
            currencyFormat,
          );
        }).toList(),
      ],
    ),
  );
}

Widget _buildVehicleTypeExpansion(
  BuildContext context,
  String vehicleType,
  List<VehicleCategory> categories,
  NumberFormat currencyFormat,
) {
  final vehicleTypeName = _getVehicleTypeName(vehicleType);
  final icon = _getVehicleTypeIcon(vehicleType);

  return Card(
    margin: const EdgeInsets.only(bottom: 12),
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
      side: BorderSide(color: Colors.grey.shade200),
    ),
    child: Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        initiallyExpanded: true,
        leading: Icon(icon, size: 20, color: Theme.of(context).primaryColor),
        title: Text(
          vehicleTypeName,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          '${categories.length} golongan',
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        children: [
          // Mengubah ListView menjadi Wrap untuk layout yang lebih fleksibel
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children:
                  categories
                      .map(
                        (category) => _buildSimpleDetailedCategoryCard(
                          context,
                          category,
                          currencyFormat,
                        ),
                      )
                      .toList(),
            ),
          ),
        ],
      ),
    ),
  );
}

// Versi sederhana dari kartu kategori untuk ditampilkan dalam daftar
Widget _buildSimpleDetailedCategoryCard(
  BuildContext context,
  VehicleCategory category,
  NumberFormat currencyFormat,
) {
  final categoryColor = _getCategoryColor(category.code);

  return InkWell(
    onTap: () => _showCategoryDetailDialog(context, category, currencyFormat),
    borderRadius: BorderRadius.circular(10),
    child: Container(
      width:
          (MediaQuery.of(context).size.width - 72) /
          2, // 2 columns, minus padding
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          // Badge dengan kode golongan
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: categoryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Text(
              category.code.substring(0, 3),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 10,
                color: categoryColor,
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Informasi kategori dengan harga
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  category.code,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    color: categoryColor,
                  ),
                  maxLines: 1,
                ),
                Text(
                  currencyFormat.format(category.basePrice),
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(context).primaryColor,
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

// Helper function for _buildVehicleTypeExpansion
Widget _buildDetailedCategoryCard(
  BuildContext context,
  VehicleCategory category,
  NumberFormat currencyFormat,
) {
  return InkWell(
    onTap: () => _showCategoryDetailDialog(context, category, currencyFormat),
    child: Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Badge dengan kode golongan
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            decoration: BoxDecoration(
              color: _getCategoryColor(category.code).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              category.code,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: _getCategoryColor(category.code),
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Informasi kategori
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  category.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                if (category.description != null &&
                    category.description!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      category.description!,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
          ),

          // Harga
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              currencyFormat.format(category.basePrice),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: Theme.of(context).primaryColor,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

// Helper function for _buildDetailedCategoryCard
void _showCategoryDetailDialog(
  BuildContext context,
  VehicleCategory category,
  NumberFormat currencyFormat,
) {
  showDialog(
    context: context,
    builder:
        (context) => Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(
                          category.code,
                        ).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _getVehicleTypeIcon(category.vehicleType),
                        color: _getCategoryColor(category.code),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            category.code,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: _getCategoryColor(category.code),
                            ),
                          ),
                          Text(
                            category.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Harga
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Tarif',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currencyFormat.format(category.basePrice),
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Detail informasi
                const Text(
                  'Informasi Kendaraan',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),

                // Tipe kendaraan
                _buildInfoRow(
                  'Tipe',
                  _getVehicleTypeName(category.vehicleType),
                  Icons.category_outlined,
                ),
                const SizedBox(height: 10),

                // Deskripsi
                _buildInfoRow(
                  'Deskripsi',
                  category.description ?? 'Tidak ada deskripsi',
                  Icons.description_outlined,
                ),
                const SizedBox(height: 16),

                // Tombol tutup
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Tutup'),
                  ),
                ),
              ],
            ),
          ),
        ),
  );
}

// Helper function for _showCategoryDetailDialog
Widget _buildInfoRow(String label, String value, IconData icon) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 16, color: Colors.grey.shade700),
      ),
      const SizedBox(width: 12),
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    ],
  );
}

// Helper function for buildDetailedPriceSection
Widget _buildLoadingState() {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 4),
          spreadRadius: 0,
        ),
      ],
    ),
    child: Center(
      child: Column(
        children: [
          const SizedBox(height: 10),
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            'Memuat data kategori kendaraan...',
            style: TextStyle(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 10),
        ],
      ),
    ),
  );
}

// Helper function for buildDetailedPriceSection
Widget _buildErrorState(String errorMessage, Function retryFunction) {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 4),
          spreadRadius: 0,
        ),
      ],
    ),
    child: Center(
      child: Column(
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 36),
          const SizedBox(height: 10),
          Text(
            'Gagal memuat kategori kendaraan',
            style: TextStyle(color: Colors.grey.shade700),
          ),
          const SizedBox(height: 8),
          Text(
            errorMessage,
            style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () => retryFunction(),
            child: const Text('Coba Lagi'),
          ),
        ],
      ),
    ),
  );
}

// Helper function for buildDetailedPriceSection
Widget _buildEmptyState() {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 10,
          offset: const Offset(0, 4),
          spreadRadius: 0,
        ),
      ],
    ),
    child: Center(
      child: Text(
        'Tidak ada data kategori kendaraan',
        style: TextStyle(color: Colors.grey.shade600),
      ),
    ),
  );
}

// Helper function for VehicleDetailsScreen and _VehicleDialog
IconData _getVehicleTypeIcon(String vehicleType) {
  switch (vehicleType) {
    case 'MOTORCYCLE':
      return Icons.motorcycle;
    case 'CAR':
      return Icons.directions_car;
    case 'BUS':
      return Icons.directions_bus;
    case 'TRUCK':
      return Icons.local_shipping;
    case 'PICKUP':
      return Icons.airport_shuttle;
    case 'TRONTON':
      return Icons.fire_truck;
    default:
      return Icons.directions_car;
  }
}

// Helper function for VehicleDetailsScreen and _VehicleDialog
String _getVehicleTypeName(String vehicleType) {
  switch (vehicleType) {
    case 'MOTORCYCLE':
      return 'Sepeda Motor';
    case 'CAR':
      return 'Mobil';
    case 'BUS':
      return 'Bus';
    case 'TRUCK':
      return 'Truk';
    case 'PICKUP':
      return 'Pickup';
    case 'TRONTON':
      return 'Tronton';
    default:
      return vehicleType;
  }
}

// Helper function for VehicleDetailsScreen and _VehicleDialog
Color _getCategoryColor(String code) {
  if (code.contains("GOL I")) {
    return Colors.orange;
  } else if (code.contains("GOL II")) {
    return Colors.blue;
  } else if (code.contains("GOL III")) {
    return Colors.green;
  } else if (code.contains("GOL IV")) {
    return Colors.amber;
  } else if (code.contains("GOL V")) {
    return Colors.purple;
  } else if (code.contains("GOL VI")) {
    return Colors.teal;
  } else {
    return Colors.indigo;
  }
}
