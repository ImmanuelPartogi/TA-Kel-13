<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class VehicleCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = VehicleCategory::query();

        // Apply filters
        if ($request->has('code')) {
            $query->where('code', 'like', '%' . $request->code . '%');
        }

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->has('vehicle_type')) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Sorting
        $sortBy = $request->sort_by ?? 'code';
        $sortDirection = $request->sort_direction ?? 'asc';
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->per_page ?? 15;
        $categories = $query->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:vehicle_categories,code',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'vehicle_type' => 'required|in:MOTORCYCLE,CAR,BUS,TRUCK,PICKUP,TRONTON',
            'base_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $category = VehicleCategory::create($validated);

        return response()->json([
            'message' => 'Kategori kendaraan berhasil ditambahkan',
            'data' => $category
        ], 201);
    }

    // Modifikasi method lainnya untuk mengembalikan response JSON

    /**
     * Display the specified resource.
     */
    public function show(VehicleCategory $vehicleCategory)
    {
        return response()->json($vehicleCategory);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VehicleCategory $vehicleCategory)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:vehicle_categories,code,' . $vehicleCategory->id,
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'vehicle_type' => 'required|in:MOTORCYCLE,CAR,BUS,TRUCK,PICKUP,TRONTON',
            'base_price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $vehicleCategory->update($validated);

        return response()->json([
            'message' => 'Kategori kendaraan berhasil diperbarui',
            'data' => $vehicleCategory
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VehicleCategory $vehicleCategory)
    {
        // Cek apakah kategori digunakan oleh kendaraan
        if ($vehicleCategory->vehicles()->count() > 0) {
            return response()->json([
                'message' => 'Kategori ini tidak dapat dihapus karena masih digunakan oleh kendaraan'
            ], 422);
        }

        $vehicleCategory->delete();

        return response()->json([
            'message' => 'Kategori kendaraan berhasil dihapus'
        ]);
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggleStatus(VehicleCategory $vehicleCategory)
    {
        $vehicleCategory->is_active = !$vehicleCategory->is_active;
        $vehicleCategory->save();

        $status = $vehicleCategory->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Kategori kendaraan berhasil {$status}",
            'data' => $vehicleCategory
        ]);
    }

    /**
     * Get categories by vehicle type
     */
    public function getCategoriesByType(Request $request)
    {
        $type = $request->input('type');
        $categories = VehicleCategory::where('vehicle_type', $type)
            ->where('is_active', true)
            ->get(['id', 'code', 'name', 'base_price']);

        return response()->json($categories);
    }

    /**
     * Mendapatkan semua jenis kendaraan yang unik
     */
    public function getVehicleTypes()
    {
        try {
            // Ambil semua jenis kendaraan yang unik
            $vehicleTypes = VehicleCategory::select('vehicle_type')
                ->where('is_active', true)
                ->distinct()
                ->get()
                ->pluck('vehicle_type');

            // Siapkan data dengan label yang lebih ramah pengguna
            $formattedTypes = $vehicleTypes->map(function ($type) {
                $labels = [
                    'MOTORCYCLE' => 'Motor',
                    'CAR' => 'Mobil',
                    'BUS' => 'Bus',
                    'TRUCK' => 'Truk',
                    'PICKUP' => 'Pickup',
                    'TRONTON' => 'Tronton',
                ];

                return [
                    'code' => $type,
                    'name' => $labels[$type] ?? $type
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Data jenis kendaraan berhasil diambil',
                'data' => $formattedTypes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data jenis kendaraan: ' . $e->getMessage()
            ], 500);
        }
    }
}
