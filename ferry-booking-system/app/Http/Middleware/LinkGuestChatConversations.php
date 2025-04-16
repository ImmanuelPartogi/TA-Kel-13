<?php

namespace App\Http\Middleware;

use App\Models\ChatConversation;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LinkGuestChatConversations
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (session()->has('device_id') && Auth::check()) {
            $deviceId = session('device_id');
            // Cek apakah ada percakapan tamu dengan device_id ini
            $guestConversations = ChatConversation::where('session_id', $deviceId)
                ->whereNull('user_id')
                ->get();
            // Kaitkan percakapan tamu dengan akun pengguna
            foreach ($guestConversations as $conversation) {
                $conversation->update(['user_id' => Auth::id()]);
            }
            // Hapus session device_id
            session()->forget('device_id');
        }
        return $next($request);
    }
}
