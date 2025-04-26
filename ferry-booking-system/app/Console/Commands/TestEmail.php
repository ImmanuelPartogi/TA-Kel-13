<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'email:test {email}';
    protected $description = 'Mengirim email uji ke alamat tertentu';

    public function handle()
    {
        $email = $this->argument('email');

        $this->info("Mengirim email test ke $email...");

        try {
            Mail::raw('Ini adalah email uji dari aplikasi Ferry Booking.', function($message) use ($email) {
                $message->to($email);
                $message->subject('Pengujian Email Ferry Booking App');
            });

            $this->info('Email berhasil dikirim!');
        } catch (\Exception $e) {
            $this->error('Gagal mengirim email: ' . $e->getMessage());
        }

        return 0;
    }
}
