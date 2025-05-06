<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddExpiredStatusToBookingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Jika perlu tambahkan enum value 'EXPIRED' ke kolom status
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED', 'EXPIRED', 'REFUND_PENDING', 'RESCHEDULED') NOT NULL DEFAULT 'PENDING'");

        // Jika perlu tambahkan enum value 'MISSED' ke kolom boarding_status di tabel tickets
        DB::statement("ALTER TABLE tickets MODIFY COLUMN boarding_status ENUM('NOT_BOARDED', 'BOARDED', 'MISSED') NOT NULL DEFAULT 'NOT_BOARDED'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Kembalikan ke status enum original
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'PENDING'");

        // Kembalikan boarding_status enum original
        DB::statement("ALTER TABLE tickets MODIFY COLUMN boarding_status ENUM('NOT_BOARDED', 'BOARDED') NOT NULL DEFAULT 'NOT_BOARDED'");
    }
}
