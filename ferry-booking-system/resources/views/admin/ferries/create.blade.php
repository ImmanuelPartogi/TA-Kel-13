@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Tambah Kapal Baru</h1>
        <a href="{{ route('admin.ferries.index') }}" class="mt-3 md:mt-0 flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
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
            <h2 class="text-lg font-semibold text-blue-600">Form Kapal</h2>
        </div>
        <div class="p-6">
            <form action="{{ route('admin.ferries.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Kolom Kiri -->
                    <div class="space-y-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nama Kapal <span class="text-red-500">*</span></label>
                            <input type="text" id="name" name="name" value="{{ old('name') }}" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="registration_number" class="block text-sm font-medium text-gray-700 mb-1">Nomor Registrasi <span class="text-red-500">*</span></label>
                            <input type="text" id="registration_number" name="registration_number" value="{{ old('registration_number') }}" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="year_built" class="block text-sm font-medium text-gray-700 mb-1">Tahun Pembuatan</label>
                            <input type="number" id="year_built" name="year_built" value="{{ old('year_built') }}" min="1900" max="{{ date('Y') }}"
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="last_maintenance_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Perawatan Terakhir</label>
                            <input type="date" id="last_maintenance_date" name="last_maintenance_date" value="{{ old('last_maintenance_date') }}"
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status <span class="text-red-500">*</span></label>
                            <select id="status" name="status" required
                                    class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="ACTIVE" {{ old('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                                <option value="MAINTENANCE" {{ old('status') == 'MAINTENANCE' ? 'selected' : '' }}>Perawatan</option>
                                <option value="INACTIVE" {{ old('status') == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                            </select>
                        </div>
                    </div>

                    <!-- Kolom Kanan -->
                    <div class="space-y-6">
                        <div>
                            <label for="capacity_passenger" class="block text-sm font-medium text-gray-700 mb-1">Kapasitas Penumpang <span class="text-red-500">*</span></label>
                            <input type="number" id="capacity_passenger" name="capacity_passenger" value="{{ old('capacity_passenger', 0) }}" min="1" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="capacity_vehicle_motorcycle" class="block text-sm font-medium text-gray-700 mb-1">Kapasitas Motor <span class="text-red-500">*</span></label>
                            <input type="number" id="capacity_vehicle_motorcycle" name="capacity_vehicle_motorcycle" value="{{ old('capacity_vehicle_motorcycle', 0) }}" min="0" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="capacity_vehicle_car" class="block text-sm font-medium text-gray-700 mb-1">Kapasitas Mobil <span class="text-red-500">*</span></label>
                            <input type="number" id="capacity_vehicle_car" name="capacity_vehicle_car" value="{{ old('capacity_vehicle_car', 0) }}" min="0" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="capacity_vehicle_bus" class="block text-sm font-medium text-gray-700 mb-1">Kapasitas Bus <span class="text-red-500">*</span></label>
                            <input type="number" id="capacity_vehicle_bus" name="capacity_vehicle_bus" value="{{ old('capacity_vehicle_bus', 0) }}" min="0" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <div>
                            <label for="capacity_vehicle_truck" class="block text-sm font-medium text-gray-700 mb-1">Kapasitas Truk <span class="text-red-500">*</span></label>
                            <input type="number" id="capacity_vehicle_truck" name="capacity_vehicle_truck" value="{{ old('capacity_vehicle_truck', 0) }}" min="0" required
                                   class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>

                <div class="mt-6">
                    <label for="image" class="block text-sm font-medium text-gray-700 mb-1">Foto Kapal</label>
                    <input type="file" id="image" name="image" accept="image/*"
                           class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100">
                    <p class="mt-1 text-xs text-gray-500">Unggah foto kapal (opsional). Ukuran maksimum 2MB. Format: JPG, PNG.</p>
                </div>

                <div class="mt-6">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea id="description" name="description" rows="4"
                              class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">{{ old('description') }}</textarea>
                </div>

                <div class="mt-8">
                    <button type="submit" class="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                        Simpan Kapal
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
