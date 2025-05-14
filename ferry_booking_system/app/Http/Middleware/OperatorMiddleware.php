<?php
// app/Http/Middleware/OperatorMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OperatorMiddleware
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
        // Check if user is logged in as operator
        if (!Auth::guard('operator')->check()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            return redirect()->route('operator.login');
        }

        return $next($request);
    }

    // Di OperatorController atau middleware
private function getAssignedRoutes($operator)
{
    $assignedRoutes = $operator->assigned_routes ?? [];

    // Jika null atau bukan array, return empty array
    if (!is_array($assignedRoutes)) {
        try {
            $assignedRoutes = json_decode($assignedRoutes, true) ?? [];
        } catch (\Exception $e) {
            $assignedRoutes = [];
        }
    }

    return $assignedRoutes;
}
}
