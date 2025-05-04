<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ExpireTickets extends Command
{
    protected $signature = 'tickets:expire';
    protected $description = 'Mengubah status tiket menjadi EXPIRED untuk perjalanan yang sudah lewat';

    public function handle()
    {
        $this->info('Mulai mengupdate status tiket expired...');

        try {
            // Cari booking dengan tanggal keberangkatan lewat dan status CONFIRMED
            $bookings = Booking::where('status', 'CONFIRMED')
                              ->whereDate('departure_date', '<', Carbon::today())
                              ->with('tickets')
                              ->get();

            $ticketCount = 0;

            foreach ($bookings as $booking) {
                // Update semua tiket menjadi EXPIRED
                $updated = Ticket::where('booking_id', $booking->id)
                               ->where('status', '!=', 'EXPIRED')
                               ->update(['status' => 'EXPIRED']);

                $ticketCount += $updated;

                if ($updated > 0) {
                    Log::info('Tickets expired by command', [
                        'booking_id' => $booking->id,
                        'ticket_count' => $updated
                    ]);
                }
            }

            $this->info("Selesai! $ticketCount tiket diupdate menjadi EXPIRED.");
            return 0;
        } catch (\Exception $e) {
            Log::error('Error in ExpireTickets command', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->error('Terjadi kesalahan: ' . $e->getMessage());
            return 1;
        }
    }
}
