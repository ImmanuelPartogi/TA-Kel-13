<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class PollingController extends Controller
{
    /**
     * Memicu polling pembayaran secara manual
     */
    public function triggerPaymentPolling(Request $request)
    {
        // Verifikasi bahwa user adalah admin atau memiliki izin
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            // Jalankan command secara asynchronous
            Artisan::queue('payments:check-pending');

            return response()->json([
                'success' => true,
                'message' => 'Payment polling triggered successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to trigger payment polling: ' . $e->getMessage()
            ], 500);
        }
    }
}
