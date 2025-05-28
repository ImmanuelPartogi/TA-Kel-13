<?php

// database/migrations/2023_01_01_000002_create_operators_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('operators', function (Blueprint $table) {
            $table->id();
            $table->string('email', 191)->unique();
            $table->string('company_name', 191);
            $table->string('phone_number', 20);
            $table->string('license_number', 100);
            $table->integer('fleet_size')->default(0);
            $table->text('company_address');
            $table->string('password', 191);
            $table->enum('role', ['OPERATOR'])->default('OPERATOR');
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED'])->default('ACTIVE');
            $table->json('assigned_routes')->nullable()->comment('Rute yang dapat dikelola');
            $table->timestamp('last_login')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('operators');
    }
};
