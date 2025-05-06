<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 191);
            $table->text('message');
            $table->enum('type', ['BOOKING', 'PAYMENT', 'SCHEDULE_CHANGE', 'BOARDING', 'SYSTEM', 'PROMO']);
            $table->boolean('is_read')->default(false);
            $table->enum('priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])->default('LOW');
            $table->text('data')->nullable()->comment('Data tambahan dalam format JSON');
            $table->enum('sent_via', ['APP_NOTIFICATION'])->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};
