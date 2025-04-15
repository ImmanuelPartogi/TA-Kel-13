<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

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

        // Mark as read if not read yet
        if (!$notification->is_read) {
            $notification->is_read = true;
            $notification->save();
        }

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
            'message' => 'Notifikasi berhasil ditandai sebagai dibaca',
            'data' => $notification
        ], 200);
    }

    public function markAllAsRead()
    {
        $user = request()->user();
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi berhasil ditandai sebagai dibaca'
        ], 200);
    }
}
