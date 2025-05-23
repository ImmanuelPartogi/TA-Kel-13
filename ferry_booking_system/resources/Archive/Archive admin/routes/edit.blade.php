@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Edit Rute</h1>
        <a href="{{ route('admin.routes.index') }}" class="mt-3 md:mt-0 flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
        </a>
    </div>

    @if($errors->any())
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <div class="font-bold">Terjadi kesalahan:</div>
            <ul class="list-disc ml-6">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button class="absolute top-2 right-2 text-red-700" onclick="this.parentElement.remove()">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    @endif

    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-blue-600">Form Edit Rute</h2>
        </div>
        <div class="p-6">
            <form action="{{ route('admin.routes.update', $route->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label for="route_code" class="block text-sm font-medium text-gray-700 mb-1">Kode Rute <span class="text-red-500">*</span></label>
                        <input type="text" id="route_code" name="route_code" value="{{ old('route_code', $route->route_code) }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <p class="mt-1 text-xs text-gray-500">Contoh: JKT-SBY001, BDG-SMG002</p>
                    </div>
                    <div>
                        <label for="origin" class="block text-sm font-medium text-gray-700 mb-1">Asal <span class="text-red-500">*</span></label>
                        <input type="text" id="origin" name="origin" value="{{ old('origin', $route->origin) }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="destination" class="block text-sm font-medium text-gray-700 mb-1">Tujuan <span class="text-red-500">*</span></label>
                        <input type="text" id="destination" name="destination" value="{{ old('destination', $route->destination) }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label for="distance" class="block text-sm font-medium text-gray-700 mb-1">Jarak (km)</label>
                        <input type="number" id="distance" name="distance" value="{{ old('distance', $route->distance) }}" step="0.01" min="0"
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">Durasi (menit) <span class="text-red-500">*</span></label>
                        <input type="number" id="duration" name="duration" value="{{ old('duration', $route->duration) }}" min="1" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-700 mt-8 mb-4">Harga Tiket</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label for="base_price" class="block text-sm font-medium text-gray-700 mb-1">Harga Dasar <span class="text-red-500">*</span></label>
                        <input type="number" id="base_price" name="base_price" value="{{ old('base_price', $route->base_price) }}" step="0.01" min="0" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="motorcycle_price" class="block text-sm font-medium text-gray-700 mb-1">Harga Motor <span class="text-red-500">*</span></label>
                        <input type="number" id="motorcycle_price" name="motorcycle_price" value="{{ old('motorcycle_price', $route->motorcycle_price) }}" step="0.01" min="0" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="car_price" class="block text-sm font-medium text-gray-700 mb-1">Harga Mobil <span class="text-red-500">*</span></label>
                        <input type="number" id="car_price" name="car_price" value="{{ old('car_price', $route->car_price) }}" step="0.01" min="0" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="bus_price" class="block text-sm font-medium text-gray-700 mb-1">Harga Bus <span class="text-red-500">*</span></label>
                        <input type="number" id="bus_price" name="bus_price" value="{{ old('bus_price', $route->bus_price) }}" step="0.01" min="0" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="truck_price" class="block text-sm font-medium text-gray-700 mb-1">Harga Truk <span class="text-red-500">*</span></label>
                        <input type="number" id="truck_price" name="truck_price" value="{{ old('truck_price', $route->truck_price) }}" step="0.01" min="0" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-700 mt-8 mb-4">Status Rute</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status <span class="text-red-500">*</span></label>
                        <select id="status" name="status" required
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="ACTIVE" {{ old('status', $route->status) == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="INACTIVE" {{ old('status', $route->status) == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                            <option value="WEATHER_ISSUE" {{ old('status', $route->status) == 'WEATHER_ISSUE' ? 'selected' : '' }}>Masalah Cuaca</option>
                        </select>
                    </div>
                </div>

                <div id="reasonContainer" class="mt-4 {{ old('status', $route->status) == 'ACTIVE' ? 'hidden' : '' }}">
                    <label for="status_reason" class="block text-sm font-medium text-gray-700 mb-1">Alasan Perubahan Status</label>
                    <textarea id="status_reason" name="status_reason" rows="2"
                              class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">{{ old('status_reason', $route->status_reason) }}</textarea>
                </div>

                <div id="expiryDateContainer" class="mt-4 {{ old('status', $route->status) == 'WEATHER_ISSUE' ? '' : 'hidden' }}">
                    <label for="status_expiry_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir Status</label>
                    <input type="date" id="status_expiry_date" name="status_expiry_date"
                           value="{{ old('status_expiry_date', $route->status_expiry_date ? $route->status_expiry_date->format('Y-m-d') : '') }}"
                           class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="mt-1 text-xs text-gray-500">Biarkan kosong jika tidak ada tanggal berakhir yang ditentukan.</p>
                </div>

                <div class="mt-8">
                    <button type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const statusSelect = document.getElementById('status');
        const reasonContainer = document.getElementById('reasonContainer');
        const expiryDateContainer = document.getElementById('expiryDateContainer');

        function updateContainers() {
            if (statusSelect.value === 'ACTIVE') {
                reasonContainer.classList.add('hidden');
                expiryDateContainer.classList.add('hidden');
            } else {
                reasonContainer.classList.remove('hidden');

                if (statusSelect.value === 'WEATHER_ISSUE') {
                    expiryDateContainer.classList.remove('hidden');
                } else {
                    expiryDateContainer.classList.add('hidden');
                }
            }
        }

        // Initial check
        updateContainers();

        // Add event listener
        statusSelect.addEventListener('change', updateContainers);
    });
</script>
@endsection
