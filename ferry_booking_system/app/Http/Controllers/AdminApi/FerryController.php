<?php

namespace App\Http\Controllers\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\Ferry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class FerryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Ferry::query();

            // Filter berdasarkan name
            if ($request->has('name') && $request->name) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }

            // Filter berdasarkan registration_number
            if ($request->has('registration_number') && $request->registration_number) {
                $query->where('registration_number', 'like', '%' . $request->registration_number . '%');
            }

            // Filter berdasarkan status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Debug query
            Log::info('Ferry query: ' . $query->toSql());
            Log::info('Bindings: ', $query->getBindings());

            $perPage = $request->input('per_page', 10);
            $ferries = $query->paginate($perPage);

            // Debug result
            Log::info('Total ferries: ' . $ferries->total());

            return response()->json([
                'status' => 'success',
                'data' => $ferries
            ]);
        } catch (\Exception $e) {
            Log::error('Error in ferry index: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:191',
                'registration_number' => 'required|string|max:50|unique:ferries',
                'capacity_passenger' => 'required|integer|min:1',
                'capacity_vehicle_motorcycle' => 'required|integer|min:0',
                'capacity_vehicle_car' => 'required|integer|min:0',
                'capacity_vehicle_bus' => 'required|integer|min:0',
                'capacity_vehicle_truck' => 'required|integer|min:0',
                'status' => 'required|in:ACTIVE,MAINTENANCE,INACTIVE',
                'description' => 'nullable|string',
                'image' => 'nullable|image|max:2048',
                'year_built' => 'nullable|integer|min:1900|max:' . date('Y'),
                'last_maintenance_date' => 'nullable|date',
            ]);

            $ferry = new Ferry($request->except('image'));

            // Upload gambar langsung ke folder public jika ada
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();

                // Buat direktori jika belum ada
                if (!file_exists(public_path('ferries'))) {
                    mkdir(public_path('ferries'), 0777, true);
                }

                $file->move(public_path('ferries'), $fileName);
                $ferry->image = 'ferries/' . $fileName;
            }

            $ferry->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Kapal feri berhasil ditambahkan',
                'data' => $ferry
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in ferry store: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $ferry = Ferry::with(['schedules' => function ($query) {
                $query->where('status', 'ACTIVE')
                      ->with('route');
            }])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $ferry
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kapal tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error in ferry show: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $ferry = Ferry::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:191',
                'registration_number' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('ferries')->ignore($ferry->id),
                ],
                'capacity_passenger' => 'required|integer|min:1',
                'capacity_vehicle_motorcycle' => 'required|integer|min:0',
                'capacity_vehicle_car' => 'required|integer|min:0',
                'capacity_vehicle_bus' => 'required|integer|min:0',
                'capacity_vehicle_truck' => 'required|integer|min:0',
                'status' => 'required|in:ACTIVE,MAINTENANCE,INACTIVE',
                'description' => 'nullable|string',
                'image' => 'nullable|image|max:2048',
                'year_built' => 'nullable|integer|min:1900|max:' . date('Y'),
                'last_maintenance_date' => 'nullable|date',
            ]);

            $ferry->fill($request->except('image', 'remove_image'));

            // Cek apakah checkbox remove_image dicentang
            if ($request->has('remove_image') && $request->remove_image == '1') {
                // Hapus gambar lama jika ada
                if ($ferry->image && file_exists(public_path($ferry->image))) {
                    unlink(public_path($ferry->image));
                }
                // Set kolom image menjadi null
                $ferry->image = null;
            }
            // Jika ada file image baru yang diunggah
            elseif ($request->hasFile('image')) {
                // Hapus gambar lama jika ada
                if ($ferry->image && file_exists(public_path($ferry->image))) {
                    unlink(public_path($ferry->image));
                }

                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();

                // Buat direktori jika belum ada
                if (!file_exists(public_path('ferries'))) {
                    mkdir(public_path('ferries'), 0777, true);
                }

                $file->move(public_path('ferries'), $fileName);
                $ferry->image = 'ferries/' . $fileName;
            }

            $ferry->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Kapal feri berhasil diperbarui',
                'data' => $ferry
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kapal tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error in ferry update: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $ferry = Ferry::findOrFail($id);

            // Periksa apakah feri digunakan dalam jadwal
            $hasSchedules = $ferry->schedules()->exists();

            if ($hasSchedules) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kapal feri tidak dapat dihapus karena digunakan dalam jadwal'
                ], 422);
            }

            // Hapus gambar jika ada
            if ($ferry->image && file_exists(public_path($ferry->image))) {
                unlink(public_path($ferry->image));
            }

            $ferry->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Kapal feri berhasil dihapus'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kapal tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error in ferry destroy: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menghapus data'
            ], 500);
        }
    }
}
