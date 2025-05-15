<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $query = Route::query();

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', 'ACTIVE');
        }

        // Filter berdasarkan origin atau destination
        if ($request->has('origin')) {
            $query->where('origin', 'like', '%' . $request->origin . '%');
        }

        if ($request->has('destination')) {
            $query->where('destination', 'like', '%' . $request->destination . '%');
        }

        $routes = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar rute berhasil diambil',
            'data' => $routes
        ], 200);
    }

    public function show($id)
    {
        $route = Route::findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail rute berhasil diambil',
            'data' => $route
        ], 200);
    }
}
