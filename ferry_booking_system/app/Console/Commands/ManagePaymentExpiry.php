<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ManagePaymentExpiry extends Command
{
    protected $signature = 'payments:check-expiry';
    protected $description = 'Memeriksa payment yang sudah expired dan mengupdate status booking serta tiket';

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Memulai pengecekan payment expired: ' . now()->format('Y-m-d H:i:s'));

        try {
            // Cari payment dengan status PENDING yang sudah melewati expiry_date
            $expiredPayments = Payment::where('status', 'PENDING')
                ->where('expiry_date', '<', Carbon::now())
                ->get();

            $count = 0;

            // Gunakan transaksi database untuk konsistensi data
            foreach ($expiredPayments as $payment) {
                DB::beginTransaction();
                try {
                    // Update status payment menjadi EXPIRED
                    $payment->status = 'EXPIRED';
                    $payment->save();

                    // Update status booking menjadi EXPIRED jika masih PENDING
                    $booking = $payment->booking;
                    if ($booking && $booking->status === 'PENDING') {
                        $booking->status = 'EXPIRED';
                        $booking->cancellation_reason = 'Pembayaran kedaluwarsa';
                        $booking->save();

                        // Update semua tiket terkait menjadi EXPIRED
                        Ticket::where('booking_id', $booking->id)
                            ->update([
                                'status' => 'EXPIRED',
                                'boarding_status' => 'MISSED'
                            ]);
                    }

                    $count++;
                    DB::commit();

                    Log::info('Payment expired berhasil diupdate', [
                        'payment_id' => $payment->id,
                        'booking_id' => $booking->id ?? null,
                        'booking_code' => $booking->booking_code ?? null
                    ]);
                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->error("   Error update payment expired ID {$payment->id}: " . $e->getMessage());
                    Log::error("Error update payment expired", [
                        'payment_id' => $payment->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            $executionTime = round(microtime(true) - $startTime, 2);
            $this->info("Total {$count} payment expired diupdate dalam {$executionTime} detik");

            return 0;
        } catch (\Exception $e) {
            $this->error('Pengecekan payment expired gagal: ' . $e->getMessage());
            Log::error('Error dalam pengecekan payment expired', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }
}
