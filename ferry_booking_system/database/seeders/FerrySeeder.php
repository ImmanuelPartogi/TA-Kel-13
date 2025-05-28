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
        ];

        foreach ($ferries as $ferry) {
            Ferry::create($ferry);
        }
    }
}
