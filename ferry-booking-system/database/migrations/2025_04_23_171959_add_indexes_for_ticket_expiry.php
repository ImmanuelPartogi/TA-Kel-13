<?php
// Buat migration baru: php artisan make:migration add_indexes_for_ticket_expiry

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->index(['status', 'checked_in'], 'idx_ticket_status_checkin');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index('booking_date', 'idx_booking_date');
        });
    }

    public function down()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('idx_ticket_status_checkin');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_booking_date');
        });
    }
};
