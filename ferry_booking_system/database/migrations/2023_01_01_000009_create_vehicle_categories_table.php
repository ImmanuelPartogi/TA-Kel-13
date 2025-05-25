<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vehicle_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique()->comment('Kode golongan (Gol I, Gol II, dll)');
            $table->string('name', 100)->comment('Nama lengkap golongan');
            $table->text('description')->nullable()->comment('Deskripsi detail golongan');
            $table->enum('vehicle_type', ['MOTORCYCLE', 'CAR', 'BUS', 'TRUCK', 'PICKUP', 'TRONTON'])->comment('Tipe kendaraan');
            $table->decimal('base_price', 12, 2)->comment('Harga dasar golongan');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('vehicle_categories');
    }
};
