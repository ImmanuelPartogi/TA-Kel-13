<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\VehicleCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $query = Route::query();

        // Filter berdasarkan search (cari di origin atau destination)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('origin', 'like', '%' . $search . '%')
                    ->orWhere('destination', 'like', '%' . $search . '%')
                    ->orWhere('route_code', 'like', '%' . $search . '%');
            });
        }

        // Filter berdasarkan status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan origin (tetap ada jika dibutuhkan)
        if ($request->has('origin') && $request->origin) {
            $query->where('origin', 'like', '%' . $request->origin . '%');
        }

        // Filter berdasarkan destination (tetap ada jika dibutuhkan)
        if ($request->has('destination') && $request->destination) {
            $query->where('destination', 'like', '%' . $request->destination . '%');
        }

        $perPage = $request->input('per_page', 10);
        $routes = $query->paginate($perPage);

        // Tambahkan data vehicle categories
        $vehicleCategories = VehicleCategory::where('is_active', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $routes,
            'vehicle_categories' => $vehicleCategories
        ]);
    }

    public function show($id)
    {
        $route = Route::findOrFail($id);
        // Tambahkan data vehicle categories
        $vehicleCategories = VehicleCategory::where('is_active', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $route,
            'vehicle_categories' => $vehicleCategories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'origin' => 'required|string|max:191',
            'destination' => 'required|string|max:191',
            'route_code' => 'required|string|max:20|unique:routes',
            'distance' => 'nullable|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            // Validasi harga kendaraan dihapus karena sudah ada di vehicle_categories
            'status' => 'required|in:ACTIVE,INACTIVE,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        $route = new Route($validated);

        if ($request->status !== 'ACTIVE') {
            $route->status_updated_at = Carbon::now();

            if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                $route->status_expiry_date = Carbon::parse($request->status_expiry_date);
            }
        }

        $route->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Rute berhasil ditambahkan',
            'data' => $route
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        $validated = $request->validate([
            'origin' => 'required|string|max:191',
            'destination' => 'required|string|max:191',
            'route_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('routes')->ignore($route->id),
            ],
            'distance' => 'nullable|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            // Validasi harga kendaraan dihapus karena sudah ada di vehicle_categories
            'status' => 'required|in:ACTIVE,INACTIVE,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        // Check if status changed
        $statusChanged = $route->status !== $request->status;

        $route->fill($validated);

        if ($statusChanged) {
            $route->status_updated_at = Carbon::now();

            if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                $route->status_expiry_date = Carbon::parse($request->status_expiry_date);
            } else {
                $route->status_expiry_date = null;
            }
        }

        $route->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Rute berhasil diperbarui',
            'data' => $route
        ]);
    }

    public function destroy($id)
    {
        $route = Route::findOrFail($id);

        // Periksa apakah rute digunakan dalam jadwal
        $hasSchedules = $route->schedules()->exists();

        if ($hasSchedules) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rute tidak dapat dihapus karena digunakan dalam jadwal'
            ], 422);
        }

        $route->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Rute berhasil dihapus'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:ACTIVE,INACTIVE,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
            'status_expiry_date' => 'nullable|date|after:now',
        ]);

        // Check if status changed
        $statusChanged = $route->status !== $request->status;

        if ($statusChanged) {
            $route->status = $request->status;
            $route->status_reason = $request->status_reason;
            $route->status_updated_at = Carbon::now();

            if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                $route->status_expiry_date = Carbon::parse($request->status_expiry_date);
            } else {
                $route->status_expiry_date = null;
            }

            $route->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Status rute berhasil diperbarui',
                'data' => $route
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tidak ada perubahan status',
            'data' => $route
        ]);
    }
}
