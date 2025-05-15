@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
            {{-- Header --}}
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">Jadwal Kapal</h1>
                <p class="text-gray-600">Daftar jadwal kapal yang tersedia untuk booking</p>
            </div>

            {{-- Success Message --}}
            @if(session('success'))
            <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p class="font-semibold">Sukses!</p>
                <p>{{ session('success') }}</p>
            </div>
            @endif

            {{-- Error Message --}}
            @if(session('error'))
            <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p class="font-semibold">Error!</p>
                <p>{{ session('error') }}</p>
            </div>
            @endif

            {{-- Filter Section --}}
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <form action="{{ route('operator.schedules.index') }}" method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {{-- Route Filter --}}
                    <div>
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                        <select id="route_id" name="route_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option value="">Semua Rute</option>
                            @foreach(\App\Models\Route::where('status', 'active')->orderBy('origin')->orderBy('destination')->get() as $route)
                                <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                                </option>
                            @endforeach
                        </select>
                    </div>

                    {{-- Date Filter --}}
                    <div>
                        <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input type="date" id="date" name="date" value="{{ request('date') }}" min="{{ date('Y-m-d') }}"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    </div>

                    {{-- Filter Buttons --}}
                    <div class="flex items-end space-x-2">
                        <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm
                                text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2
                                focus:ring-offset-2 focus:ring-blue-500">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                            </svg>
                            Filter
                        </button>
                        <a href="{{ route('operator.schedules.index') }}" class="inline-flex items-center px-4 py-2
                            border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700
                            bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                            </svg>
                            Reset
                        </a>
                    </div>
                </form>
            </div>

            {{-- Schedules Grid --}}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @forelse($schedules as $schedule)
                    <div class="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                        {{-- Schedule Header --}}
                        <div class="bg-blue-600 text-white p-4">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</h3>
                                <span class="text-sm bg-white text-blue-800 px-2 py-1 rounded-full">{{ $schedule->route->route_code }}</span>
                            </div>
                        </div>

                        {{-- Schedule Details --}}
                        <div class="p-4">
                            {{-- Time Details --}}
                            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                <div class="text-center">
                                    <div class="text-xs text-gray-500">Keberangkatan</div>
                                    <div class="text-xl font-bold text-gray-800">{{ $schedule->departure_time->format('H:i') }}</div>
                                </div>

                                <div class="flex-1 flex justify-center relative">
                                    <div class="absolute inset-0 flex items-center">
                                        <div class="h-1 w-full bg-blue-100"></div>
                                    </div>
                                    <div class="relative flex justify-between w-full">
                                        <div class="h-3 w-3 rounded-full bg-blue-600 border-2 border-white"></div>
                                        <div class="h-3 w-3 rounded-full bg-blue-600 border-2 border-white"></div>
                                    </div>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="bg-white px-2 text-xs text-gray-500">{{ $schedule->route->duration }} jam</span>
                                    </div>
                                </div>

                                <div class="text-center">
                                    <div class="text-xs text-gray-500">Kedatangan</div>
                                    <div class="text-xl font-bold text-gray-800">{{ $schedule->arrival_time->format('H:i') }}</div>
                                </div>
                            </div>

                            {{-- Additional Details --}}
                            <div class="space-y-2 mb-4">
                                <div class="flex items-center text-sm text-gray-700">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                    <span class="font-medium">{{ $schedule->ferry->name }}</span>
                                </div>
                                <div class="flex items-center text-sm text-gray-700">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    <span>Kapasitas: {{ $schedule->ferry->passenger_capacity }} Penumpang</span>
                                </div>
                                <div class="flex items-center text-sm text-gray-700">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1z" clip-rule="evenodd" />
                                    </svg>
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
                                <div class="flex items-center text-sm text-gray-700">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.267.287-.538.395-.815.552-1.396.366-2.962-.187-4.314a.639.639 0 00-.549-.364 61.837 61.837 0 00-2.718.002c-.177.005-.354.016-.531.025-.372.021-.75.058-1.124.08C2.618 3.02 2 3.579 2 4.273v4.462c0 .563.466 1.011 1.024 1.019.44.006.882.01 1.329.014.209.002.419.004.626.004.394 0 .791-.006 1.19-.015.436-.01.844-.037 1.237-.08.413-.045.815-.117 1.207-.207.38-.088.761-.2 1.131-.333a60.787 60.787 0 00-.498-1.042zM16 9.837a.638.638 0 00-.49-.588 60.517 60.517 0 00-2.63-.235c-.344-.02-.69-.042-1.034-.07-.805-.065-1.592-.196-2.365-.368a.638.638 0 00-.49.588v4.61c0 .341.311.596.648.536a63.82 63.82 0 002.654-.397c.345-.078.69-.155 1.034-.247.38-.1.758-.208 1.131-.333.208-.077.415-.16.621-.246V9.837z" />
                                    </svg>
                                    <span>Harga Dasar: Rp {{ number_format($schedule->route->base_price, 0, ',', '.') }}</span>
                                </div>
                            </div>

                            {{-- Action Buttons --}}
                            <div class="flex justify-between mt-6">
                                <a href="{{ route('operator.schedules.show', $schedule->id) }}"
                                   class="text-blue-600 hover:text-blue-800 flex items-center hover:underline">
                                    <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10" clip-rule="evenodd" />
                                    </svg>
                                    Detail
                                </a>
                                <a href="{{ route('operator.schedules.dates', $schedule->id) }}"
                                   class="text-green-600 hover:text-green-800 flex items-center hover:underline">
                                    <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                                    </svg>
                                    Tanggal
                                </a>
                            </div>
                        </div>
                    </div>
                @empty
                    {{-- Empty State --}}
                    <div class="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                        <div class="mb-4">
                            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Tidak ada jadwal tersedia</h3>
                        <p class="text-gray-600 mb-4">Tidak ada jadwal yang tersedia saat ini. Coba ubah filter pencarian Anda.</p>
                        <a href="{{ route('operator.schedules.index') }}" class="inline-flex items-center px-4 py-2
                            border border-transparent text-sm font-medium rounded-md shadow-sm
                            text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2
                            focus:ring-offset-2 focus:ring-blue-500">
                            Reset Filter
                        </a>
                    </div>
                @endforelse
            </div>

            {{-- Pagination
            @if($schedules->hasPages())
            <div class="mt-6">
                {{ $schedules->links('vendor.pagination.tailwind') }}
            </div>
            @endif --}}
        </div>
    </div>
</div>
@endsection
