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

        // Insert default policies
        DB::table('refund_policies')->insert([
            [
                'days_before_departure' => 7,
                'refund_percentage' => 90,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 90% untuk pembatalan 7 hari atau lebih sebelum keberangkatan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'days_before_departure' => 3,
                'refund_percentage' => 70,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 70% untuk pembatalan 3-6 hari sebelum keberangkatan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'days_before_departure' => 1,
                'refund_percentage' => 50,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 50% untuk pembatalan 1-2 hari sebelum keberangkatan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'days_before_departure' => 0,
                'refund_percentage' => 0,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Tidak ada refund untuk pembatalan di hari keberangkatan',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('refund_policies');
    }
};
