<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Operator;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class OperatorController extends Controller
{
    public function index(Request $request)
    {
        $query = Operator::query();

        // Implementasi filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $operators = $query->paginate($request->input('per_page', 10));

        return response()->json($operators);
    }

    public function show($id)
    {
        $operator = Operator::findOrFail($id);
        $routes = Route::whereIn('id', is_array($operator->assigned_routes) ? $operator->assigned_routes : [])->get();

        return response()->json([
            'operator' => $operator,
            'routes' => $routes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:191',
            'email' => 'required|string|email|max:191|unique:operators',
            'phone_number' => 'required|string|max:20',
            'license_number' => 'required|string|max:100',
            'fleet_size' => 'nullable|integer|min:0',
            'company_address' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'assigned_routes' => 'nullable|array',
        ]);

        $operator = new Operator([
            'company_name' => $validated['company_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'license_number' => $validated['license_number'],
            'fleet_size' => $validated['fleet_size'] ?? 0,
            'company_address' => $validated['company_address'],
            'password' => Hash::make($validated['password']),
            'assigned_routes' => $validated['assigned_routes'] ?? null,
        ]);

        $operator->save();

        return response()->json([
            'message' => 'Operator berhasil ditambahkan',
            'operator' => $operator
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $operator = Operator::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'required|string|max:191',
            'email' => [
                'required',
                'string',
                'email',
                'max:191',
                Rule::unique('operators')->ignore($operator->id),
            ],
            'phone_number' => 'required|string|max:20',
            'license_number' => 'required|string|max:100',
            'fleet_size' => 'nullable|integer|min:0',
            'company_address' => 'required|string',
            'password' => 'nullable|string|min:8|confirmed',
            'assigned_routes' => 'nullable|array',
        ]);

        $operator->company_name = $validated['company_name'];
        $operator->email = $validated['email'];
        $operator->phone_number = $validated['phone_number'];
        $operator->license_number = $validated['license_number'];
        $operator->fleet_size = $validated['fleet_size'] ?? 0;
        $operator->company_address = $validated['company_address'];
        $operator->assigned_routes = $validated['assigned_routes'] ?? null;

        if ($request->filled('password')) {
            $operator->password = Hash::make($validated['password']);
        }

        $operator->save();

        return response()->json([
            'message' => 'Operator berhasil diperbarui',
            'operator' => $operator
        ]);
    }

    public function destroy($id)
    {
        try {
            $operator = Operator::findOrFail($id);
            $operator->delete();

            return response()->json([
                'message' => 'Operator berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus operator. Pastikan tidak ada data terkait operator ini.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkEmailAvailability(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $exists = Operator::where('email', $request->email)->exists();

        return response()->json([
            'available' => !$exists
        ]);
    }

    public function getRoutes()
    {
        $routes = Route::where('status', 'ACTIVE')->get();

        return response()->json($routes);
    }
}
