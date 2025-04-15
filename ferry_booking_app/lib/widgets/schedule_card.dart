import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/schedule.dart';

class ScheduleCard extends StatelessWidget {
  final Schedule schedule;
  final DateTime date;
  final VoidCallback onTap;
  
  const ScheduleCard({
    Key? key,
    required this.schedule,
    required this.date,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    
    // Check availability
    final isPassengerAvailable = (schedule.availablePassenger ?? 0) > 0;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Time and Ferry Info
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Text(
                          schedule.departureTime.substring(0, 5),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                        Container(
                          width: 20,
                          height: 1,
                          color: Colors.grey[400],
                          margin: const EdgeInsets.symmetric(vertical: 4),
                        ),
                        Text(
                          schedule.arrivalTime.substring(0, 5),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          schedule.ferry?.name ?? '-',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.people,
                              size: 16,
                              color: Colors.grey[600],
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Tersedia: ${schedule.availablePassenger ?? 0} kursi',
                              style: TextStyle(
                                color: isPassengerAvailable ? Colors.grey[600] : Colors.red,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        currencyFormat.format(schedule.route?.basePrice ?? 0),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'per penumpang',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 12),
              
              // Vehicle Availability
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildVehicleItem(
                    'Motor',
                    schedule.availableMotorcycle ?? 0,
                    Icons.motorcycle,
                  ),
                  _buildVehicleItem(
                    'Mobil',
                    schedule.availableCar ?? 0,
                    Icons.directions_car,
                  ),
                  _buildVehicleItem(
                    'Bus',
                    schedule.availableBus ?? 0,
                    Icons.directions_bus,
                  ),
                  _buildVehicleItem(
                    'Truk',
                    schedule.availableTruck ?? 0,
                    Icons.local_shipping,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildVehicleItem(String label, int count, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          size: 20,
          color: count > 0 ? Colors.grey[600] : Colors.red,
        ),
        const SizedBox(height: 4),
        Text(
          count.toString(),
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: count > 0 ? Colors.black : Colors.red,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}