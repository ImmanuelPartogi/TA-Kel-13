<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id);

        // Filter berdasarkan tipe notifikasi
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan status dibaca
        if ($request->has('is_read')) {
            $isRead = filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_read', $isRead);
        }

        // Filter berdasarkan prioritas
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Paginasi
        $perPage = $request->per_page ?? 15;
        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar notifikasi berhasil diambil',
            'data' => $notifications
        ], 200);
    }

    public function show($id)
    {
        $user = request()->user();
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Detail notifikasi berhasil diambil',
            'data' => $notification
        ], 200);
    }

    public function markAsRead($id)
    {
        $user = request()->user();
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->is_read = true;
        $notification->save();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil ditandai telah dibaca',
            'data' => $notification
        ], 200);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        // Filter berdasarkan tipe jika ada
        $query = Notification::where('user_id', $user->id)
            ->where('is_read', false);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $count = $query->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi berhasil ditandai telah dibaca',
            'data' => [
                'count' => $count
            ]
        ], 200);
    }

    public function getUnreadCount(Request $request)
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id)
            ->where('is_read', false);

        // Filter berdasarkan tipe jika ada
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $count = $query->count();

        return response()->json([
            'success' => true,
            'message' => 'Jumlah notifikasi belum dibaca berhasil diambil',
            'data' => [
                'count' => $count
            ]
        ], 200);
    }

    /**
     * Menampilkan notifikasi berdasarkan tipe
     */
    public function getByType(Request $request, $type)
    {
        $user = $request->user();
        $perPage = $request->per_page ?? 15;

        $notifications = Notification::where('user_id', $user->id)
            ->where('type', $type)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => "Daftar notifikasi tipe {$type} berhasil diambil",
            'data' => $notifications
        ], 200);
    }

    /**
     * Menghapus notifikasi yang sudah dibaca
     */
    public function deleteRead(Request $request)
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id)
            ->where('is_read', true);

        // Filter berdasarkan tipe jika ada
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan tanggal - hapus yang lebih lama dari X hari
        if ($request->has('older_than_days')) {
            $days = (int)$request->older_than_days;
            $query->where('created_at', '<', now()->subDays($days));
        }

        $count = $query->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi yang dibaca berhasil dihapus',
            'data' => [
                'count' => $count
            ]
        ], 200);
    }

    /**
     * Menghapus notifikasi tunggal
     */
    public function delete($id)
    {
        $user = request()->user();
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dihapus'
        ], 200);
    }

    /**
     * Mendapatkan daftar tipe notifikasi
     */
    public function getTypes()
    {
        $types = [
            'BOOKING' => 'Pemesanan',
            'PAYMENT' => 'Pembayaran',
            'SCHEDULE_CHANGE' => 'Perubahan Jadwal',
            'BOARDING' => 'Boarding',
            'SYSTEM' => 'Notifikasi Sistem',
            'PROMO' => 'Promosi'
        ];

        return response()->json([
            'success' => true,
            'message' => 'Daftar tipe notifikasi berhasil diambil',
            'data' => $types
        ], 200);
    }

    /**
     * Mengambil statistik notifikasi
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total' => Notification::where('user_id', $user->id)->count(),
            'unread' => Notification::where('user_id', $user->id)->where('is_read', false)->count(),
            'read' => Notification::where('user_id', $user->id)->where('is_read', true)->count(),
            'by_type' => []
        ];

        // Ambil jumlah notifikasi per tipe
        $typeStats = Notification::where('user_id', $user->id)
            ->select('type', DB::raw('COUNT(*) as count'), DB::raw('SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread'))
            ->groupBy('type')
            ->get();

        foreach ($typeStats as $typeStat) {
            $stats['by_type'][$typeStat->type] = [
                'total' => $typeStat->count,
                'unread' => $typeStat->unread
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Statistik notifikasi berhasil diambil',
            'data' => $stats
        ], 200);
    }

    /**
     * Mengatur preferensi notifikasi pengguna berdasarkan tipe
     * Menyimpan preferensi dalam user_preferences (field array pada user)
     */
    public function updateUserPreferences(Request $request)
    {
        $user = $request->user();

        // Validasi input
        $request->validate([
            'preferences' => 'required|array',
            'preferences.*.type' => 'required|string|in:BOOKING,PAYMENT,SCHEDULE_CHANGE,BOARDING,SYSTEM,PROMO',
            'preferences.*.enabled' => 'required|boolean',
        ]);

        // Ambil preferensi saat ini atau buat baru jika belum ada
        $preferences = $user->notification_preferences ?? [];

        // Update preferensi
        foreach ($request->preferences as $pref) {
            $preferences[$pref['type']] = $pref['enabled'];
        }

        // Simpan kembali ke user
        $user->notification_preferences = $preferences;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Preferensi notifikasi berhasil diperbarui',
            'data' => $preferences
        ], 200);
    }

    /**
     * Mendapatkan preferensi notifikasi pengguna
     */
    public function getUserPreferences(Request $request)
    {
        $user = $request->user();
        $preferences = $user->notification_preferences ?? [];

        // Pastikan semua tipe notifikasi ada di preferensi
        $allTypes = ['BOOKING', 'PAYMENT', 'SCHEDULE_CHANGE', 'BOARDING', 'SYSTEM', 'PROMO'];
        $result = [];

        foreach ($allTypes as $type) {
            $result[$type] = $preferences[$type] ?? true; // Default enabled
        }

        return response()->json([
            'success' => true,
            'message' => 'Preferensi notifikasi berhasil diambil',
            'data' => $result
        ], 200);
    }

    /**
     * Mendapatkan notifikasi yang dikelompokkan berdasarkan tanggal
     */
    public function getGroupedByDate(Request $request)
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id);

        // Filter berdasarkan tipe notifikasi
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter berdasarkan status dibaca
        if ($request->has('is_read')) {
            $isRead = filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_read', $isRead);
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();

        // Kelompokkan berdasarkan tanggal
        $grouped = [];
        foreach ($notifications as $notification) {
            $date = $notification->created_at->format('Y-m-d');

            if (!isset($grouped[$date])) {
                $grouped[$date] = [
                    'date' => $date,
                    'formatted_date' => $this->formatDate($notification->created_at),
                    'items' => []
                ];
            }

            $grouped[$date]['items'][] = $notification;
        }

        // Urutkan berdasarkan tanggal terbaru
        krsort($grouped);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi dikelompokkan berdasarkan tanggal berhasil diambil',
            'data' => array_values($grouped)
        ], 200);
    }

    /**
     * Format tanggal untuk tampilan
     *
     * @param \Carbon\Carbon $date
     * @return string
     */
    private function formatDate($date)
    {
        $now = now();

        if ($date->isToday()) {
            return 'Hari Ini';
        }

        if ($date->isYesterday()) {
            return 'Kemarin';
        }

        if ($date->isSameWeek($now)) {
            return $date->translatedFormat('l'); // Nama hari
        }

        return $date->translatedFormat('d F Y'); // Format tanggal lengkap
    }
}
