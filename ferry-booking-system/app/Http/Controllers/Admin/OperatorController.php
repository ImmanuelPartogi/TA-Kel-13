<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Operator;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
        $request->validate([
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
            'company_name' => $request->company_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'license_number' => $request->license_number,
            'fleet_size' => $request->fleet_size ?? 0,
            'company_address' => $request->company_address,
            'password' => Hash::make($request->password),
            'assigned_routes' => $request->assigned_routes ?? null,
        ]);

        $operator->save();

        return redirect()->route('admin.operators.index')
            ->with('success', 'Operator berhasil ditambahkan');
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

        $request->validate([
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

        $operator->company_name = $request->company_name;
        $operator->email = $request->email;
        $operator->phone_number = $request->phone_number;
        $operator->license_number = $request->license_number;
        $operator->fleet_size = $request->fleet_size ?? 0;
        $operator->company_address = $request->company_address;
        $operator->assigned_routes = $request->assigned_routes ?? null;

        if ($request->filled('password')) {
            $operator->password = Hash::make($request->password);
        }

        $operator->save();

        return redirect()->route('admin.operators.index')
            ->with('success', 'Operator berhasil diperbarui');
    }

    public function destroy($id)
    {
        $operator = Operator::findOrFail($id);
        $operator->delete();

        return redirect()->route('admin.operators.index')
            ->with('success', 'Operator berhasil dihapus');
    }
}
