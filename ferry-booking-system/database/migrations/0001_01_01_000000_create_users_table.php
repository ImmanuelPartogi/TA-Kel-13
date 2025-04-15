<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('email', 191)->unique();
            $table->string('phone', 20);
            $table->string('password', 191);
            $table->text('address')->nullable();
            $table->string('id_number', 30)->nullable()->comment('Nomor KTP/SIM/Paspor');
            $table->enum('id_type', ['KTP', 'SIM', 'PASPOR'])->nullable();
            $table->date('date_of_birthday')->nullable()->comment('Tanggal Lahir');
            $table->enum('gender', ['MALE', 'FEMALE'])->nullable();
            $table->string('profile_picture', 191)->nullable();
            $table->integer('total_bookings')->default(0);
            $table->integer('loyalty_points')->default(0);
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_booking_date')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
