<?php

// database/seeders/AdminSeeder.php
namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        Admin::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@ferrybooking.com',
            'password' => Hash::make('password'),
            'role' => 'SUPER_ADMIN',
            'permissions' => json_encode([
                'manage_admins',
                'manage_operators',
                'manage_users',
                'manage_routes',
                'manage_ferries',
                'manage_schedules',
                'manage_bookings',
                'view_reports',
            ]),
        ]);

        // Create regular Admin
        Admin::create([
            'name' => 'Admin',
            'email' => 'admin@ferrybooking.com',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
            'permissions' => json_encode([
                'manage_routes',
                'manage_ferries',
                'manage_schedules',
                'manage_bookings',
                'view_reports',
            ]),
        ]);
    }
}
