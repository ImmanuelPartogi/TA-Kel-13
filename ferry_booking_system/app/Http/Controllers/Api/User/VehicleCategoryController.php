<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class VehicleCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = VehicleCategory::orderBy('code')->get();
        return view('admin.vehicle-categories.index', compact('categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $vehicleTypes = [
            'MOTORCYCLE' => 'Sepeda Motor',
            'CAR' => 'Mobil',
            'BUS' => 'Bus',
            'TRUCK' => 'Truk',
            'PICKUP' => 'Pickup',
            'TRONTON' => 'Tronton'
        ];

        return view('admin.vehicle-categories.create', compact('vehicleTypes'));
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

        VehicleCategory::create($validated);

        return redirect()->route('admin.vehicle-categories.index')
                         ->with('success', 'Kategori kendaraan berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(VehicleCategory $vehicleCategory)
    {
        return view('admin.vehicle-categories.show', compact('vehicleCategory'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(VehicleCategory $vehicleCategory)
    {
        $vehicleTypes = [
            'MOTORCYCLE' => 'Sepeda Motor',
            'CAR' => 'Mobil',
            'BUS' => 'Bus',
            'TRUCK' => 'Truk',
            'PICKUP' => 'Pickup',
            'TRONTON' => 'Tronton'
        ];

        return view('admin.vehicle-categories.edit', compact('vehicleCategory', 'vehicleTypes'));
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

        return redirect()->route('admin.vehicle-categories.index')
                         ->with('success', 'Kategori kendaraan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VehicleCategory $vehicleCategory)
    {
        // Cek apakah kategori digunakan oleh kendaraan
        if ($vehicleCategory->vehicles()->count() > 0) {
            return redirect()->route('admin.vehicle-categories.index')
                             ->with('error', 'Kategori ini tidak dapat dihapus karena masih digunakan oleh kendaraan.');
        }

        $vehicleCategory->delete();

        return redirect()->route('admin.vehicle-categories.index')
                         ->with('success', 'Kategori kendaraan berhasil dihapus.');
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggleStatus(VehicleCategory $vehicleCategory)
    {
        $vehicleCategory->is_active = !$vehicleCategory->is_active;
        $vehicleCategory->save();

        $status = $vehicleCategory->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->route('admin.vehicle-categories.index')
                         ->with('success', "Kategori kendaraan berhasil {$status}.");
    }

    /**
     * Get categories by vehicle type (for AJAX requests)
     */
    public function getCategoriesByType(Request $request)
    {
        $type = $request->input('type');
        $categories = VehicleCategory::where('vehicle_type', $type)
                                    ->where('is_active', true)
                                    ->get(['id', 'code', 'name', 'base_price']);

        return response()->json($categories);
    }
}
