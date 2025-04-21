@extends('layouts.app')

@section('title', 'Daftar Booking')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">Daftar Booking</h3>
        </div>

        <div class="px-6 py-4">
            <form action="{{ route('operator.bookings.index') }}" method="GET" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" name="booking_code" value="{{ request('booking_code') }}" class="input input-bordered w-full" placeholder="Kode Booking">
                    <input type="text" name="user_name" value="{{ request('user_name') }}" class="input input-bordered w-full" placeholder="Nama Pengguna">
                    <select name="route_id" class="input input-bordered w-full">
                        <option value="">Semua Rute</option>
                        @foreach(Auth::guard('operator')->user()->assignedRoutes ?? [] as $routeId => $routeName)
                            <option value="{{ $routeId }}" {{ request('route_id') == $routeId ? 'selected' : '' }}>{{ $routeName }}</option>
                        @endforeach
                    </select>
                    <select name="status" class="input input-bordered w-full">
                        <option value="">Semua Status</option>
                        <option value="PENDING" {{ request('status') == 'PENDING' ? 'selected' : '' }}>Menunggu</option>
                        <option value="CONFIRMED" {{ request('status') == 'CONFIRMED' ? 'selected' : '' }}>Dikonfirmasi</option>
                        <option value="COMPLETED" {{ request('status') == 'COMPLETED' ? 'selected' : '' }}>Selesai</option>
                        <option value="CANCELLED" {{ request('status') == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                    </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="date" name="booking_date_from" value="{{ request('booking_date_from') }}" class="input input-bordered w-full">
                    <input type="date" name="booking_date_to" value="{{ request('booking_date_to') }}" class="input input-bordered w-full">
                    <div class="md:col-span-2 flex items-center space-x-2">
                        <button type="submit" class="btn btn-primary">Filter</button>
                        <a href="{{ route('operator.bookings.index') }}" class="btn btn-outline">Reset</a>
                    </div>
                </div>
            </form>
        </div>

        <div class="overflow-x-auto px-6 pb-6">
            <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead class="bg-gray-50">
                    <tr class="text-left text-sm font-semibold text-gray-700">
                        <th class="px-4 py-2">Kode Booking</th>
                        <th class="px-4 py-2">Pengguna</th>
                        <th class="px-4 py-2">Rute</th>
                        <th class="px-4 py-2">Tanggal</th>
                        <th class="px-4 py-2">Penumpang</th>
                        <th class="px-4 py-2">Kendaraan</th>
                        <th class="px-4 py-2">Total</th>
                        <th class="px-4 py-2">Status</th>
                        <th class="px-4 py-2">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white text-sm">
                    @forelse($bookings as $booking)
                    <tr>
                        <td class="px-4 py-2">{{ $booking->booking_code }}</td>
                        <td class="px-4 py-2">{{ $booking->user->name }}</td>
                        <td class="px-4 py-2">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
                        <td class="px-4 py-2">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</td>
                        <td class="px-4 py-2">{{ $booking->passenger_count }}</td>
                        <td class="px-4 py-2">{{ $booking->vehicles->count() }}</td>
                        <td class="px-4 py-2">Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                        <td class="px-4 py-2">
                            @php
                                $badgeColors = [
                                    'PENDING' => 'bg-yellow-100 text-yellow-800',
                                    'CONFIRMED' => 'bg-green-100 text-green-800',
                                    'COMPLETED' => 'bg-blue-100 text-blue-800',
                                    'CANCELLED' => 'bg-red-100 text-red-800',
                                ];
                            @endphp
                            <span class="px-2 py-1 rounded text-xs font-medium {{ $badgeColors[$booking->status] ?? 'bg-gray-100 text-gray-800' }}">
                                {{
                                    match($booking->status) {
                                        'PENDING' => 'Menunggu',
                                        'CONFIRMED' => 'Dikonfirmasi',
                                        'COMPLETED' => 'Selesai',
                                        'CANCELLED' => 'Dibatalkan',
                                        default => $booking->status
                                    }
                                }}
                            </span>
                        </td>
                        <td class="px-4 py-2">
                            <a href="{{ route('operator.bookings.show', $booking->id) }}" class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition">
                                <i class="fas fa-eye mr-1"></i> Detail
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9" class="text-center px-4 py-6 text-gray-500">Tidak ada data booking</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>

            <div class="mt-6">
                {{ $bookings->appends(request()->query())->links('pagination::tailwind') }}
            </div>
        </div>
    </div>
</div>
@endsection
