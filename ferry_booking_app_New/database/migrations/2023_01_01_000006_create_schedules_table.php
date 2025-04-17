<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->onDelete('cascade');
            $table->foreignId('ferry_id')->constrained()->onDelete('cascade');
            $table->time('departure_time');
            $table->time('arrival_time');
            $table->string('days', 20)->comment('Format: 1,2,3,4,5,6,7 (Senin-Minggu)');
            $table->enum('status', ['ACTIVE', 'CANCELLED', 'DELAYED', 'FULL', 'DEPARTED'])->default('ACTIVE');
            $table->string('status_reason', 191)->nullable()->comment('Alasan perubahan status');
            $table->timestamp('status_updated_at')->nullable()->comment('Waktu terakhir status diperbarui');
            $table->timestamp('status_expiry_date')->nullable()->comment('Tanggal saat status cuaca akan otomatis berubah');
            $table->foreignId('created_by')->nullable()->constrained('admins')->onDelete('set null')->comment('Admin atau Operator yang membuat jadwal');
            $table->unsignedBigInteger('last_adjustment_id')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedules');
    }
};
