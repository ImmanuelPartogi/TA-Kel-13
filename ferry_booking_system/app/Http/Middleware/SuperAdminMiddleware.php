<?php

// app/Http/Middleware/SuperAdminMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuperAdminMiddleware
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
        // Check if user is logged in as super admin
        if (!Auth::guard('admin')->check() || Auth::guard('admin')->user()->role !== 'SUPER_ADMIN') {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            return redirect()->route('admin.dashboard')
                ->with('error', 'Anda tidak memiliki izin untuk mengakses halaman ini');
        }

        return $next($request);
    }
}
