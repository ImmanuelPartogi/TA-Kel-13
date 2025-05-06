@extends('layouts.app')

@section('title', 'Detail Operator')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header dengan gradient background -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-white bg-opacity-30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">Detail Operator</h1>
                    <p class="text-blue-100 mt-1">ID: {{ $operator->id }} | Terdaftar: {{ $operator->created_at->format('d M Y') }}</p>
                </div>
            </div>
            <div class="mt-4 md:mt-0 flex space-x-3">
                <a href="{{ route('admin.operators.edit', $operator->id) }}"
                   class="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                </a>
                <a href="{{ route('admin.operators.index') }}"
                   class="inline-flex items-center px-4 py-2 bg-blue-800 bg-opacity-50 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                </a>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Card Informasi Utama -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h2 class="text-lg font-semibold text-gray-800">Informasi Operator</h2>
                </div>

                <div class="divide-y divide-gray-100">
                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Nama Perusahaan</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">{{ $operator->company_name }}</div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Email</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">
                            <a href="mailto:{{ $operator->email }}" class="text-blue-600 hover:underline">{{ $operator->email }}</a>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Nomor Telepon</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">
                            <a href="tel:{{ $operator->phone_number }}" class="text-blue-600 hover:underline">{{ $operator->phone_number }}</a>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Nomor Lisensi</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">{{ $operator->license_number }}</div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Jumlah Armada</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {{ $operator->fleet_size }} Unit
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Alamat Perusahaan</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">{{ $operator->company_address }}</div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Login Terakhir</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">
                            @if($operator->last_login)
                                <span class="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                                    {{ $operator->last_login->format('d/m/Y H:i') }}
                                </span>
                            @else
                                <span class="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                    Belum pernah login
                                </span>
                            @endif
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Tanggal Registrasi</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">{{ $operator->created_at->format('d/m/Y H:i') }}</div>
                    </div>

                    <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3 px-6 py-4 bg-gray-50 font-medium text-sm text-gray-600">Terakhir Diperbarui</div>
                        <div class="md:w-2/3 px-6 py-4 text-gray-800">{{ $operator->updated_at->format('d/m/Y H:i') }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card Rute yang Dikelola -->
        <div>
            <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg h-full">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h2 class="text-lg font-semibold text-gray-800">Rute yang Dikelola</h2>
                </div>

                <div class="p-6">
                    @if(is_array($operator->assigned_routes) && count($operator->assigned_routes) > 0)
                        <div class="space-y-3">
                            @foreach($routes as $route)
                                @if(in_array($route->id, $operator->assigned_routes))
                                    <div class="p-4 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors duration-150">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center">
                                                <span class="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </span>
                                                <div>
                                                    <h3 class="font-medium text-gray-900">{{ $route->origin }} - {{ $route->destination }}</h3>
                                                    @if(isset($route->description))
                                                        <p class="text-sm text-gray-500 mt-1">{{ $route->description }}</p>
                                                    @endif
                                                </div>
                                            </div>
                                            <span class="text-xs text-gray-500">ID: {{ $route->id }}</span>
                                        </div>
                                    </div>
                                @endif
                            @endforeach
                        </div>

                        <div class="mt-4 text-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Total: {{ count(array_filter($operator->assigned_routes, function($id) use ($routes) {
                                    return $routes->contains('id', $id);
                                })) }} Rute
                            </span>
                        </div>
                    @else
                        <div class="flex flex-col items-center justify-center h-32 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm text-gray-500">Operator ini belum memiliki rute yang dikelola</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Tombol Aksi Tambahan -->
    <div class="mt-8 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <button type="button" onclick="alert('Fitur ini akan datang segera!')" class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Informasi
        </button>

        <button type="button" onclick="alert('Fitur ini akan datang segera!')" class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Kirim Informasi via Email
        </button>
    </div>
</div>
@endsection

@section('scripts')
<script>
    // Script untuk handling animasi atau interaksi tambahan jika diperlukan
    document.addEventListener('DOMContentLoaded', function() {
        // Misalnya, animasi fade in untuk konten
        const content = document.querySelector('.container');
        if (content) {
            content.classList.add('animate-fadeIn');
        }
    });
</script>
@endsection

@section('styles')
<style>
    /* Tambahan style khusus jika diperlukan */
    .animate-fadeIn {
        animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
@endsection
