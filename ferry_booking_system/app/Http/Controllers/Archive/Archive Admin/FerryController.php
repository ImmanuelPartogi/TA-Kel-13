<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ferry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class FerryController extends Controller
{
    public function index(Request $request)
    {
        $query = Ferry::query();

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan nama
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Filter berdasarkan nomor registrasi
        if ($request->has('registration_number')) {
            $query->where('registration_number', 'like', '%' . $request->registration_number . '%');
        }

        $ferries = $query->paginate(10);

        return view('admin.ferries.index', compact('ferries'));
    }

    public function create()
    {
        return view('admin.ferries.create');
    }

    public function store(Request $request)
    {
        $request->validate([
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
            $file->move(public_path('ferries'), $fileName);
            $ferry->image = 'ferries/' . $fileName;
        }

        $ferry->save();

        return redirect()->route('admin.ferries.index')
            ->with('success', 'Kapal feri berhasil ditambahkan');
    }

    public function show($id)
    {
        $ferry = Ferry::with(['schedules' => function ($query) {
            $query->where('status', 'ACTIVE');
        }])->findOrFail($id);

        return view('admin.ferries.show', compact('ferry'));
    }

    public function edit($id)
    {
        $ferry = Ferry::findOrFail($id);
        return view('admin.ferries.edit', compact('ferry'));
    }

    public function update(Request $request, $id)
    {
        $ferry = Ferry::findOrFail($id);

        $request->validate([
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
            // Menghapus validasi remove_image karena akan dihandle secara terpisah
        ]);

        $ferry->fill($request->except('image', 'remove_image'));

        // Cek apakah checkbox remove_image dicentang
        if ($request->has('remove_image')) {
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
            $file->move(public_path('ferries'), $fileName);
            $ferry->image = 'ferries/' . $fileName;
        }

        $ferry->save();

        return redirect()->route('admin.ferries.index')
            ->with('success', 'Kapal feri berhasil diperbarui');
    }

    public function destroy($id)
    {
        $ferry = Ferry::findOrFail($id);

        // Periksa apakah feri digunakan dalam jadwal
        $hasSchedules = $ferry->schedules()->exists();

        if ($hasSchedules) {
            return redirect()->route('admin.ferries.index')
                ->with('error', 'Kapal feri tidak dapat dihapus karena digunakan dalam jadwal');
        }

        // Hapus gambar jika ada
        if ($ferry->image && file_exists(public_path($ferry->image))) {
            unlink(public_path($ferry->image));
        }

        $ferry->delete();

        return redirect()->route('admin.ferries.index')
            ->with('success', 'Kapal feri berhasil dihapus');
    }
}
