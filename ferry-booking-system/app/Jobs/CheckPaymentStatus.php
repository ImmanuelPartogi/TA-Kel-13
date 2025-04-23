<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckPaymentStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $paymentId;

    public function __construct($paymentId)
    {
        $this->paymentId = $paymentId;
    }

    public function handle(MidtransService $midtransService)
    {
        $payment = Payment::find($this->paymentId);
        if (!$payment || $payment->status !== 'PENDING' || !$payment->booking) {
            return;
        }

        $midtransService->checkAndUpdateTransaction($payment->booking->booking_code);
    }
}
