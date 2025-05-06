<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ferries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('registration_number', 50)->unique();
            $table->unsignedInteger('capacity_passenger')->comment('Kapasitas Penumpang');
            $table->unsignedInteger('capacity_vehicle_motorcycle')->comment('Kapasitas Motor');
            $table->unsignedInteger('capacity_vehicle_car')->comment('Kapasitas Mobil');
            $table->unsignedInteger('capacity_vehicle_bus')->comment('Kapasitas Bus');
            $table->unsignedInteger('capacity_vehicle_truck')->comment('Kapasitas Truk');
            $table->enum('status', ['ACTIVE', 'MAINTENANCE', 'INACTIVE'])->default('ACTIVE');
            $table->text('description')->nullable();
            $table->string('image', 191)->nullable();
            $table->integer('year_built')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ferries');
    }
};
