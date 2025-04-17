@extends('layouts.app')

@section('content')
<div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Jadwal Kapal</h1>
            <p class="text-gray-600 mt-1">Daftar jadwal kapal yang tersedia untuk booking</p>
        </div>

        @if(session('success'))
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p class="font-medium">Sukses!</p>
            <p>{{ session('success') }}</p>
        </div>
        @endif

        @if(session('error'))
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p class="font-medium">Error!</p>
            <p>{{ session('error') }}</p>
        </div>
        @endif

        <!-- Filter Jadwal -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <form action="{{ route('operator.schedules.index') }}" method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                    <select id="route_id" name="route_id" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option value="">Semua Rute</option>
                        @foreach(\App\Models\Route::where('status', 'active')->orderBy('origin')->orderBy('destination')->get() as $route)
                            <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                            </option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="date" id="date" name="date" value="{{ request('date') }}" min="{{ date('Y-m-d') }}" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                </div>

                <div class="flex items-end">
                    <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <i class="fas fa-search mr-2"></i> Filter
                    </button>
                    <a href="{{ route('operator.schedules.index') }}" class="ml-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <i class="fas fa-redo mr-2"></i> Reset
                    </a>
                </div>
            </form>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @forelse($schedules as $schedule)
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div class="bg-blue-500 text-white p-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</h3>
                        <span class="text-sm bg-white text-blue-800 px-2 py-1 rounded-full">{{ $schedule->route->route_code }}</span>
                    </div>
                </div>

                <div class="p-4">
                    <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div class="text-center">
                            <div class="text-xs text-gray-500">Keberangkatan</div>
                            <div class="text-xl font-bold text-gray-800">{{ $schedule->departure_time->format('H:i') }}</div>
                        </div>

                        <div class="flex-1 flex justify-center">
                            <div class="relative w-full px-4">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="h-1 w-full bg-blue-100"></div>
                                </div>
                                <div class="relative flex justify-between">
                                    <div class="h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                    <div class="h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="bg-white px-2 text-xs text-gray-500">{{ $schedule->route->duration }} jam</span>
                                </div>
                            </div>
                        </div>

                        <div class="text-center">
                            <div class="text-xs text-gray-500">Kedatangan</div>
                            <div class="text-xl font-bold text-gray-800">{{ $schedule->arrival_time->format('H:i') }}</div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex items-center text-sm">
                            <i class="fas fa-ship text-blue-500 mr-2"></i>
                            <span class="font-medium">{{ $schedule->ferry->name }}</span>
                        </div>
                        <div class="flex items-center text-sm mt-2">
                            <i class="fas fa-users text-blue-500 mr-2"></i>
                            <span>Kapasitas: {{ $schedule->ferry->passenger_capacity }} Penumpang</span>
                        </div>
                        <div class="flex items-center text-sm mt-2">
                            <i class="fas fa-calendar-week text-blue-500 mr-2"></i>
                            <span>Hari:
                                @php
                                    $days = explode(',', $schedule->days);
                                    $dayNames = [
                                        '0' => 'Minggu',
                                        '1' => 'Senin',
                                        '2' => 'Selasa',
                                        '3' => 'Rabu',
                                        '4' => 'Kamis',
                                        '5' => 'Jumat',
                                        '6' => 'Sabtu',
                                    ];
                                    $dayLabels = [];
                                    foreach ($days as $day) {
                                        $dayLabels[] = $dayNames[$day] ?? $day;
                                    }
                                    echo implode(', ', $dayLabels);
                                @endphp
                            </span>
                        </div>
                        <div class="flex items-center text-sm mt-2">
                            <i class="fas fa-ticket-alt text-blue-500 mr-2"></i>
                            <span>Harga Dasar: Rp {{ number_format($schedule->route->base_price, 0, ',', '.') }}</span>
                        </div>
                    </div>

                    <div class="flex justify-between mt-6">
                        <a href="{{ route('operator.schedules.show', $schedule->id) }}" class="text-blue-600 hover:text-blue-800 flex items-center">
                            <i class="fas fa-eye mr-1"></i> Detail
                        </a>
                        <a href="{{ route('operator.schedules.dates', $schedule->id) }}" class="text-green-600 hover:text-green-800 flex items-center">
                            <i class="fas fa-calendar-day mr-1"></i> Tanggal
                        </a>
                    </div>
                </div>
            </div>
            @empty
            <div class="col-span-full py-8 text-center">
                <div class="text-gray-400 mb-2">
                    <i class="fas fa-calendar-times text-5xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900">Tidak ada jadwal tersedia</h3>
                <p class="mt-1 text-sm text-gray-500">
                    Tidak ada jadwal yang tersedia saat ini. Coba ubah filter pencarian Anda.
                </p>
            </div>
            @endforelse
        </div>
    </div>
</div>
@endsection
