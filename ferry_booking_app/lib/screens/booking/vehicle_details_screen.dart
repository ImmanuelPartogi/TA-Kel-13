import 'package:ferry_booking_app/models/vehicle.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class VehicleDetailsScreen extends StatefulWidget {
  const VehicleDetailsScreen({Key? key}) : super(key: key);

  @override
  _VehicleDetailsScreenState createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends State<VehicleDetailsScreen> {
  final _formKey = GlobalKey<FormState>();

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
      // PERUBAHAN: Kirim null Vehicle dan terima Vehicle pada callback
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
      // PERUBAHAN: Kirim objek Vehicle dan terima Vehicle pada callback
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
    bookingProvider.removeVehicle(index);
  }

  void _continueToSummary() {
    Navigator.pushNamed(context, '/booking/summary');
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final vehicles = bookingProvider.vehicles;
    final route = bookingProvider.selectedRoute;

    if (route == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/booking/routes');
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Detail Kendaraan',
        showBackButton: true,
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Instructions
            Container(
              padding: const EdgeInsets.all(16.0),
              color: Colors.blue[50],
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue[700]),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Tambahkan kendaraan jika Anda membawa kendaraan. Jika tidak, lewati langkah ini.',
                      style: TextStyle(color: Colors.blue[700]),
                    ),
                  ),
                ],
              ),
            ),

            // Vehicle Prices
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Biaya Tambahan untuk Kendaraan:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildPriceCard(
                          'Motor',
                          'Rp ${route.motorcyclePrice.toStringAsFixed(0)}',
                          Icons.motorcycle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildPriceCard(
                          'Mobil',
                          'Rp ${route.carPrice.toStringAsFixed(0)}',
                          Icons.directions_car,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildPriceCard(
                          'Bus',
                          'Rp ${route.busPrice.toStringAsFixed(0)}',
                          Icons.directions_bus,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildPriceCard(
                          'Truk',
                          'Rp ${route.truckPrice.toStringAsFixed(0)}',
                          Icons.local_shipping,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Vehicle List
            Expanded(
              child:
                  vehicles.isEmpty
                      ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.directions_car_outlined,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Belum ada kendaraan',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ElevatedButton(
                              onPressed: _addVehicle,
                              child: const Text('Tambah Kendaraan'),
                            ),
                          ],
                        ),
                      )
                      : ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: vehicles.length,
                        itemBuilder: (context, index) {
                          // PERUBAHAN: Akses langsung objek Vehicle
                          final vehicle = vehicles[index];

                          IconData vehicleIcon;
                          // PERUBAHAN: Akses properti objek, bukan key Map
                          switch (vehicle.type) {
                            case 'MOTORCYCLE':
                              vehicleIcon = Icons.motorcycle;
                              break;
                            case 'CAR':
                              vehicleIcon = Icons.directions_car;
                              break;
                            case 'BUS':
                              vehicleIcon = Icons.directions_bus;
                              break;
                            case 'TRUCK':
                              vehicleIcon = Icons.local_shipping;
                              break;
                            default:
                              vehicleIcon = Icons.directions_car;
                          }

                          String vehicleType;
                          switch (vehicle.type) {
                            case 'MOTORCYCLE':
                              vehicleType = 'Motor';
                              break;
                            case 'CAR':
                              vehicleType = 'Mobil';
                              break;
                            case 'BUS':
                              vehicleType = 'Bus';
                              break;
                            case 'TRUCK':
                              vehicleType = 'Truk';
                              break;
                            default:
                              vehicleType = 'Kendaraan';
                          }

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            vehicleIcon,
                                            color:
                                                Theme.of(context).primaryColor,
                                            size: 32,
                                          ),
                                          const SizedBox(width: 12),
                                          Text(
                                            vehicleType,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.edit),
                                            color: Colors.blue,
                                            onPressed:
                                                () => _editVehicle(index),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.delete),
                                            color: Colors.red,
                                            onPressed:
                                                () => _removeVehicle(index),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const Divider(),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Plat Nomor: ${vehicle.licensePlate}',
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                  if (vehicle.brand != null &&
                                      vehicle.brand!.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      'Merk/Model: ${vehicle.brand} ${vehicle.model ?? ''}',
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
            ),

            // Bottom Bar
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
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.add_circle_outline),
                      label: const Text('Tambah Kendaraan'),
                      onPressed: _addVehicle,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _continueToSummary,
                      child: const Text('Lanjutkan'),
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

  Widget _buildPriceCard(String title, String price, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Icon(icon, color: Theme.of(context).primaryColor, size: 32),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(
              price,
              style: TextStyle(
                color: Theme.of(context).primaryColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VehicleDialog extends StatefulWidget {
  // PERUBAHAN: Terima Vehicle daripada Map
  final Vehicle? vehicle;
  // PERUBAHAN: Ubah parameter callback
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
    // PERUBAHAN: Akses objek Vehicle, bukan Map
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
      // PERUBAHAN: Buat objek Vehicle
      final vehicle = Vehicle(
        // Gunakan ID existing jika sedang edit, atau -1 jika baru
        id: widget.vehicle?.id ?? -1,
        bookingId: widget.vehicle?.bookingId ?? -1,
        userId: widget.vehicle?.userId ?? -1,
        type: _type,
        licensePlate: _licensePlateController.text.trim().toUpperCase(),
        // Brand dan model bisa kosong tapi tidak null
        brand: _brandController.text.trim(),
        model: _modelController.text.trim(),
        // Gunakan nilai existing jika ada
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
    return AlertDialog(
      title: Text(
        widget.vehicleData == null ? 'Tambah Kendaraan' : 'Edit Kendaraan',
      ),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Vehicle Type Selector
              const Text(
                'Jenis Kendaraan',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildVehicleTypeOption(
                      'MOTORCYCLE',
                      'Motor',
                      Icons.motorcycle,
                    ),
                  ),
                  Expanded(
                    child: _buildVehicleTypeOption(
                      'CAR',
                      'Mobil',
                      Icons.directions_car,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Expanded(
                    child: _buildVehicleTypeOption(
                      'BUS',
                      'Bus',
                      Icons.directions_bus,
                    ),
                  ),
                  Expanded(
                    child: _buildVehicleTypeOption(
                      'TRUCK',
                      'Truk',
                      Icons.local_shipping,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // License Plate Field
              TextFormField(
                controller: _licensePlateController,
                decoration: const InputDecoration(labelText: 'Plat Nomor'),
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
                decoration: const InputDecoration(labelText: 'Merk'),
              ),
              const SizedBox(height: 16),

              // Model Field
              TextFormField(
                controller: _modelController,
                decoration: const InputDecoration(labelText: 'Model'),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Batal'),
        ),
        ElevatedButton(onPressed: _saveVehicle, child: const Text('Simpan')),
      ],
    );
  }

  Widget _buildVehicleTypeOption(String value, String label, IconData icon) {
    final isSelected = _type == value;

    return InkWell(
      onTap: () {
        setState(() {
          _type = value;
        });
      },
      child: Container(
        margin: const EdgeInsets.all(8.0),
        padding: const EdgeInsets.all(12.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
            width: isSelected ? 2 : 1,
          ),
          color:
              isSelected
                  ? Theme.of(context).primaryColor.withOpacity(0.1)
                  : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color:
                    isSelected ? Theme.of(context).primaryColor : Colors.grey,
                fontWeight: isSelected ? FontWeight.bold : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
