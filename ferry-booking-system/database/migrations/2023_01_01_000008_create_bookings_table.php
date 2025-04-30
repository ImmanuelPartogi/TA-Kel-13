<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 20);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->date('departure_date');
            $table->unsignedInteger('passenger_count')->default(1);
            $table->unsignedInteger('vehicle_count')->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED', 'EXPIRED', 'REFUND_PENDING', 'RESCHEDULED'])->default('PENDING');
            $table->text('cancellation_reason')->nullable();
            $table->enum('booked_by', ['WEB', 'MOBILE_APP', 'COUNTER'])->default('MOBILE_APP');
            $table->string('booking_channel', 50)->nullable()->comment('Spesifik kanal booking');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bookings');
    }
};
