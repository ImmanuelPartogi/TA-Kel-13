<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('booking_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->string('previous_status', 50);
            $table->string('new_status', 50);
            $table->enum('changed_by_type', ['USER', 'ADMIN', 'SYSTEM', 'OPERATOR']);
            $table->unsignedBigInteger('changed_by_id')->nullable();
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('device_info')->nullable()->comment('Informasi perangkat yang melakukan perubahan');
            $table->string('location', 191)->nullable()->comment('Lokasi geografis perubahan');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('booking_logs');
    }
};
