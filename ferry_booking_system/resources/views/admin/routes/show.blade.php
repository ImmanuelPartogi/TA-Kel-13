@extends('layouts.app')

@section('styles')
<style>
    .detail-card {
        transition: all 0.3s ease;
        border: 1px solid transparent;
    }
    .detail-card:hover {
        border-color: #bfdbfe;
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
    }
    .action-button {
        transition: all 0.2s ease;
    }
    .action-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .schedule-row {
        transition: all 0.2s ease;
    }
    .schedule-row:hover {
        background-color: #f9fafb;
    }
    .schedule-badge {
        position: relative;
    }
    .schedule-badge.active::before {
        content: '';
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #10b981;
        top: 50%;
        left: 5px;
        transform: translateY(-50%);
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
            box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
    }
    .price-label {
        position: relative;
        overflow: hidden;
    }
    .price-label::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(to right, #bfdbfe, transparent);
    }
    .header-gradient {
        background: linear-gradient(to right, #1e40af, #3b82f6);
    }
    .table-header th {
        position: relative;
        overflow: hidden;
    }
    .table-header th::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, #3b82f6, transparent);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
    }
    .table-header th:hover::after {
        transform: scaleX(1);
    }
    .modal-container {
        transition: all 0.3s ease;
    }
    .modal-content {
        transition: all 0.3s ease;
        transform: scale(0.95);
        opacity: 0;
    }
    .modal-container.open .modal-content {
        transform: scale(1);
        opacity: 1;
    }
    .route-icon {
        background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        height: 48px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        color: white;
        font-size: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
    }
    .vehicle-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 24px;
        width: 24px;
        border-radius: 9999px;
        margin-right: 0.5rem;
    }
</style>
@endsection

@section('content')
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="header-gradient p-6 text-white">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-bold flex items-center">
                        <i class="fas fa-route mr-3"></i> Detail Rute
                    </h1>
                    <p class="text-blue-100 mt-1">
                        <i class="fas fa-map-marker-alt mr-1"></i> {{ $route->origin }} <i class="fas fa-arrow-right mx-2"></i> {{ $route->destination }}
                    </p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <a href="{{ route('admin.routes.edit', $route->id) }}"
                        class="action-button bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center transition duration-200 shadow-sm">
                        <i class="fas fa-edit mr-2"></i> Edit
                    </a>
                    <a href="{{ route('admin.routes.index') }}"
                        class="action-button bg-white text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-lg transition duration-200 flex items-center shadow-sm">
                        <i class="fas fa-arrow-left mr-2"></i> Kembali
                    </a>
                </div>
            </div>
        </div>

        <div class="p-6">
            @if (session('success'))
                <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r shadow-sm" role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-check-circle text-green-500 mt-1"></i>
                        </div>
                        <div class="ml-3">
                            <p>{{ session('success') }}</p>
                        </div>
                    </div>
                </div>
            @endif

            @if (session('error'))
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r shadow-sm" role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-500 mt-1"></i>
                        </div>
                        <div class="ml-3">
                            <p>{{ session('error') }}</p>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Status Alert untuk rute dengan masalah cuaca atau non-aktif -->
            @if ($route->status != 'ACTIVE')
                <div class="mb-6 {{ $route->status == 'WEATHER_ISSUE' ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700' }} p-4 rounded-r shadow-sm"
                    role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            @if ($route->status == 'WEATHER_ISSUE')
                                <i class="fas fa-cloud-rain text-yellow-500 text-lg"></i>
                            @else
                                <i class="fas fa-ban text-red-500 text-lg"></i>
                            @endif
                        </div>
                        <div class="ml-3">
                            <p class="font-medium">
                                @if ($route->status == 'WEATHER_ISSUE')
                                    Rute ini saat ini memiliki masalah cuaca.
                                @else
                                    Rute ini saat ini tidak aktif.
                                @endif
                            </p>
                            <p class="text-sm mt-1">
                                @if ($route->status_reason)
                                    Alasan: {{ $route->status_reason }}
                                @endif
                            </p>

                            @if($route->status_updated_at || ($route->status == 'WEATHER_ISSUE' && $route->status_expiry_date))
                                <div class="mt-2 flex flex-wrap gap-x-8 text-sm">
                                    @if($route->status_updated_at)
                                        <div>
                                            <span class="font-medium">Diperbarui Pada:</span>
                                            {{ $route->status_updated_at->format('d/m/Y H:i') }}
                                        </div>
                                    @endif

                                    @if($route->status == 'WEATHER_ISSUE' && $route->status_expiry_date)
                                        <div>
                                            <span class="font-medium">Berlaku Hingga:</span>
                                            {{ $route->status_expiry_date->format('d/m/Y') }}
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            @endif

            <!-- Route Summary -->
            <div class="flex flex-col md:flex-row gap-6 mb-6">
                <div class="md:w-32 flex justify-center">
                    <div class="route-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-3 mb-2">
                        <h2 class="text-xl font-bold text-gray-800">{{ $route->origin }} - {{ $route->destination }}</h2>
                        <span class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {{ $route->route_code }}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6">
                        <div class="flex items-center">
                            <div class="vehicle-icon bg-blue-100 text-blue-600">
                                <i class="fas fa-ruler-combined"></i>
                            </div>
                            <span class="text-gray-700">{{ $route->distance ? $route->distance . ' KM' : 'Jarak tidak diatur' }}</span>
                        </div>
                        <div class="flex items-center">
                            <div class="vehicle-icon bg-green-100 text-green-600">
                                <i class="fas fa-clock"></i>
                            </div>
                            <span class="text-gray-700">{{ $route->duration }} menit ({{ floor($route->duration / 60) }}j {{ $route->duration % 60 }}m)</span>
                        </div>
                        <div class="flex items-center">
                            <div class="vehicle-icon bg-purple-100 text-purple-600">
                                <i class="fas fa-tag"></i>
                            </div>
                            <span class="font-medium text-gray-700">Rp {{ number_format($route->base_price, 0, ',', '.') }}</span>
                        </div>
                    </div>
                    <div class="mt-3">
                        @if ($route->status == 'ACTIVE')
                            <span class="schedule-badge active px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                <i class="fas fa-check-circle ml-1 mr-1"></i> Aktif
                            </span>
                        @elseif($route->status == 'WEATHER_ISSUE')
                            <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <i class="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                            </span>
                        @else
                            <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                <i class="fas fa-ban mr-1"></i> Tidak Aktif
                            </span>
                        @endif
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="detail-card bg-gray-50 p-5 rounded-lg shadow-sm">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <i class="fas fa-map-marked-alt mr-2 text-blue-500"></i> Informasi Rute
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Kode Rute:</div>
                            <div class="font-medium text-gray-800">{{ $route->route_code }}</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Pelabuhan Asal:</div>
                            <div class="font-medium text-gray-800 flex items-center">
                                <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                                {{ $route->origin }}
                            </div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Pelabuhan Tujuan:</div>
                            <div class="font-medium text-gray-800 flex items-center">
                                <i class="fas fa-map-marker-alt text-red-500 mr-2"></i>
                                {{ $route->destination }}
                            </div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Jarak:</div>
                            <div class="font-medium text-gray-800">{{ $route->distance ? $route->distance . ' KM' : '-' }}</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Durasi:</div>
                            <div class="font-medium text-gray-800">{{ $route->duration }} menit</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Status:</div>
                            <div>
                                @if ($route->status == 'ACTIVE')
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        <i class="fas fa-check-circle mr-1"></i> Aktif
                                    </span>
                                @elseif($route->status == 'WEATHER_ISSUE')
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        <i class="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                                    </span>
                                @else
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        <i class="fas fa-ban mr-1"></i> Tidak Aktif
                                    </span>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>

                <div class="detail-card bg-gray-50 p-5 rounded-lg shadow-sm">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <i class="fas fa-money-bill-wave mr-2 text-green-500"></i> Informasi Harga
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="text-gray-600">Harga Dasar:</div>
                            <div class="font-medium text-gray-800">Rp {{ number_format($route->base_price, 0, ',', '.') }}</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-motorcycle text-gray-400 mr-2"></i> Harga Motor:
                            </div>
                            <div class="font-medium text-gray-800">Rp {{ number_format($route->motorcycle_price, 0, ',', '.') }}</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-car text-gray-400 mr-2"></i> Harga Mobil:
                            </div>
                            <div class="font-medium text-gray-800">Rp {{ number_format($route->car_price, 0, ',', '.') }}</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-bus text-gray-400 mr-2"></i> Harga Bus:
                            </div>
                            <div class="font-medium text-gray-800">Rp {{ number_format($route->bus_price, 0, ',', '.') }}</div>
                        </div>
                        <div class="price-label"></div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-truck text-gray-400 mr-2"></i> Harga Truk:
                            </div>
                            <div class="font-medium text-gray-800">Rp {{ number_format($route->truck_price, 0, ',', '.') }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section untuk jadwal, jika ada -->
            @if(isset($schedules))
            <div class="mt-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold flex items-center">
                        <i class="fas fa-ship mr-2 text-blue-500"></i> Jadwal Keberangkatan
                    </h3>
                    <a href="{{ route('admin.schedules.create', ['route_id' => $route->id]) }}" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center text-sm shadow-sm">
                        <i class="fas fa-plus mr-2"></i> Tambah Jadwal Baru
                    </a>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50 table-header">
                                <tr>
                                    <th scope="col"
                                        class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kapal</th>
                                    <th scope="col"
                                        class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hari</th>
                                    <th scope="col"
                                        class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Waktu Keberangkatan</th>
                                    <th scope="col"
                                        class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Waktu Kedatangan</th>
                                    <th scope="col"
                                        class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status</th>
                                    <th scope="col"
                                        class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                @forelse($schedules as $schedule)
                                    <tr class="schedule-row">
                                        <td class="py-3 px-4 text-sm font-medium text-gray-900">
                                            <div class="flex items-center">
                                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600">
                                                    <i class="fas fa-ship"></i>
                                                </div>
                                                {{ $schedule->ferry->name }}
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 text-sm text-gray-700">
                                            @php
                                                $days = explode(',', $schedule->days);
                                                $dayNames = [
                                                    '1' => 'Sen',
                                                    '2' => 'Sel',
                                                    '3' => 'Rab',
                                                    '4' => 'Kam',
                                                    '5' => 'Jum',
                                                    '6' => 'Sab',
                                                    '7' => 'Min',
                                                ];
                                                $dayLabels = [];
                                                foreach ($days as $day) {
                                                    if (isset($dayNames[$day])) {
                                                        $dayLabels[] = '<span class="px-1 py-0.5 bg-blue-50 text-blue-700 rounded">' . $dayNames[$day] . '</span>';
                                                    }
                                                }
                                                echo implode(' ', $dayLabels);
                                            @endphp
                                        </td>
                                        <td class="py-3 px-4 text-sm font-medium text-gray-700">
                                            <div class="flex items-center">
                                                <i class="far fa-clock text-blue-500 mr-2"></i>
                                                {{ \Carbon\Carbon::parse($schedule->departure_time)->format('H:i') }}
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 text-sm font-medium text-gray-700">
                                            <div class="flex items-center">
                                                <i class="far fa-clock text-green-500 mr-2"></i>
                                                {{ \Carbon\Carbon::parse($schedule->arrival_time)->format('H:i') }}
                                            </div>
                                        </td>
                                        <td class="py-3 px-4 text-sm">
                                            @if ($schedule->status == 'ACTIVE')
                                                <span class="schedule-badge active px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                    <i class="fas fa-check-circle ml-1 mr-1"></i> Aktif
                                                </span>
                                            @elseif($schedule->status == 'DELAYED')
                                                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                    <i class="fas fa-clock mr-1"></i> Tertunda
                                                    @if ($route->status == 'WEATHER_ISSUE')
                                                        (Cuaca)
                                                    @endif
                                                </span>
                                            @elseif($schedule->status == 'FULL')
                                                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                    <i class="fas fa-users mr-1"></i> Penuh
                                                </span>
                                            @else
                                                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                                    <i class="fas fa-ban mr-1"></i> Dibatalkan
                                                    @if ($route->status == 'INACTIVE')
                                                        (Rute)
                                                    @endif
                                                </span>
                                            @endif
                                        </td>
                                        <td class="py-3 px-4 text-sm">
                                            <div class="flex items-center space-x-2">
                                                <a href="{{ route('admin.schedules.show', $schedule->id) }}"
                                                    class="action-button text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                                                    title="Detail">
                                                    <i class="fas fa-eye"></i>
                                                </a>
                                                <a href="{{ route('admin.schedules.edit', $schedule->id) }}"
                                                    class="action-button text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                                                    title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>

                                                @if ($schedule->status == 'DELAYED')
                                                    <button type="button"
                                                        class="reschedule-btn action-button text-purple-600 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 p-2 rounded-lg transition-colors"
                                                        data-id="{{ $schedule->id }}"
                                                        data-departure="{{ $schedule->departure_time->format('H:i') }}"
                                                        title="Reschedule">
                                                        <i class="fas fa-calendar-alt"></i>
                                                    </button>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="6" class="py-6 px-4 text-center text-gray-500">
                                            <div class="flex flex-col items-center justify-center py-8">
                                                <div class="text-gray-300 mb-4">
                                                    <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                                    </svg>
                                                </div>
                                                <p class="text-lg font-medium">Tidak ada jadwal keberangkatan</p>
                                                <p class="text-sm text-gray-400 mb-4">Belum ada jadwal yang ditambahkan untuk rute ini</p>
                                                <a href="{{ route('admin.schedules.create', ['route_id' => $route->id]) }}"
                                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                                                    <i class="fas fa-plus mr-2"></i> Tambah Jadwal Baru
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            @endif

            <!-- Delete Route Button -->
            <div class="mt-8 flex justify-end">
                <form action="{{ route('admin.routes.destroy', $route->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus rute ini?');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors">
                        <i class="fas fa-trash mr-2"></i> Hapus Rute
                    </button>
                </form>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Reschedule modal functionality, if present in the page
            const rescheduleModal = document.getElementById('rescheduleModal');
            if (rescheduleModal) {
                const rescheduleButtons = document.querySelectorAll('.reschedule-btn');
                const closeButton = document.getElementById('closeRescheduleModal');
                const cancelButton = document.getElementById('cancelRescheduleBtn');
                const rescheduleForm = document.getElementById('rescheduleForm');
                const scheduleIdField = document.getElementById('reschedule_schedule_id');
                const timeField = document.getElementById('reschedule_time');

                function openModal() {
                    rescheduleModal.classList.remove('hidden');
                    rescheduleModal.classList.add('modal-container');
                    setTimeout(() => {
                        rescheduleModal.classList.add('open');
                    }, 10);
                }

                function closeModal() {
                    rescheduleModal.classList.remove('open');
                    setTimeout(() => {
                        rescheduleModal.classList.add('hidden');
                        rescheduleModal.classList.remove('modal-container');
                    }, 300);
                }

                rescheduleButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const scheduleId = this.getAttribute('data-id');
                        const departureTime = this.getAttribute('data-departure');

                        scheduleIdField.value = scheduleId;
                        timeField.value = departureTime;

                        // Set the reschedule form action URL
                        rescheduleForm.action = `/admin/schedules/${scheduleId}/reschedule`;

                        // Set today as the minimum date for reschedule
                        const today = new Date();
                        const formattedDate = today.toISOString().split('T')[0];
                        document.getElementById('reschedule_date').min = formattedDate;
                        document.getElementById('reschedule_date').value = formattedDate;

                        openModal();
                    });
                });

                if (closeButton && cancelButton) {
                    [closeButton, cancelButton].forEach(button => {
                        button.addEventListener('click', closeModal);
                    });

                    // Close modal when clicking outside
                    rescheduleModal.addEventListener('click', function(e) {
                        if (e.target === rescheduleModal) {
                            closeModal();
                        }
                    });
                }
            }
        });
    </script>
@endsection
