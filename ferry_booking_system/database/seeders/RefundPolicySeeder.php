<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RefundPolicy;

class RefundPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $policies = [
            [
                'days_before_departure' => 14,
                'refund_percentage' => 100,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 100% untuk pembatalan 14 hari atau lebih sebelum keberangkatan',
                'is_active' => true
            ],
            [
                'days_before_departure' => 7,
                'refund_percentage' => 90,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 90% untuk pembatalan 7-13 hari sebelum keberangkatan',
                'is_active' => true
            ],
            [
                'days_before_departure' => 3,
                'refund_percentage' => 70,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 70% untuk pembatalan 3-6 hari sebelum keberangkatan',
                'is_active' => true
            ],
            [
                'days_before_departure' => 1,
                'refund_percentage' => 50,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Refund 50% untuk pembatalan 1-2 hari sebelum keberangkatan',
                'is_active' => true
            ],
            [
                'days_before_departure' => 0,
                'refund_percentage' => 0,
                'min_fee' => null,
                'max_fee' => null,
                'description' => 'Tidak ada refund untuk pembatalan di hari keberangkatan',
                'is_active' => true
            ]
        ];

        foreach ($policies as $policy) {
            RefundPolicy::create($policy);
        }
    }
}
