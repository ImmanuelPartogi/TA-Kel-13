<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class VehicleCategoryController extends Controller
{
    /**
     * Get all active vehicle categories
     */
    public function index()
    {
        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('vehicle_type')
            ->orderBy('code')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori kendaraan berhasil diambil',
            'data' => $categories
        ], 200);
    }

    /**
     * Get categories by vehicle type
     */
    public function getByType(Request $request, $type)
    {
        $categories = VehicleCategory::where('vehicle_type', $type)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori kendaraan berhasil diambil',
            'data' => $categories
        ], 200);
    }
}
