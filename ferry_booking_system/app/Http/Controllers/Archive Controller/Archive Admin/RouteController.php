<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $query = Route::query();

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan origin
        if ($request->has('origin')) {
            $query->where('origin', 'like', '%' . $request->origin . '%');
        }

        // Filter berdasarkan destination
        if ($request->has('destination')) {
            $query->where('destination', 'like', '%' . $request->destination . '%');
        }

        $routes = $query->paginate(10);

        return view('admin.routes.index', compact('routes'));
    }

    public function create()
    {
        return view('admin.routes.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'origin' => 'required|string|max:191',
            'destination' => 'required|string|max:191',
            'route_code' => 'required|string|max:20|unique:routes',
            'distance' => 'nullable|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'motorcycle_price' => 'required|numeric|min:0',
            'car_price' => 'required|numeric|min:0',
            'bus_price' => 'required|numeric|min:0',
            'truck_price' => 'required|numeric|min:0',
            'status' => 'required|in:ACTIVE,INACTIVE,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        $route = new Route($request->all());

        if ($request->status !== 'ACTIVE') {
            $route->status_updated_at = Carbon::now();

            if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                $route->status_expiry_date = Carbon::parse($request->status_expiry_date);
            }
        }

        $route->save();

        return redirect()->route('admin.routes.index')
            ->with('success', 'Rute berhasil ditambahkan');
    }

    public function show($id)
    {
        $route = Route::findOrFail($id);
        return view('admin.routes.show', compact('route'));
    }

    public function edit($id)
    {
        $route = Route::findOrFail($id);
        return view('admin.routes.edit', compact('route'));
    }

    public function update(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        $request->validate([
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
            'motorcycle_price' => 'required|numeric|min:0',
            'car_price' => 'required|numeric|min:0',
            'bus_price' => 'required|numeric|min:0',
            'truck_price' => 'required|numeric|min:0',
            'status' => 'required|in:ACTIVE,INACTIVE,WEATHER_ISSUE',
            'status_reason' => 'nullable|string|max:191',
        ]);

        // Check if status changed
        $statusChanged = $route->status !== $request->status;

        $route->fill($request->all());

        if ($statusChanged) {
            $route->status_updated_at = Carbon::now();

            if ($request->status === 'WEATHER_ISSUE' && $request->has('status_expiry_date')) {
                $route->status_expiry_date = Carbon::parse($request->status_expiry_date);
            } else {
                $route->status_expiry_date = null;
            }
        }

        $route->save();

        return redirect()->route('admin.routes.index')
            ->with('success', 'Rute berhasil diperbarui');
    }

    public function destroy($id)
    {
        $route = Route::findOrFail($id);

        // Periksa apakah rute digunakan dalam jadwal
        $hasSchedules = $route->schedules()->exists();

        if ($hasSchedules) {
            return redirect()->route('admin.routes.index')
                ->with('error', 'Rute tidak dapat dihapus karena digunakan dalam jadwal');
        }

        $route->delete();

        return redirect()->route('admin.routes.index')
            ->with('success', 'Rute berhasil dihapus');
    }
}
