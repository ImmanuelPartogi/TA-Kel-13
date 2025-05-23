<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'CASH']);
            $table->string('payment_channel', 50)->comment('BCA, MANDIRI, BNI, GOPAY, SHOPEEPAY, dll');
            $table->string('transaction_id', 100)->nullable()->comment('ID Transaksi dari Payment Gateway');
            $table->string('external_reference', 100)->nullable()->comment('Referensi eksternal dari payment gateway');
            $table->string('virtual_account_number', 100)->nullable()->comment('Nomor Virtual Account');
            $table->text('qr_code_url')->nullable()->comment('URL QR Code untuk e-wallet');
            $table->text('deep_link_url')->nullable()->comment('URL Deep Link untuk e-wallet');
            $table->text('status_url')->nullable()->comment('URL untuk cek status transaksi');
            $table->text('cancel_url')->nullable()->comment('URL untuk membatalkan transaksi');
            $table->string('payment_option_type', 50)->nullable()->comment('Tipe opsi pembayaran untuk e-wallet');
            $table->string('channel_response_code', 50)->nullable()->comment('Kode respons dari payment channel');
            $table->string('channel_response_message', 255)->nullable()->comment('Pesan respons dari payment channel');
            $table->enum('status', ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED', 'PARTIAL_REFUND'])->default('PENDING');
            $table->timestamp('payment_date')->nullable();
            $table->timestamp('expiry_date')->nullable();
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->timestamp('refund_date')->nullable();
            $table->text('payload')->nullable()->comment('Respon mentah dari payment gateway');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
