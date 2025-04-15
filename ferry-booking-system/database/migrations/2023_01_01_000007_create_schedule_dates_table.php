<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('schedule_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->unsignedInteger('passenger_count')->default(0)->comment('Jumlah penumpang terdaftar');
            $table->unsignedInteger('motorcycle_count')->default(0);
            $table->unsignedInteger('car_count')->default(0);
            $table->unsignedInteger('bus_count')->default(0);
            $table->unsignedInteger('truck_count')->default(0);
            $table->enum('status', ['AVAILABLE', 'UNAVAILABLE', 'FULL', 'CANCELLED', 'DEPARTED', 'WEATHER_ISSUE'])->default('AVAILABLE');
            $table->string('status_reason', 191)->nullable()->comment('Alasan perubahan status');
            $table->timestamp('status_expiry_date')->nullable()->comment('Tanggal saat status cuaca akan otomatis berubah');
            $table->foreignId('created_by')->nullable()->constrained('admins')->onDelete('set null')->comment('Admin atau Operator yang membuat jadwal');
            $table->boolean('modified_by_schedule')->default(0)->comment('Diubah oleh perubahan status jadwal');
            $table->unsignedBigInteger('adjustment_id')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedule_dates');
    }
};
