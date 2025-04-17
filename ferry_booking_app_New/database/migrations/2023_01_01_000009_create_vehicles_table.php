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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['MOTORCYCLE', 'CAR', 'BUS', 'TRUCK']);
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
