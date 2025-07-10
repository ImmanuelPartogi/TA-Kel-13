<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->nullable()->comment('ID pengguna yang memiliki kendaraan, NULL jika pembelian di loket');
            $table->enum('type', ['MOTORCYCLE', 'CAR', 'BUS', 'TRUCK', 'PICKUP', 'TRONTON']);
            $table->foreignId('vehicle_category_id')->constrained('vehicle_categories');
            $table->string('license_plate', 20);
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->decimal('weight', 10, 2)->nullable()->comment('Berat dalam kg');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('vehicles');
    }
};
