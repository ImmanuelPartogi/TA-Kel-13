<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RefundPolicy;

class RefundPolicySeeder extends Seeder
{
    public function run(): void
    {
        $policies = [
            // Kebijakan untuk 14+ hari sebelum keberangkatan
            [
                'days_before_departure' => 14,
                'refund_percentage' => 95,
                'min_fee' => 5000,
                'max_fee' => 50000,
                'description' => 'Refund 95% untuk pembatalan 14 hari atau lebih sebelum keberangkatan',
                'is_active' => true
            ],

            // Kebijakan untuk 7-13 hari sebelum keberangkatan
            [
                'days_before_departure' => 7,
                'refund_percentage' => 85,
                'min_fee' => 10000,
                'max_fee' => 100000,
                'description' => 'Refund 85% untuk pembatalan 7-13 hari sebelum keberangkatan',
                'is_active' => true
            ],

            // Kebijakan untuk 5-6 hari sebelum keberangkatan
            [
                'days_before_departure' => 5,
                'refund_percentage' => 75,
                'min_fee' => 15000,
                'max_fee' => 150000,
                'description' => 'Refund 75% untuk pembatalan 5-6 hari sebelum keberangkatan',
                'is_active' => true
            ],

            // Kebijakan untuk 3-4 hari sebelum keberangkatan
            [
                'days_before_departure' => 3,
                'refund_percentage' => 65,
                'min_fee' => 20000,
                'max_fee' => 200000,
                'description' => 'Refund 65% untuk pembatalan 3-4 hari sebelum keberangkatan',
                'is_active' => true
            ],

            // Kebijakan untuk 2 hari sebelum keberangkatan (titik kritis)
            [
                'days_before_departure' => 2,
                'refund_percentage' => 50,
                'min_fee' => 25000,
                'max_fee' => 250000,
                'description' => 'Refund 50% untuk pembatalan 2 hari sebelum keberangkatan',
                'is_active' => true
            ],

            // Kebijakan untuk 1 hari sebelum keberangkatan
            [
                'days_before_departure' => 1,
                'refund_percentage' => 30,
                'min_fee' => 30000,
                'max_fee' => 300000,
                'description' => 'Refund 30% untuk pembatalan 1 hari sebelum keberangkatan',
                'is_active' => true
            ],

            // Kebijakan untuk hari keberangkatan
            [
                'days_before_departure' => 0,
                'refund_percentage' => 0,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Tidak ada refund untuk pembatalan pada hari keberangkatan',
                'is_active' => true
            ],
        ];

        foreach ($policies as $policy) {
            RefundPolicy::create($policy);
        }
    }
}
