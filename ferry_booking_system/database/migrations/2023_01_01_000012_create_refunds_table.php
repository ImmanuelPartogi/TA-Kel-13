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
            $table->decimal('original_amount', 12, 2); // Jumlah pembayaran asli
            $table->decimal('refund_fee', 12, 2)->default(0); // Biaya potongan refund
            $table->decimal('refund_percentage', 5, 2)->default(100); // Persentase refund (0-100)
            $table->decimal('amount', 12, 2); // Jumlah refund setelah potongan
            $table->text('reason');
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'PROCESSING'])->default('PENDING');
            $table->foreignId('refunded_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->enum('refund_method', ['ORIGINAL_PAYMENT_METHOD', 'BANK_TRANSFER', 'CASH'])->default('BANK_TRANSFER');
            $table->string('transaction_id', 100)->nullable();
            $table->string('bank_account_number', 50)->nullable();
            $table->string('bank_account_name', 191)->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->text('notes')->nullable(); // Catatan admin
            $table->text('rejection_reason')->nullable(); // Alasan penolakan
            $table->timestamps();

            // Indexes
            $table->index('booking_id');
            $table->index('payment_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('refunds');
    }
};
