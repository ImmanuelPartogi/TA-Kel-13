import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/widgets/route_card.dart';
import 'package:ferry_booking_app/models/route.dart';  // Import dari route.dart
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class RouteListScreen extends StatefulWidget {
  const RouteListScreen({Key? key}) : super(key: key);

  @override
  _RouteListScreenState createState() => _RouteListScreenState();
}

class _RouteListScreenState extends State<RouteListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();
  String _searchQuery = '';
  bool _isInitialized = false;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this); // Two tabs: Active and Inactive
    
    // Gunakan addPostFrameCallback untuk memastikan build selesai sebelum memanggil provider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadRoutes();
    });
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }
  
  Future<void> _loadRoutes() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(context, listen: false);
    try {
      await scheduleProvider.getRoutes();
      // Set flag untuk menunjukkan bahwa data sudah di-load
      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }
    } catch (e) {
      print('Error loading routes: $e');
    }
  }
  
  Future<void> _refreshRoutes() async {
    await _loadRoutes();
  }

  @override
  Widget build(BuildContext context) {
    final scheduleProvider = Provider.of<ScheduleProvider>(context);
    final routes = scheduleProvider.routes;
    
    // Filter routes by status
    final activeRoutes = routes?.where(
      (route) => route.status == 'ACTIVE'
    ).toList() ?? [];
    
    final inactiveRoutes = routes?.where(
      (route) => route.status != 'ACTIVE'
    ).toList() ?? [];
    
    // Filter routes based on search query
    final filteredActiveRoutes = activeRoutes.where((route) {
      final originMatch = route.origin.toLowerCase().contains(_searchQuery.toLowerCase());
      final destinationMatch = route.destination.toLowerCase().contains(_searchQuery.toLowerCase());
      final routeCodeMatch = route.routeCode.toLowerCase().contains(_searchQuery.toLowerCase());
      return originMatch || destinationMatch || routeCodeMatch;
    }).toList();
    
    final filteredInactiveRoutes = inactiveRoutes.where((route) {
      final originMatch = route.origin.toLowerCase().contains(_searchQuery.toLowerCase());
      final destinationMatch = route.destination.toLowerCase().contains(_searchQuery.toLowerCase());
      final routeCodeMatch = route.routeCode.toLowerCase().contains(_searchQuery.toLowerCase());
      return originMatch || destinationMatch || routeCodeMatch;
    }).toList();

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Daftar Rute',
        showBackButton: true,
      ),
      body: !_isInitialized
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Search Box
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Cari rute perjalanan',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                setState(() {
                                  _searchController.clear();
                                  _searchQuery = '';
                                });
                              },
                            )
                          : null,
                    ),
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value;
                      });
                    },
                  ),
                ),
                
                // Tab Bar
                TabBar(
                  controller: _tabController,
                  tabs: const [
                    Tab(text: 'Rute Aktif'),
                    Tab(text: 'Rute Nonaktif'),
                  ],
                  labelColor: Theme.of(context).primaryColor,
                  indicatorColor: Theme.of(context).primaryColor,
                ),
                
                // Routes List
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      // Active routes
                      RefreshIndicator(
                        onRefresh: _refreshRoutes,
                        child: scheduleProvider.isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : filteredActiveRoutes.isEmpty
                                ? _buildEmptyRoutes('Tidak ada rute aktif yang tersedia')
                                : ListView.builder(
                                    padding: const EdgeInsets.all(16.0),
                                    itemCount: filteredActiveRoutes.length,
                                    itemBuilder: (context, index) {
                                      return RouteCard(
                                        route: filteredActiveRoutes[index],
                                        onTap: () {
                                          Navigator.pushNamed(
                                            context, 
                                            '/booking/schedules',
                                            arguments: filteredActiveRoutes[index],
                                          );
                                        },
                                      );
                                    },
                                  ),
                      ),
                      
                      // Inactive routes
                      RefreshIndicator(
                        onRefresh: _refreshRoutes,
                        child: scheduleProvider.isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : filteredInactiveRoutes.isEmpty
                                ? _buildEmptyRoutes('Tidak ada rute nonaktif yang tersedia')
                                : ListView.builder(
                                    padding: const EdgeInsets.all(16.0),
                                    itemCount: filteredInactiveRoutes.length,
                                    itemBuilder: (context, index) {
                                      return RouteCard(
                                        route: filteredInactiveRoutes[index],
                                        onTap: () {
                                          // Show details or reason for deactivation
                                          _showRouteDetailsDialog(filteredInactiveRoutes[index]);
                                        },
                                      );
                                    },
                                  ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
      floatingActionButton: _isInitialized ? FloatingActionButton(
        onPressed: () {
          // Navigate to add new route screen
          Navigator.pushNamed(context, '/routes/add');
        },
        child: const Icon(Icons.add),
        tooltip: 'Tambah Rute Baru',
      ) : null,
    );
  }
  
  Widget _buildEmptyRoutes(String message) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.directions_boat_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                _refreshRoutes(); // Refresh data
              },
              child: const Text('Muat Ulang Data'),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/routes/add');
              },
              child: const Text('Tambah Rute Baru'),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showRouteDetailsDialog(FerryRoute route) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${route.origin} - ${route.destination}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Status: ${_getStatusText(route.status)}'),
              if (route.statusReason != null && route.statusReason!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text('Alasan: ${route.statusReason}'),
                ),
              const SizedBox(height: 16),
              Text('Kode Rute: ${route.routeCode}'),
              Text('Jarak: ${route.distance != null ? '${route.distance} km' : 'N/A'}'),
              Text('Durasi: ${route.duration} menit'),
              const SizedBox(height: 8),
              Text('Harga Dasar: Rp ${route.basePrice.toStringAsFixed(0)}'),
              Text('Harga Motor: Rp ${route.motorcyclePrice.toStringAsFixed(0)}'),
              Text('Harga Mobil: Rp ${route.carPrice.toStringAsFixed(0)}'),
              Text('Harga Bus: Rp ${route.busPrice.toStringAsFixed(0)}'),
              Text('Harga Truk: Rp ${route.truckPrice.toStringAsFixed(0)}'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup'),
          ),
          if (route.status != 'PERMANENT_INACTIVE')
            TextButton(
              onPressed: () {
                // Handle reactivation of route
                Navigator.pop(context);
                _showReactivateConfirmation(route);
              },
              child: const Text('Aktifkan Kembali'),
              style: TextButton.styleFrom(
                foregroundColor: Colors.green,
              ),
            ),
        ],
      ),
    );
  }
  
  void _showReactivateConfirmation(FerryRoute route) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aktifkan Kembali Rute'),
        content: Text('Apakah Anda yakin ingin mengaktifkan kembali rute ${route.origin} - ${route.destination}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () {
              // Here you would call your provider to update the route status
              // scheduleProvider.activateRoute(route.id);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Rute ${route.origin} - ${route.destination} telah diaktifkan kembali'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: const Text('Aktifkan'),
            style: TextButton.styleFrom(
              foregroundColor: Colors.green,
            ),
          ),
        ],
      ),
    );
  }
  
  String _getStatusText(String status) {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'INACTIVE':
        return 'Nonaktif';
      case 'SUSPENDED':
        return 'Ditangguhkan';
      case 'MAINTENANCE':
        return 'Pemeliharaan';
      case 'PERMANENT_INACTIVE':
        return 'Nonaktif Permanen';
      default:
        return status;
    }
  }
}