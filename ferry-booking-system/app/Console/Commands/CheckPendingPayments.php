<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckPendingPayments extends Command
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
        Log::channel('payment')->info('Starting payment polling job');

        try {
            // Perbaikan: Gunakan string 'PENDING' untuk konsistensi dengan PaymentController
            $pendingPayments = Payment::where('status', 'PENDING')
                ->where('expiry_date', '>', now())
                ->with('booking')
                ->get();

            $count = $pendingPayments->count();
            $this->info("Found {$count} pending payments to check");
            Log::channel('payment')->info("Found {$count} pending payments to check");

            if ($count === 0) {
                return 0;
            }

            foreach ($pendingPayments as $payment) {
                $this->processPayment($payment);

                // Berikan jeda untuk menghindari rate limiting
                sleep(1);
            }

            $this->info('Finished checking pending payments');
            Log::channel('payment')->info('Finished payment polling job');

            return 0;
        } catch (\Exception $e) {
            $this->error("Critical error in payment polling: {$e->getMessage()}");
            Log::channel('payment')->error("Critical error in payment polling", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }
    }

    protected function processPayment($payment)
    {
        $booking = $payment->booking;

        if (!$booking) {
            $this->warn("Payment #{$payment->id} has no associated booking, skipping");
            Log::channel('payment')->warning("Payment has no booking", ['payment_id' => $payment->id]);
            return;
        }

        $this->info("Checking payment for booking code: {$booking->booking_code}");

        try {
            // Gunakan fungsi checkAndUpdateTransaction
            $result = $this->midtransService->checkAndUpdateTransaction($booking->booking_code);

            if ($result) {
                $this->info("Updated payment #{$payment->id} status to: {$result['payment_status']}");

                Log::channel('payment')->info('Payment status updated via polling', [
                    'payment_id' => $payment->id,
                    'booking_code' => $booking->booking_code,
                    'new_status' => $result['payment_status'],
                    'transaction_status' => $result['transaction_status']
                ]);
            } else {
                $this->error("Failed to check payment for booking code: {$booking->booking_code}");

                Log::channel('payment')->error("Failed to check payment", [
                    'payment_id' => $payment->id,
                    'booking_code' => $booking->booking_code
                ]);
            }
        } catch (\Exception $e) {
            $this->error("Error processing payment #{$payment->id}: {$e->getMessage()}");

            Log::channel('payment')->error("Error in payment check", [
                'payment_id' => $payment->id,
                'booking_code' => $booking->booking_code,
                'error' => $e->getMessage()
            ]);
        }
    }
}
