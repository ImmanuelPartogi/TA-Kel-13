<?php

// database/seeders/FerrySeeder.php
namespace Database\Seeders;

use App\Models\Ferry;
use Illuminate\Database\Seeder;

class FerrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create ferries with different capacities
        $ferries = [
            [
                'name' => 'KMP Jatra I',
                'registration_number' => 'KMP-001',
                'capacity_passenger' => 500,
                'capacity_vehicle_motorcycle' => 100,
                'capacity_vehicle_car' => 60,
                'capacity_vehicle_bus' => 10,
                'capacity_vehicle_truck' => 15,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Merak - Bakauheni',
                'year_built' => 2010,
            ],
            [
                'name' => 'KMP Jatra II',
                'registration_number' => 'KMP-002',
                'capacity_passenger' => 550,
                'capacity_vehicle_motorcycle' => 120,
                'capacity_vehicle_car' => 70,
                'capacity_vehicle_bus' => 12,
                'capacity_vehicle_truck' => 18,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Merak - Bakauheni',
                'year_built' => 2012,
            ],
            [
                'name' => 'KMP Gilimanuk Express',
                'registration_number' => 'KMP-003',
                'capacity_passenger' => 300,
                'capacity_vehicle_motorcycle' => 80,
                'capacity_vehicle_car' => 40,
                'capacity_vehicle_bus' => 8,
                'capacity_vehicle_truck' => 10,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Ketapang - Gilimanuk',
                'year_built' => 2015,
            ],
            [
                'name' => 'KMP Bali Nusantara',
                'registration_number' => 'KMP-004',
                'capacity_passenger' => 350,
                'capacity_vehicle_motorcycle' => 90,
                'capacity_vehicle_car' => 45,
                'capacity_vehicle_bus' => 9,
                'capacity_vehicle_truck' => 12,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Ketapang - Gilimanuk',
                'year_built' => 2018,
            ],
            [
                'name' => 'KMP Lombok Strait',
                'registration_number' => 'KMP-005',
                'capacity_passenger' => 400,
                'capacity_vehicle_motorcycle' => 100,
                'capacity_vehicle_car' => 50,
                'capacity_vehicle_bus' => 10,
                'capacity_vehicle_truck' => 15,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Padang Bai - Lembar',
                'year_built' => 2016,
            ],
            [
                'name' => 'KMP Nusa Dua',
                'registration_number' => 'KMP-006',
                'capacity_passenger' => 450,
                'capacity_vehicle_motorcycle' => 110,
                'capacity_vehicle_car' => 55,
                'capacity_vehicle_bus' => 11,
                'capacity_vehicle_truck' => 16,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Padang Bai - Lembar',
                'year_built' => 2019,
            ],
            [
                'name' => 'KM Jakarta Bahari',
                'registration_number' => 'KM-007',
                'capacity_passenger' => 800,
                'capacity_vehicle_motorcycle' => 150,
                'capacity_vehicle_car' => 100,
                'capacity_vehicle_bus' => 20,
                'capacity_vehicle_truck' => 25,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Tanjung Priok - Tanjung Perak',
                'year_built' => 2014,
            ],
            [
                'name' => 'KM Surabaya Express',
                'registration_number' => 'KM-008',
                'capacity_passenger' => 850,
                'capacity_vehicle_motorcycle' => 160,
                'capacity_vehicle_car' => 110,
                'capacity_vehicle_bus' => 22,
                'capacity_vehicle_truck' => 28,
                'status' => 'ACTIVE',
                'description' => 'Kapal ferry untuk rute Tanjung Priok - Tanjung Perak',
                'year_built' => 2017,
            ],
        ];

        foreach ($ferries as $ferry) {
            Ferry::create($ferry);
        }
    }
}
