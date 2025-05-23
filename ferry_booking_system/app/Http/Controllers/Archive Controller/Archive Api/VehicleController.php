<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $vehicles = Vehicle::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kendaraan berhasil diambil',
            'data' => $vehicles
        ], 200);
    }

    public function show($id)
    {
        $user = request()->user();
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Detail kendaraan berhasil diambil',
            'data' => $vehicle
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:MOTORCYCLE,CAR,BUS,TRUCK',
            'license_plate' => 'required|string|max:20',
            'brand' => 'sometimes|string|max:100|nullable',
            'model' => 'sometimes|string|max:100|nullable',
            'weight' => 'sometimes|numeric|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $vehicle = new Vehicle($request->all());
        $vehicle->user_id = $user->id;
        $vehicle->save();

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil disimpan',
            'data' => $vehicle
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:MOTORCYCLE,CAR,BUS,TRUCK',
            'license_plate' => 'sometimes|string|max:20',
            'brand' => 'sometimes|string|max:100|nullable',
            'model' => 'sometimes|string|max:100|nullable',
            'weight' => 'sometimes|numeric|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $vehicle->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil diperbarui',
            'data' => $vehicle
        ], 200);
    }

    public function destroy($id)
    {
        $user = request()->user();
        $vehicle = Vehicle::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check if vehicle is in active booking
        $activeBooking = $vehicle->booking()->whereIn('status', ['PENDING', 'CONFIRMED'])->first();
        if ($activeBooking) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan tidak dapat dihapus karena terkait dengan booking aktif'
            ], 400);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil dihapus'
        ], 200);
    }
}
