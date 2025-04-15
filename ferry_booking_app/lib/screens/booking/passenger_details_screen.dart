import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/config/app_config.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class PassengerDetailsScreen extends StatefulWidget {
  const PassengerDetailsScreen({Key? key}) : super(key: key);

  @override
  _PassengerDetailsScreenState createState() => _PassengerDetailsScreenState();
}

class _PassengerDetailsScreenState extends State<PassengerDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  
  @override
  void initState() {
    super.initState();
    _initPassengerData();
  }
  
  void _initPassengerData() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    // If no passengers added yet, add the logged in user as first passenger
    if (bookingProvider.passengers.isEmpty && authProvider.user != null) {
      final user = authProvider.user!;
      bookingProvider.addPassenger({
        'name': user.name,
        'id_number': user.idNumber ?? '',
        'id_type': user.idType ?? 'KTP',
      });
    }
  }
  
  void _addPassenger() {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    if (bookingProvider.passengers.length >= AppConfig.maxPassengersPerBooking) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Maksimal ${AppConfig.maxPassengersPerBooking} penumpang per pemesanan'),
        ),
      );
      return;
    }
    
    showDialog(
      context: context,
      builder: (context) => _PassengerDialog(
        onSave: (passengerData) {
          bookingProvider.addPassenger(passengerData);
          Navigator.pop(context);
        },
      ),
    );
  }
  
  void _editPassenger(int index) {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    final passenger = bookingProvider.passengers[index];
    
    showDialog(
      context: context,
      builder: (context) => _PassengerDialog(
        passengerData: passenger,
        onSave: (passengerData) {
          bookingProvider.updatePassenger(index, passengerData);
          Navigator.pop(context);
        },
      ),
    );
  }
  
  void _removePassenger(int index) {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    bookingProvider.removePassenger(index);
  }
  
  void _continueToVehicle() {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    if (bookingProvider.passengers.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan tambahkan minimal 1 penumpang'),
        ),
      );
      return;
    }
    
    Navigator.pushNamed(context, '/booking/vehicles');
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final passengers = bookingProvider.passengers;
    
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Detail Penumpang',
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
                  Icon(
                    Icons.info_outline,
                    color: Colors.blue[700],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Silakan masukkan data penumpang. Pastikan sesuai dengan kartu identitas yang berlaku.',
                      style: TextStyle(
                        color: Colors.blue[700],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Passenger List
            Expanded(
              child: passengers.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person_outline,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Belum ada penumpang',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: _addPassenger,
                            child: const Text('Tambah Penumpang'),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: passengers.length,
                      itemBuilder: (context, index) {
                        final passenger = passengers[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Penumpang ${index + 1}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.edit),
                                          color: Colors.blue,
                                          onPressed: () => _editPassenger(index),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete),
                                          color: Colors.red,
                                          onPressed: () => _removePassenger(index),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const Divider(),
                                const SizedBox(height: 8),
                                Text(
                                  'Nama: ${passenger['name']}',
                                  style: const TextStyle(fontSize: 16),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${passenger['id_type']}: ${passenger['id_number']}',
                                  style: const TextStyle(fontSize: 16),
                                ),
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
                      icon: const Icon(Icons.person_add),
                      label: const Text('Tambah Penumpang'),
                      onPressed: _addPassenger,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _continueToVehicle,
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
}

class _PassengerDialog extends StatefulWidget {
  final Map<String, dynamic>? passengerData;
  final Function(Map<String, dynamic>) onSave;
  
  const _PassengerDialog({
    Key? key,
    this.passengerData,
    required this.onSave,
  }) : super(key: key);

  @override
  __PassengerDialogState createState() => __PassengerDialogState();
}

class __PassengerDialogState extends State<_PassengerDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _idNumberController;
  String _idType = 'KTP';
  
  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.passengerData?['name'] ?? '');
    _idNumberController = TextEditingController(text: widget.passengerData?['id_number'] ?? '');
    _idType = widget.passengerData?['id_type'] ?? 'KTP';
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _idNumberController.dispose();
    super.dispose();
  }
  
  void _savePassenger() {
    if (_formKey.currentState!.validate()) {
      widget.onSave({
        'name': _nameController.text.trim(),
        'id_number': _idNumberController.text.trim(),
        'id_type': _idType,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.passengerData == null ? 'Tambah Penumpang' : 'Edit Penumpang'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Name Field
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Lengkap',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Silakan masukkan nama';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              // ID Type Selector
              DropdownButtonFormField<String>(
                value: _idType,
                decoration: const InputDecoration(
                  labelText: 'Jenis Identitas',
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'KTP',
                    child: Text('KTP'),
                  ),
                  DropdownMenuItem(
                    value: 'SIM',
                    child: Text('SIM'),
                  ),
                  DropdownMenuItem(
                    value: 'PASPOR',
                    child: Text('Paspor'),
                  ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _idType = value;
                    });
                  }
                },
              ),
              const SizedBox(height: 16),
              
              // ID Number Field
              TextFormField(
                controller: _idNumberController,
                decoration: const InputDecoration(
                  labelText: 'Nomor Identitas',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Silakan masukkan nomor identitas';
                  }
                  return null;
                },
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
        ElevatedButton(
          onPressed: _savePassenger,
          child: const Text('Simpan'),
        ),
      ],
    );
  }
}