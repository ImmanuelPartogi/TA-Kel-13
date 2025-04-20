@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Detail Pengguna</h1>
        <div class="mt-3 md:mt-0 flex space-x-2">
            <a href="{{ route('admin.users.edit', $user->id) }}" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
            </a>
            <a href="{{ route('admin.users.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
            <!-- User Profile Card -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <h2 class="text-lg font-semibold text-blue-600">Profil Pengguna</h2>
                </div>
                <div class="p-6">
                    <div class="flex flex-col items-center mb-6">
                        @if($user->profile_picture)
                            <img src="{{ asset('storage/' . $user->profile_picture) }}" alt="{{ $user->name }}" class="h-32 w-32 rounded-full object-cover">
                        @else
                            <div class="h-32 w-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
                                {{ strtoupper(substr($user->name, 0, 1)) }}
                            </div>
                        @endif
                        <h4 class="mt-4 text-xl font-semibold text-gray-800">{{ $user->name }}</h4>
                        <p class="text-sm text-gray-500">
                            Member sejak {{ $user->created_at->format('d M Y') }}
                        </p>
                    </div>

                    <div class="space-y-3">
                        <div class="grid grid-cols-3 items-center">
                            <span class="col-span-1 text-sm font-medium text-gray-500">Email:</span>
                            <span class="col-span-2 text-sm text-gray-900">{{ $user->email }}</span>
                        </div>
                        <div class="grid grid-cols-3 items-center">
                            <span class="col-span-1 text-sm font-medium text-gray-500">Telepon:</span>
                            <span class="col-span-2 text-sm text-gray-900">{{ $user->phone ?? 'Tidak ada' }}</span>
                        </div>
                        <div class="grid grid-cols-3 items-center">
                            <span class="col-span-1 text-sm font-medium text-gray-500">Alamat:</span>
                            <span class="col-span-2 text-sm text-gray-900">{{ $user->address ?? 'Tidak ada' }}</span>
                        </div>
                        <div class="grid grid-cols-3 items-center">
                            <span class="col-span-1 text-sm font-medium text-gray-500">Identitas:</span>
                            <span class="col-span-2 text-sm text-gray-900">
                                @if($user->id_number && $user->id_type)
                                    {{ $user->id_type }}: {{ $user->id_number }}
                                @else
                                    Tidak ada
                                @endif
                            </span>
                        </div>
                        <div class="grid grid-cols-3 items-center">
                            <span class="col-span-1 text-sm font-medium text-gray-500">Tanggal Lahir:</span>
                            <span class="col-span-2 text-sm text-gray-900">{{ $user->date_of_birthday ? $user->date_of_birthday->format('d M Y') : 'Tidak ada' }}</span>
                        </div>
                        <div class="grid grid-cols-3 items-center">
                            <span class="col-span-1 text-sm font-medium text-gray-500">Jenis Kelamin:</span>
                            <span class="col-span-2 text-sm text-gray-900">
                                @if($user->gender == 'MALE')
                                    Laki-laki
                                @elseif($user->gender == 'FEMALE')
                                    Perempuan
                                @else
                                    Tidak ada
                                @endif
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Stats Card -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <h2 class="text-lg font-semibold text-blue-600">Statistik Pengguna</h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500 p-4">
                            <div class="flex items-center">
                                <div class="flex-1">
                                    <div class="text-xs font-bold text-blue-600 uppercase mb-1">Total Booking</div>
                                    <div class="text-xl font-bold text-gray-800">{{ $user->bookings->count() }}</div>
                                </div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500 p-4">
                            <div class="flex items-center">
                                <div class="flex-1">
                                    <div class="text-xs font-bold text-green-600 uppercase mb-1">Booking Aktif</div>
                                    <div class="text-xl font-bold text-gray-800">
                                        {{ $user->bookings->whereIn('status', ['PENDING', 'CONFIRMED'])->count() }}
                                    </div>
                                </div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-indigo-500 p-4">
                            <div class="flex items-center">
                                <div class="flex-1">
                                    <div class="text-xs font-bold text-indigo-600 uppercase mb-1">Booking Selesai</div>
                                    <div class="text-xl font-bold text-gray-800">
                                        {{ $user->bookings->where('status', 'COMPLETED')->count() }}
                                    </div>
                                </div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-red-500 p-4">
                            <div class="flex items-center">
                                <div class="flex-1">
                                    <div class="text-xs font-bold text-red-600 uppercase mb-1">Booking Dibatalkan</div>
                                    <div class="text-xl font-bold text-gray-800">
                                        {{ $user->bookings->where('status', 'CANCELLED')->count() }}
                                    </div>
                                </div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2">
            <!-- User Bookings -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <h2 class="text-lg font-semibold text-blue-600">Riwayat Booking</h2>
                </div>
                <div class="p-6">
                    @if($user->bookings->isEmpty())
                        <div class="flex flex-col items-center justify-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <p class="text-gray-500">Pengguna ini belum memiliki booking</p>
                        </div>
                    @else
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Booking</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach($user->bookings as $booking)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ $booking->booking_code }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $booking->passenger_count }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                @if($booking->status == 'PENDING')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                                @elseif($booking->status == 'CONFIRMED')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Konfirmasi</span>
                                                @elseif($booking->status == 'CANCELLED')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Dibatalkan</span>
                                                @elseif($booking->status == 'COMPLETED')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Selesai</span>
                                                @elseif($booking->status == 'REFUNDED')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Dikembalikan</span>
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <a href="{{ route('admin.bookings.show', $booking->id) }}" class="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md shadow-sm transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Detail
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </div>

            <!-- User Vehicles -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <h2 class="text-lg font-semibold text-blue-600">Kendaraan Terdaftar</h2>
                </div>
                <div class="p-6">
                    @if($user->vehicles->isEmpty())
                        <div class="flex flex-col items-center justify-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p class="text-gray-500">Pengguna ini belum mendaftarkan kendaraan</p>
                        </div>
                    @else
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merk</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach($user->vehicles->unique('license_plate') as $vehicle)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                @if($vehicle->type == 'MOTORCYCLE')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Motor</span>
                                                @elseif($vehicle->type == 'CAR')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Mobil</span>
                                                @elseif($vehicle->type == 'BUS')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Bus</span>
                                                @elseif($vehicle->type == 'TRUCK')
                                                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Truk</span>
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ $vehicle->license_plate }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $vehicle->brand ?? 'N/A' }}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $vehicle->model ?? 'N/A' }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
