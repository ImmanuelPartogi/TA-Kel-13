import 'package:ferry_booking_app/models/schedule.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:ferry_booking_app/widgets/schedule_card.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ScheduleSelectionScreen extends StatefulWidget {
  final FerryRoute route;

  const ScheduleSelectionScreen({Key? key, required this.route})
    : super(key: key);

  @override
  _ScheduleSelectionScreenState createState() =>
      _ScheduleSelectionScreenState();
}

class _ScheduleSelectionScreenState extends State<ScheduleSelectionScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();

    // Inisialisasi format tanggal Indonesia
    initializeDateFormatting('id_ID', null);

    // Pastikan tanggal menggunakan timezone yang tepat
    _selectedDate = DateTime.now().toLocal();

    // Set route di booking provider dengan aman
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      bookingProvider.setSelectedRoute(widget.route);

      // Panggil load schedules setelah build selesai
      _loadSchedules();
    });
  }

  // Tambahkan method untuk menampilkan pesan jika tidak ada jadwal
  void _showNoSchedulesMessage() {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Tidak ada jadwal tersedia untuk tanggal ini. Silakan pilih tanggal lain.',
          ),
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  String _formatDateForApi(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  // Tambahkan fungsi untuk menyimpan tanggal secara persisten
  void _selectSchedule(Schedule schedule) {
    // Validasi sederhana hanya dengan memeriksa tanggal
    final DateTime now = DateTime.now();
    final bool isToday =
        _selectedDate.year == now.year &&
        _selectedDate.month == now.month &&
        _selectedDate.day == now.day;

    // Jika hari ini, pastikan jam keberangkatan belum lewat
    if (isToday) {
      // Asumsikan departureTime adalah String dalam format "HH:mm:ss" atau DateTime
      if (schedule.departureTime != null) {
        DateTime departureDateTime;
        if (schedule.departureTime is String) {
          final parts = schedule.departureTime.split(':');
          final hour = int.parse(parts[0]);
          final minute = parts.length > 1 ? int.parse(parts[1]) : 0;
          departureDateTime = DateTime(
            _selectedDate.year,
            _selectedDate.month,
            _selectedDate.day,
            hour,
            minute,
          );
        } else {
          final parts = schedule.departureTime.split(':');
          final hour = int.parse(parts[0]);
          final minute = parts.length > 1 ? int.parse(parts[1]) : 0;
          departureDateTime = DateTime(
            _selectedDate.year,
            _selectedDate.month,
            _selectedDate.day,
            hour,
            minute,
          );
        }

        if (departureDateTime.isBefore(now)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Jadwal ini sudah lewat waktu keberangkatan'),
            ),
          );
          return;
        }
      }
    }

    // Lanjutkan dengan booking
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    bookingProvider.setSelectedSchedule(schedule);
    bookingProvider.setSelectedDate(_selectedDate);
    Navigator.pushNamed(context, '/booking/passengers');
  }

  // Modifikasi method _loadSchedules()
  Future<void> _loadSchedules() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(
      context,
      listen: false,
    );
    try {
      // Gunakan method pembantu untuk format tanggal
      final formattedDate = _formatDateForApi(_selectedDate);
      print('DEBUG: Loading schedules for date: $formattedDate');

      await scheduleProvider.getSchedulesByFormattedDate(
        widget.route.id,
        formattedDate,
      );

      // Periksa apakah jadwal tersedia
      if (scheduleProvider.schedules?.isEmpty ?? true) {
        _showNoSchedulesMessage();
      }
    } catch (e) {
      print('ERROR: Failed to load schedules: $e');
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal memuat jadwal: $e')));
      }
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });

      final scheduleProvider = Provider.of<ScheduleProvider>(
        context,
        listen: false,
      );
      await scheduleProvider.getSchedules(widget.route.id, _selectedDate);
    }
  }

  // Di ScheduleSelectionScreen, tambahkan fungsi untuk mencari jadwal hari berikutnya
  Future<void> _findNextAvailableDate() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(
      context,
      listen: false,
    );
    DateTime nextDate = _selectedDate.add(const Duration(days: 1));

    // Coba cari jadwal untuk 7 hari ke depan
    for (int i = 0; i < 7; i++) {
      await scheduleProvider.getSchedules(widget.route.id, nextDate);

      if (scheduleProvider.schedules?.isNotEmpty ?? false) {
        setState(() {
          _selectedDate = nextDate;
        });
        return;
      }

      nextDate = nextDate.add(const Duration(days: 1));
    }

    // Jika tidak ditemukan jadwal dalam 7 hari
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tidak ditemukan jadwal dalam 7 hari ke depan'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheduleProvider = Provider.of<ScheduleProvider>(context);
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final schedules = scheduleProvider.schedules;

    // JANGAN memanggil setter di dalam build
    // bookingProvider.setSelectedRoute(widget.route); <-- HAPUS BARIS INI

    return Scaffold(
      appBar: CustomAppBar(
        title: '${widget.route.origin} - ${widget.route.destination}',
        showBackButton: true,
      ),
      body: Column(
        children: [
          // Date Selector
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Tanggal Keberangkatan',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => _selectDate(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          DateFormat(
                            'EEEE, d MMMM yyyy',
                            'id_ID',
                          ).format(_selectedDate),
                          style: const TextStyle(fontSize: 16),
                        ),
                        const Icon(Icons.calendar_today),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Schedules List
          Expanded(
            child:
                scheduleProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : schedules == null || schedules.isEmpty
                    ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.timer_off,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Tidak ada jadwal tersedia untuk tanggal ini',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              ElevatedButton(
                                onPressed: () => _selectDate(context),
                                child: const Text('Pilih Tanggal Lain'),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton(
                                onPressed: () => _findNextAvailableDate(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                ),
                                child: const Text('Cari Jadwal Terdekat'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    )
                    : ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: schedules.length,
                      itemBuilder: (context, index) {
                        final schedule = schedules[index];
                        return ScheduleCard(
                          schedule: schedule,
                          date: _selectedDate,
                          onTap: () {
                            // Store selected schedule and date in booking provider
                            bookingProvider.setSelectedSchedule(schedule);
                            bookingProvider.setSelectedDate(_selectedDate);

                            // Navigate to passenger details screen
                            Navigator.pushNamed(context, '/booking/passengers');
                          },
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }
}
