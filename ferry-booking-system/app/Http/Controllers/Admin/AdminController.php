<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function index()
    {
        $admins = Admin::paginate(10);
        return view('admin.admins.index', compact('admins'));
    }

    public function create()
    {
        return view('admin.admins.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:191',
            'email' => 'required|string|email|max:191|unique:admins',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:SUPER_ADMIN,ADMIN',
            'permissions' => 'nullable|array',
        ]);

        $admin = new Admin([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'permissions' => $request->permissions ?? null,
        ]);

        $admin->save();

        return redirect()->route('admin.admins.index')
            ->with('success', 'Admin berhasil ditambahkan');
    }

    public function edit($id)
    {
        $admin = Admin::findOrFail($id);
        return view('admin.admins.edit', compact('admin'));
    }

    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:191',
            'email' => [
                'required',
                'string',
                'email',
                'max:191',
                Rule::unique('admins')->ignore($admin->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:SUPER_ADMIN,ADMIN',
            'permissions' => 'nullable|array',
        ]);

        $admin->name = $request->name;
        $admin->email = $request->email;
        $admin->role = $request->role;
        $admin->permissions = $request->permissions ?? null;

        if ($request->filled('password')) {
            $admin->password = Hash::make($request->password);
        }

        $admin->save();

        return redirect()->route('admin.admins.index')
            ->with('success', 'Admin berhasil diperbarui');
    }

    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);

        // Jangan izinkan admin menghapus dirinya sendiri
        if ($admin->id === auth('admin')->user()->id) {
            return redirect()->route('admin.admins.index')
                ->with('error', 'Anda tidak dapat menghapus akun Anda sendiri');
        }

        $admin->delete();

        return redirect()->route('admin.admins.index')
            ->with('success', 'Admin berhasil dihapus');
    }
}
