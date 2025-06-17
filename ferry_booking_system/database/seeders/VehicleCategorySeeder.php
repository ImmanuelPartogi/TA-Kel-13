<?php

namespace Database\Seeders;

use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;

class VehicleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'code' => 'Gol I',
                'name' => 'Golongan I',
                'description' => 'Sepeda',
                'vehicle_type' => 'MOTORCYCLE',
                'base_price' => 14000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol II',
                'name' => 'Golongan II',
                'description' => 'Sepeda Motor',
                'vehicle_type' => 'MOTORCYCLE',
                'base_price' => 25000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol III',
                'name' => 'Golongan III',
                'description' => 'Sepeda Motor diatas 500 CC / Roda 3',
                'vehicle_type' => 'MOTORCYCLE',
                'base_price' => 54000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol IV-P',
                'name' => 'Golongan IV Penumpang',
                'description' => 'Mobil Penumpang',
                'vehicle_type' => 'CAR',
                'base_price' => 201000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol IV-B',
                'name' => 'Golongan IV Barang',
                'description' => 'Mobil Barang',
                'vehicle_type' => 'PICKUP',
                'base_price' => 197000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol V-A',
                'name' => 'Golongan V A Penumpang',
                'description' => 'Bus Kecil',
                'vehicle_type' => 'BUS',
                'base_price' => 377000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol V-B',
                'name' => 'Golongan V B Barang',
                'description' => 'Truk Kecil',
                'vehicle_type' => 'TRUCK',
                'base_price' => 371000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VI-A',
                'name' => 'Golongan VI A Penumpang',
                'description' => 'Bus Besar',
                'vehicle_type' => 'BUS',
                'base_price' => 632000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VI-B',
                'name' => 'Golongan VI B Barang',
                'description' => 'Truk Besar',
                'vehicle_type' => 'TRUCK',
                'base_price' => 615000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VII',
                'name' => 'Golongan VII',
                'description' => 'Truk Tronton',
                'vehicle_type' => 'TRONTON',
                'base_price' => 828000.00,
                'is_active' => true,
            ],
            [
                'code' => 'Gol VIII',
                'name' => 'Golongan VIII',
                'description' => 'Truk Trailer',
                'vehicle_type' => 'TRONTON',
                'base_price' => 1155000.00,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            VehicleCategory::create($category);
        }
    }
}
