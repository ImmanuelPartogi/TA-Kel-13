<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample users
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '081234567890',
            'password' => Hash::make('password'),
            'address' => 'Jl. Merdeka No. 123, Jakarta',
            'id_number' => '1234567890123456',
            'id_type' => 'KTP',
            'date_of_birthday' => '1990-01-01',
            'gender' => 'MALE',
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone' => '089876543210',
            'password' => Hash::make('password'),
            'address' => 'Jl. Sudirman No. 456, Jakarta',
            'id_number' => '6543210987654321',
            'id_type' => 'KTP',
            'date_of_birthday' => '1992-05-15',
            'gender' => 'FEMALE',
        ]);

        User::create([
            'name' => 'Ahmad Rasyid',
            'email' => 'ahmad@example.com',
            'phone' => '087812345678',
            'password' => Hash::make('password'),
            'address' => 'Jl. Pahlawan No. 789, Surabaya',
            'id_number' => '9876543210123456',
            'id_type' => 'KTP',
            'date_of_birthday' => '1988-12-10',
            'gender' => 'MALE',
        ]);

        User::create([
            'name' => 'Siti Rahayu',
            'email' => 'siti@example.com',
            'phone' => '085678901234',
            'password' => Hash::make('password'),
            'address' => 'Jl. Gatot Subroto No. 101, Bandung',
            'id_number' => '5432109876543210',
            'id_type' => 'KTP',
            'date_of_birthday' => '1995-08-20',
            'gender' => 'FEMALE',
        ]);
    }
}
