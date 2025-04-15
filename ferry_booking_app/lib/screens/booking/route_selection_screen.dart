import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:ferry_booking_app/widgets/route_card.dart';

class RouteSelectionScreen extends StatefulWidget {
  const RouteSelectionScreen({Key? key}) : super(key: key);

  @override
  _RouteSelectionScreenState createState() => _RouteSelectionScreenState();
}

class _RouteSelectionScreenState extends State<RouteSelectionScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadRoutes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadRoutes() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(context, listen: false);
    await scheduleProvider.getRoutes();
  }

  @override
  Widget build(BuildContext context) {
    final scheduleProvider = Provider.of<ScheduleProvider>(context);
    final routes = scheduleProvider.routes;
    
    // Filter routes based on search query
    final filteredRoutes = routes?.where((route) {
      final originMatch = route.origin.toLowerCase().contains(_searchQuery.toLowerCase());
      final destinationMatch = route.destination.toLowerCase().contains(_searchQuery.toLowerCase());
      return originMatch || destinationMatch;
    }).toList();

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Pilih Rute',
        showBackButton: true,
      ),
      body: Column(
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
          
          // Routes List
          Expanded(
            child: scheduleProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : routes == null || routes.isEmpty
                    ? Center(
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
                              'Tidak ada rute tersedia',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : filteredRoutes!.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Rute tidak ditemukan',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0),
                            itemCount: filteredRoutes.length,
                            itemBuilder: (context, index) {
                              final route = filteredRoutes[index];
                              return RouteCard(
                                route: route,
                                onTap: () {
                                  Navigator.pushNamed(
                                    context, 
                                    '/booking/schedules',
                                    arguments: route,
                                  );
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