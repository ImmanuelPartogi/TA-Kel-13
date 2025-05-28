<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Admin;
use App\Models\Operator;

class BackendLoginController extends Controller
{
    /**
     * Login API untuk admin
     */
    public function adminApiLogin(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Coba login dengan guard admin
        if (Auth::guard('admin')->attempt([
            'email' => $request->email,
            'password' => $request->password
        ])) {
            $admin = Admin::where('email', $request->email)->first();

            // Update last_login timestamp jika kolom ada
            if (isset($admin->last_login)) {
                $admin->last_login = now();
                $admin->save();
            }

            $token = $admin->createToken('admin-token', ['role:admin'])->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'token' => $token,
                'user' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => 'admin',
                    'last_login' => $admin->last_login ?? null
                    // remember_token tidak dimasukkan ke respons
                ]
            ]);
        }

        // Jika gagal
        return response()->json([
            'status' => 'error',
            'message' => 'Email atau password salah'
        ], 401);
    }

    /**
     * Login API untuk operator
     */
    public function operatorLogin(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Coba login dengan guard operator
        if (Auth::guard('operator')->attempt([
            'email' => $request->email,
            'password' => $request->password
        ])) {
            $operator = Operator::where('email', $request->email)->first();

            // Log status untuk debugging
            Log::info('Operator login attempt', [
                'operator_id' => $operator->id,
                'email' => $operator->email,
                'status' => $operator->status,
                'status_type' => gettype($operator->status)
            ]);

            // Periksa status dengan case insensitive
            $status = strtoupper($operator->status ?? '');

            if ($status !== 'ACTIVE') {
                // Revoke token yang baru saja dibuat
                $operator->tokens()->delete();

                return response()->json([
                    'status' => 'error',
                    'message' => 'Akun operator tidak aktif. Hubungi administrator sistem.'
                ], 403);
            }

            // Update last_login timestamp
            $operator->last_login = now();
            $operator->save();

            $token = $operator->createToken('operator-token', ['role:operator'])->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'token' => $token,
                'user' => [
                    'id' => $operator->id,
                    'company_name' => $operator->company_name,
                    'email' => $operator->email,
                    'role' => 'operator',
                    'assigned_routes' => $operator->assigned_routes,
                    'status' => $operator->status,
                    'last_login' => $operator->last_login
                ]
            ]);
        }

        // Jika gagal
        return response()->json([
            'status' => 'error',
            'message' => 'Email atau password salah'
        ], 401);
    }

    /**
     * Logout admin API
     */
    public function adminApiLogout(Request $request)
    {
        // Hapus token saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout'
        ]);
    }

    /**
     * Logout operator API
     */
    public function operatorApiLogout(Request $request)
    {
        // Hapus token saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout'
        ]);
    }
}
