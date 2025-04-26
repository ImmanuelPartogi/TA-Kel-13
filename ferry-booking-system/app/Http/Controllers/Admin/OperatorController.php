<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Operator;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class OperatorController extends Controller
{
    public function index()
    {
        $operators = Operator::paginate(10);
        return view('admin.operators.index', compact('operators'));
    }

    public function create()
    {
        $routes = Route::where('status', 'ACTIVE')->get();
        return view('admin.operators.create', compact('routes'));
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

        return redirect()->route('admin.operators.index')
            ->with('success', 'Operator berhasil ditambahkan');
    }

    public function show($id)
    {
        $operator = Operator::findOrFail($id);
        $routes = Route::whereIn('id', is_array($operator->assigned_routes) ? $operator->assigned_routes : [])->get();
        return view('admin.operators.show', compact('operator', 'routes'));
    }

    public function edit($id)
    {
        $operator = Operator::findOrFail($id);
        $routes = Route::where('status', 'ACTIVE')->get();
        return view('admin.operators.edit', compact('operator', 'routes'));
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

        return redirect()->route('admin.operators.index')
            ->with('success', 'Operator berhasil diperbarui');
    }

    public function destroy($id)
    {
        try {
            $operator = Operator::findOrFail($id);
            $operator->delete();
            return redirect()->route('admin.operators.index')
                ->with('success', 'Operator berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->route('admin.operators.index')
                ->with('error', 'Gagal menghapus operator. Pastikan tidak ada data terkait operator ini.');
        }
    }
}
