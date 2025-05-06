<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SyncBookingStatus extends Command
{
    protected $signature = 'bookings:sync-status';
    protected $description = 'Sinkronisasi status booking berdasarkan status tiket dan tanggal keberangkatan';

    public function handle()
    {
        $this->info('Mulai sinkronisasi status booking...');

        try {
            // Ambil booking dengan status CONFIRMED
            $bookings = Booking::where('status', 'CONFIRMED')
                              ->with('tickets')
                              ->get();

            $count = 0;
            foreach ($bookings as $booking) {
                $allTicketsExpired = $booking->tickets->isNotEmpty() &&
                                     $booking->tickets->every(function ($ticket) {
                                         return $ticket->status === 'EXPIRED';
                                     });

                $departureDate = Carbon::parse($booking->departure_date);
                $isDatePassed = $departureDate->endOfDay()->isPast();

                if ($allTicketsExpired || $isDatePassed) {
                    $booking->status = 'EXPIRED';
                    $booking->save();
                    $count++;

                    Log::info('Booking status updated to EXPIRED by command', [
                        'booking_id' => $booking->id,
                        'booking_code' => $booking->booking_code,
                    ]);
                }
            }

            $this->info("Selesai! $count booking diperbarui ke status EXPIRED.");
            return 0;
        } catch (\Exception $e) {
            Log::error('Error in SyncBookingStatus command', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->error('Terjadi kesalahan: ' . $e->getMessage());
            return 1;
        }
    }
}
