<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\VehicleCategory;
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

        // Tambahkan data vehicle categories
        $vehicleCategories = VehicleCategory::where('is_active', true)->get()->groupBy('vehicle_type');

        return response()->json([
            'success' => true,
            'message' => 'Daftar rute berhasil diambil',
            'data' => $routes,
            'vehicle_categories' => $vehicleCategories
        ], 200);
    }

    public function show($id)
    {
        $route = Route::findOrFail($id);
        $vehicleCategories = VehicleCategory::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'message' => 'Detail rute berhasil diambil',
            'data' => $route,
            'vehicle_categories' => $vehicleCategories  // Pastikan data ini disertakan
        ], 200);
    }
}
