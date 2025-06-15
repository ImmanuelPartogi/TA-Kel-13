<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('refund_policies', function (Blueprint $table) {
            $table->id();
            $table->integer('days_before_departure'); // Hari sebelum keberangkatan
            $table->decimal('refund_percentage', 5, 2); // Persentase refund (0-100)
            $table->decimal('min_fee', 12, 2)->nullable(); // Minimal biaya
            $table->decimal('max_fee', 12, 2)->nullable(); // Maksimal biaya
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('days_before_departure');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('refund_policies');
    }
};
