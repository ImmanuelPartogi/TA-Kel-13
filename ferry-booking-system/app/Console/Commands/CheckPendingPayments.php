<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;

class CheckPendingPayments extends Command implements ShouldQueue
{
    protected $signature = 'payments:check-pending';
    protected $description = 'Check status of pending payments from Midtrans';

    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        parent::__construct();
        $this->midtransService = $midtransService;
    }

    public function handle()
    {
        $this->info('Starting to check pending payments...');

        // Ambil pembayaran dengan status PENDING yang belum kedaluwarsa
        $pendingPayments = Payment::where('status', Payment::STATUS_PENDING)
            ->where('expiry_date', '>', now())
            ->with('booking')
            ->get();

        $this->info("Found {$pendingPayments->count()} pending payments to check");

        foreach ($pendingPayments as $payment) {
            $booking = $payment->booking;

            if (!$booking) {
                $this->warn("Payment #{$payment->id} has no associated booking, skipping");
                continue;
            }

            $this->info("Checking payment for booking code: {$booking->booking_code}");

            try {
                // Gunakan fungsi checkAndUpdateTransaction yang sudah ada
                $result = $this->midtransService->checkAndUpdateTransaction($booking->booking_code);

                if ($result) {
                    $this->info("Updated payment #{$payment->id} status to: {$result['payment_status']}");
                    $this->info("Updated booking #{$booking->id} status to: {$result['booking_status']}");

                    // Log informasi polling untuk monitoring
                    Log::channel('daily')->info('Payment status updated via polling', [
                        'payment_id' => $payment->id,
                        'booking_code' => $booking->booking_code,
                        'new_status' => $result['payment_status'],
                        'transaction_status' => $result['transaction_status']
                    ]);
                } else {
                    $this->error("Failed to check/update payment for booking code: {$booking->booking_code}");
                }
            } catch (\Exception $e) {
                $this->error("Error processing payment #{$payment->id}: {$e->getMessage()}");
                Log::error("Error in CheckPendingPayments command", [
                    'payment_id' => $payment->id,
                    'booking_code' => $booking->booking_code,
                    'error' => $e->getMessage()
                ]);
            }

            // Berikan jeda singkat untuk menghindari rate limiting dari Midtrans
            sleep(1);
        }

        $this->info('Finished checking pending payments');
        return 0;
    }
}
