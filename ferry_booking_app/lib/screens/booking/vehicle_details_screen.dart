import 'package:ferry_booking_app/models/vehicle.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:intl/intl.dart';

class VehicleDetailsScreen extends StatefulWidget {
  const VehicleDetailsScreen({Key? key}) : super(key: key);

  @override
  _VehicleDetailsScreenState createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends State<VehicleDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  void _addVehicle() {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    if (bookingProvider.vehicles.length >= AppConfig.maxVehiclesPerBooking) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Maksimal ${AppConfig.maxVehiclesPerBooking} kendaraan per pemesanan',
          ),
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder:
          (context) => _VehicleDialog(
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
            onSave: (updatedVehicle) {
              bookingProvider.updateVehicle(index, updatedVehicle);
              Navigator.pop(context);
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
            title: const Text('Konfirmasi Hapus'),
            content: const Text(
              'Apakah Anda yakin ingin menghapus kendaraan ini?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Batal'),
              ),
              TextButton(
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                onPressed: () {
                  bookingProvider.removeVehicle(index);
                  Navigator.of(context).pop();
                },
                child: const Text('Hapus'),
              ),
            ],
          ),
    );
  }

  void _continueToSummary() {
    Navigator.pushNamed(context, '/booking/summary');
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
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Instructions Card
                        _buildInformationCard(theme),

                        // Vehicle Prices Section
                        _buildPriceSection(route, theme),

                        // Vehicle List Section
                        const SizedBox(height: 16),
                        Text(
                          'Kendaraan Anda',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade800,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Vehicle List or Empty State
                        vehicles.isEmpty
                            ? _buildEmptyVehicleState()
                            : _buildVehicleList(vehicles, theme),

                        // Space at the bottom
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Bottom Bar fixed at bottom
            _buildBottomBar(),
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

  Widget _buildPriceSection(dynamic route, ThemeData theme) {
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
          Row(
            children: [
              Icon(
                Icons.payments_outlined,
                color: theme.primaryColor,
                size: 18,
              ),
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
          const SizedBox(height: 16),
          // Grid layout
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio:
                2.5, // Lebih lebar untuk tampilan lebih profesional
            children: [
              _buildPriceCard(
                'Motor',
                currencyFormat.format(route.motorcyclePrice),
                Icons.motorcycle,
              ),
              _buildPriceCard(
                'Mobil',
                currencyFormat.format(route.carPrice),
                Icons.directions_car,
              ),
              _buildPriceCard(
                'Bus',
                currencyFormat.format(route.busPrice),
                Icons.directions_bus,
              ),
              _buildPriceCard(
                'Truk',
                currencyFormat.format(route.truckPrice),
                Icons.local_shipping,
              ),
            ],
          ),
        ],
      ),
    );
  }

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
        ],
      ),
    );
  }

  Widget _buildVehicleList(List<Vehicle> vehicles, ThemeData theme) {
    // Menggunakan Column sebagai pengganti ListView.builder untuk menghindari konflik scroll
    return Column(
      children:
          vehicles.map((vehicle) {
            // Mendapatkan icon & tipe kendaraan
            IconData vehicleIcon;
            String vehicleType;

            switch (vehicle.type) {
              case 'MOTORCYCLE':
                vehicleIcon = Icons.motorcycle;
                vehicleType = 'Motor';
                break;
              case 'CAR':
                vehicleIcon = Icons.directions_car;
                vehicleType = 'Mobil';
                break;
              case 'BUS':
                vehicleIcon = Icons.directions_bus;
                vehicleType = 'Bus';
                break;
              case 'TRUCK':
                vehicleIcon = Icons.local_shipping;
                vehicleType = 'Truk';
                break;
              default:
                vehicleIcon = Icons.directions_car;
                vehicleType = 'Kendaraan';
            }

            // Mendapatkan index untuk edit & delete
            final index = vehicles.indexOf(vehicle);

            return Container(
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
                      color: _getVehicleColor(vehicle.type).withOpacity(0.05),
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
                                color: _getVehicleColor(
                                  vehicle.type,
                                ).withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                vehicleIcon,
                                color: _getVehicleColor(vehicle.type),
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  vehicleType,
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
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
    );
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

  Color _getVehicleColor(String type) {
    switch (type) {
      case 'MOTORCYCLE':
        return Colors.orange;
      case 'CAR':
        return Colors.blue;
      case 'BUS':
        return Colors.green;
      case 'TRUCK':
        return Colors.purple;
      default:
        return Colors.blue;
    }
  }

Widget _buildBottomBar() {
  return Container(
    padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
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
    ),
    child: Row(
      children: [
        // Tombol Tambah - sekarang sama lebarnya dengan Expanded
        Expanded(
          child: OutlinedButton(
            onPressed: _addVehicle,
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
                if (states.contains(MaterialState.pressed)) {
                  return BorderSide(
                    color: Theme.of(context).primaryColor,
                    width: 2,
                  );
                }
                return BorderSide(
                  color: Theme.of(context).primaryColor.withOpacity(0.7),
                  width: 1.5,
                );
              }),
              overlayColor: MaterialStateProperty.all(
                Theme.of(context).primaryColor.withOpacity(0.05),
              ),
            ),
            child: Text(
              'Tambah',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).primaryColor,
                letterSpacing: 0.3,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        // Tombol Lanjutkan - juga Expanded untuk ukuran sama
        Expanded(
          child: ElevatedButton(
            onPressed: _continueToSummary,
            style: ButtonStyle(
              padding: WidgetStateProperty.all(
                const EdgeInsets.symmetric(vertical: 16),
              ),
              backgroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.pressed)) {
                  return Theme.of(context).primaryColor.withOpacity(0.9);
                }
                return Theme.of(context).primaryColor;
              }),
              shape: WidgetStateProperty.all(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              elevation: WidgetStateProperty.all(0),
              shadowColor: WidgetStateProperty.all(
                // ignore: deprecated_member_use
                Theme.of(context).primaryColor.withOpacity(0.4),
              ),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: const Text(
                'Lanjutkan',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

  Widget _buildPriceCard(String title, String price, IconData icon) {
    final Color iconColor = _getVehicleColorForIcon(title);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 16),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisSize:
                    MainAxisSize.min, // Tambahkan ini untuk mencegah overflow
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 12, // Kurangi ukuran font dari 13
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 2), // Kurangi spacing dari 4
                  Text(
                    price,
                    style: TextStyle(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 13, // Kurangi ukuran font dari 14
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

  Color _getVehicleColorForIcon(String type) {
    switch (type) {
      case 'Motor':
        return Colors.orange;
      case 'Mobil':
        return Colors.blue;
      case 'Bus':
        return Colors.green;
      case 'Truk':
        return Colors.purple;
      default:
        return Theme.of(context).primaryColor;
    }
  }
}

// Dialog class tetap sama dengan sebelumnya
class _VehicleDialog extends StatefulWidget {
  final Vehicle? vehicle;
  final Function(Vehicle) onSave;

  const _VehicleDialog({Key? key, this.vehicle, required this.onSave})
    : super(key: key);

  get vehicleData => null;

  @override
  __VehicleDialogState createState() => __VehicleDialogState();
}

class __VehicleDialogState extends State<_VehicleDialog> {
  final _formKey = GlobalKey<FormState>();
  String _type = 'MOTORCYCLE';
  late TextEditingController _licensePlateController;
  late TextEditingController _brandController;
  late TextEditingController _modelController;

  @override
  void initState() {
    super.initState();
    _type = widget.vehicle?.type ?? 'MOTORCYCLE';
    _licensePlateController = TextEditingController(
      text: widget.vehicle?.licensePlate ?? '',
    );
    _brandController = TextEditingController(text: widget.vehicle?.brand ?? '');
    _modelController = TextEditingController(text: widget.vehicle?.model ?? '');
  }

  @override
  void dispose() {
    _licensePlateController.dispose();
    _brandController.dispose();
    _modelController.dispose();
    super.dispose();
  }

  void _saveVehicle() {
    if (_formKey.currentState!.validate()) {
      final vehicle = Vehicle(
        id: widget.vehicle?.id ?? -1,
        bookingId: widget.vehicle?.bookingId ?? -1,
        userId: widget.vehicle?.userId ?? -1,
        type: _type,
        licensePlate: _licensePlateController.text.trim().toUpperCase(),
        brand: _brandController.text.trim(),
        model: _modelController.text.trim(),
        weight: widget.vehicle?.weight,
        createdAt:
            widget.vehicle?.createdAt ?? DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      );

      widget.onSave(vehicle);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Dialog header
                Text(
                  widget.vehicle == null
                      ? 'Tambah Kendaraan'
                      : 'Edit Kendaraan',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                const SizedBox(height: 20),

                // Vehicle Type Selector
                const Text(
                  'Jenis Kendaraan',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),

                // Row 1: Motorcycle and Car
                Row(
                  children: [
                    Expanded(
                      child: _buildVehicleTypeOption(
                        'MOTORCYCLE',
                        'Motor',
                        Icons.motorcycle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildVehicleTypeOption(
                        'CAR',
                        'Mobil',
                        Icons.directions_car,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Row 2: Bus and Truck
                Row(
                  children: [
                    Expanded(
                      child: _buildVehicleTypeOption(
                        'BUS',
                        'Bus',
                        Icons.directions_bus,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildVehicleTypeOption(
                        'TRUCK',
                        'Truk',
                        Icons.local_shipping,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // License Plate Field
                TextFormField(
                  controller: _licensePlateController,
                  decoration: InputDecoration(
                    labelText: 'Plat Nomor',
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
                const SizedBox(height: 20),

                // Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                      ),
                      child: const Text('Batal'),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: _saveVehicle,
                      icon: const Icon(Icons.save, size: 16),
                      label: const Text('Simpan'),
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
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

  Widget _buildVehicleTypeOption(String value, String label, IconData icon) {
    final isSelected = _type == value;
    final theme = Theme.of(context);

    Color getVehicleColor(String type) {
      switch (type) {
        case 'MOTORCYCLE':
          return Colors.orange;
        case 'CAR':
          return Colors.blue;
        case 'BUS':
          return Colors.green;
        case 'TRUCK':
          return Colors.purple;
        default:
          return theme.primaryColor;
      }
    }

    final vehicleColor = getVehicleColor(value);

    return InkWell(
      onTap: () {
        setState(() {
          _type = value;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? vehicleColor : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          color:
              isSelected ? vehicleColor.withOpacity(0.1) : Colors.grey.shade50,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? vehicleColor : Colors.grey.shade500,
              size: 24,
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? vehicleColor : Colors.grey.shade700,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
