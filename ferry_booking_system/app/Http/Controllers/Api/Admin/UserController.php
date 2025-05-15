<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Filter berdasarkan nama
        if ($request->has('name') && $request->name) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Filter berdasarkan email
        if ($request->has('email') && $request->email) {
            $query->where('email', 'like', '%' . $request->email . '%');
        }

        // Filter berdasarkan nomor telepon
        if ($request->has('phone') && $request->phone) {
            $query->where('phone', 'like', '%' . $request->phone . '%');
        }

        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        // Get user statistics
        $totalUsers = User::count();

        $startOfMonth = Carbon::now()->startOfMonth();
        $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();

        // Active users (has at least one booking in the last 3 months)
        $threeMonthsAgo = Carbon::now()->subMonths(3);
        $activeUsers = User::whereHas('bookings', function($query) use ($threeMonthsAgo) {
            $query->where('created_at', '>=', $threeMonthsAgo);
        })->count();

        // Average bookings per user
        $totalBookings = Booking::count();
        $avgBookingsPerUser = $totalUsers > 0 ? $totalBookings / $totalUsers : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'users' => $users,
                'stats' => [
                    'total_users' => $totalUsers,
                    'new_users_this_month' => $newUsersThisMonth,
                    'active_users' => $activeUsers,
                    'avg_bookings_per_user' => $avgBookingsPerUser
                ]
            ]
        ]);
    }

    public function show($id)
    {
        $user = User::with(['bookings' => function($query) {
            $query->with(['schedule.route', 'schedule.ferry'])
                ->orderBy('created_at', 'desc');
        }, 'vehicles'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:191',
            'email' => [
                'required',
                'string',
                'email',
                'max:191',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'id_number' => 'nullable|string|max:30',
            'id_type' => 'nullable|in:KTP,SIM,PASPOR',
            'date_of_birthday' => 'nullable|date',
            'gender' => 'nullable|in:MALE,FEMALE',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->address = $request->address;
        $user->id_number = $request->id_number;
        $user->id_type = $request->id_type;
        $user->date_of_birthday = $request->date_of_birthday;
        $user->gender = $request->gender;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Periksa apakah pengguna memiliki booking aktif
        $hasActiveBookings = $user->bookings()->whereIn('status', ['PENDING', 'CONFIRMED'])->exists();

        if ($hasActiveBookings) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak dapat dihapus karena memiliki booking aktif'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil dihapus'
        ]);
    }
}
