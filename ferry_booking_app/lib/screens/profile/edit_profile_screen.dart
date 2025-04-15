import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({Key? key}) : super(key: key);

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _idNumberController;
  String? _idType;
  String? _gender;
  DateTime? _dateOfBirth;
  
  @override
  void initState() {
    super.initState();
    _initUserData();
  }
  
  void _initUserData() {
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    
    if (user != null) {
      _nameController = TextEditingController(text: user.name);
      _phoneController = TextEditingController(text: user.phone);
      _addressController = TextEditingController(text: user.address ?? '');
      _idNumberController = TextEditingController(text: user.idNumber ?? '');
      _idType = user.idType;
      _gender = user.gender;
      
      if (user.dateOfBirthday != null) {
        try {
          _dateOfBirth = DateTime.parse(user.dateOfBirthday!);
        } catch (e) {
          _dateOfBirth = null;
        }
      }
    } else {
      _nameController = TextEditingController();
      _phoneController = TextEditingController();
      _addressController = TextEditingController();
      _idNumberController = TextEditingController();
    }
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _idNumberController.dispose();
    super.dispose();
  }
  
  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(1990),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    
    if (picked != null && picked != _dateOfBirth) {
      setState(() {
        _dateOfBirth = picked;
      });
    }
  }
  
  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      final profileData = {
        'name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'id_number': _idNumberController.text.trim(),
        'id_type': _idType,
        'gender': _gender,
        'date_of_birthday': _dateOfBirth?.toIso8601String().split('T')[0],
      };
      
      final success = await authProvider.updateProfile(profileData);
      
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profil berhasil diperbarui'),
          ),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    
    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Edit Profil',
        showBackButton: true,
      ),
      body: authProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Informasi Pribadi',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Name Field
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Nama Lengkap',
                        prefixIcon: Icon(Icons.person),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Silakan masukkan nama lengkap';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    // Phone Field
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Nomor Telepon',
                        prefixIcon: Icon(Icons.phone),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Silakan masukkan nomor telepon';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    // Address Field
                    TextFormField(
                      controller: _addressController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'Alamat',
                        prefixIcon: Icon(Icons.home),
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // ID Type Dropdown
                    DropdownButtonFormField<String>(
                      value: _idType,
                      decoration: const InputDecoration(
                        labelText: 'Jenis Identitas',
                        prefixIcon: Icon(Icons.badge),
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
                        setState(() {
                          _idType = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    
                    // ID Number Field
                    TextFormField(
                      controller: _idNumberController,
                      decoration: const InputDecoration(
                        labelText: 'Nomor Identitas',
                        prefixIcon: Icon(Icons.credit_card),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Date of Birth Field
                    InkWell(
                      onTap: () => _selectDate(context),
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Tanggal Lahir',
                          prefixIcon: Icon(Icons.cake),
                        ),
                        child: Text(
                          _dateOfBirth != null
                              ? '${_dateOfBirth!.day}/${_dateOfBirth!.month}/${_dateOfBirth!.year}'
                              : 'Pilih Tanggal',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Gender Radio Buttons
                    InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Jenis Kelamin',
                        prefixIcon: Icon(Icons.person_outline),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 16, 
                          vertical: 8,
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Laki-laki'),
                              value: 'MALE',
                              groupValue: _gender,
                              onChanged: (value) {
                                setState(() {
                                  _gender = value;
                                });
                              },
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Perempuan'),
                              value: 'FEMALE',
                              groupValue: _gender,
                              onChanged: (value) {
                                setState(() {
                                  _gender = value;
                                });
                              },
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: authProvider.isLoading ? null : _saveProfile,
                        child: authProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.0,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Simpan Perubahan'),
                      ),
                    ),
                    if (authProvider.errorMessage != null)
                      Container(
                        margin: const EdgeInsets.only(top: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          authProvider.errorMessage!,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                            fontSize: 14,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}