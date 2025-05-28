<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('origin', 191)->comment('Pelabuhan Asal');
            $table->string('destination', 191)->comment('Pelabuhan Tujuan');
            $table->string('route_code', 20)->unique();
            $table->decimal('distance', 10, 2)->nullable()->comment('Jarak dalam KM');
            $table->unsignedInteger('duration')->comment('Durasi dalam menit');
            $table->decimal('base_price', 12, 2)->comment('Harga dasar untuk penumpang');
            // Kolom harga kendaraan dihapus karena sudah ada di vehicle_categories
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'WEATHER_ISSUE'])->default('ACTIVE');
            $table->string('status_reason', 191)->nullable()->comment('Alasan perubahan status');
            $table->timestamp('status_updated_at')->nullable()->comment('Waktu terakhir status diperbarui');
            $table->timestamp('status_expiry_date')->nullable()->comment('Tanggal saat status cuaca akan otomatis berubah');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('routes');
    }
};
