<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->text('reason');
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'PROCESSING'])->default('PENDING');
            $table->foreignId('refunded_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->enum('refund_method', ['ORIGINAL_PAYMENT_METHOD', 'BANK_TRANSFER', 'CASH'])->default('ORIGINAL_PAYMENT_METHOD');
            $table->string('transaction_id', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_name', 191)->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('refunds');
    }
};
