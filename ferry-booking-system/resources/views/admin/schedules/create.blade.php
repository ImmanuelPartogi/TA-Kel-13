@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Tambah Jadwal Baru</h1>
        <a href="{{ route('admin.schedules.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 transition ease-in-out duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
        </a>
    </div>

    @if($errors->any())
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <div class="font-medium">Terjadi kesalahan:</div>
            <ul class="mt-1.5 ml-4 list-disc list-inside">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="float-right -mt-4 text-red-700" data-bs-dismiss="alert" aria-label="Close">
                <span class="text-2xl" aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-white">Form Jadwal</h2>
        </div>
        <div class="p-6">
            <form action="{{ route('admin.schedules.store') }}" method="POST">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">
                            Rute <span class="text-red-500">*</span>
                        </label>
                        <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="route_id" name="route_id" required>
                            <option value="">Pilih Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}" {{ old('route_id') == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label for="ferry_id" class="block text-sm font-medium text-gray-700 mb-1">
                            Kapal <span class="text-red-500">*</span>
                        </label>
                        <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="ferry_id" name="ferry_id" required>
                            <option value="">Pilih Kapal</option>
                            @foreach($ferries as $ferry)
                                <option value="{{ $ferry->id }}" {{ old('ferry_id') == $ferry->id ? 'selected' : '' }}>
                                    {{ $ferry->name }} ({{ $ferry->registration_number }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label for="departure_time" class="block text-sm font-medium text-gray-700 mb-1">
                            Waktu Keberangkatan <span class="text-red-500">*</span>
                        </label>
                        <input type="time" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="departure_time" name="departure_time" value="{{ old('departure_time') }}" required>
                    </div>
                    <div>
                        <label for="arrival_time" class="block text-sm font-medium text-gray-700 mb-1">
                            Waktu Kedatangan <span class="text-red-500">*</span>
                        </label>
                        <input type="time" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="arrival_time" name="arrival_time" value="{{ old('arrival_time') }}" required>
                    </div>
                </div>

                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Hari Operasi <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="1" id="day-1" {{ is_array(old('days')) && in_array('1', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-1">Senin</label>
                        </div>
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="2" id="day-2" {{ is_array(old('days')) && in_array('2', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-2">Selasa</label>
                        </div>
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="3" id="day-3" {{ is_array(old('days')) && in_array('3', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-3">Rabu</label>
                        </div>
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="4" id="day-4" {{ is_array(old('days')) && in_array('4', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-4">Kamis</label>
                        </div>
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="5" id="day-5" {{ is_array(old('days')) && in_array('5', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-5">Jumat</label>
                        </div>
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="6" id="day-6" {{ is_array(old('days')) && in_array('6', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-6">Sabtu</label>
                        </div>
                        <div class="flex items-center">
                            <input class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" name="days[]" value="7" id="day-7" {{ is_array(old('days')) && in_array('7', old('days')) ? 'checked' : '' }}>
                            <label class="ml-2 block text-sm text-gray-700" for="day-7">Minggu</label>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                            Status <span class="text-red-500">*</span>
                        </label>
                        <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="status" name="status" required>
                            <option value="ACTIVE" {{ old('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="CANCELLED" {{ old('status') == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                            <option value="DELAYED" {{ old('status') == 'DELAYED' ? 'selected' : '' }}>Ditunda</option>
                            <option value="FULL" {{ old('status') == 'FULL' ? 'selected' : '' }}>Penuh</option>
                        </select>
                    </div>
                    <div id="reasonContainer" class="hidden">
                        <label for="status_reason" class="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Status
                        </label>
                        <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="status_reason" name="status_reason" value="{{ old('status_reason') }}">
                    </div>
                </div>

                <div id="expiryDateContainer" class="mt-6 hidden">
                    <label for="status_expiry_date" class="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Berakhir Status
                    </label>
                    <input type="datetime-local" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="status_expiry_date" name="status_expiry_date" value="{{ old('status_expiry_date') }}">
                    <p class="mt-1 text-sm text-gray-500">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Ditunda (DELAYED).</p>
                </div>

                <div class="mt-8">
                    <button type="submit" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md text-white font-medium">
                        Simpan Jadwal
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

                if (statusSelect.value === 'DELAYED') {
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
