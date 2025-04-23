@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Detail Rute</h1>
        <div class="mt-3 md:mt-0 flex space-x-2">
            <a href="{{ route('admin.routes.edit', $route->id) }}" class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
            </a>
            <a href="{{ route('admin.routes.index') }}" class="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-md" role="alert">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm">{{ session('success') }}</p>
                </div>
                <button class="ml-auto -mx-1.5 -my-1.5 rounded-full p-1.5 text-green-500 hover:bg-green-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    @endif

    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-blue-600">Informasi Rute</h2>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Kode Rute</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">{{ $route->route_code }}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Status</h3>
                    <div class="mt-1">
                        @if($route->status == 'ACTIVE')
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Aktif
                            </span>
                        @elseif($route->status == 'INACTIVE')
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                Tidak Aktif
                            </span>
                        @elseif($route->status == 'WEATHER_ISSUE')
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                Masalah Cuaca
                            </span>
                        @endif
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Asal</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">{{ $route->origin }}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Tujuan</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">{{ $route->destination }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Jarak</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">{{ $route->distance ?? '-' }} km</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Durasi</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">{{ $route->duration }} menit</p>
                </div>
            </div>

            @if($route->status != 'ACTIVE')
                <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 class="text-sm font-medium text-gray-500">Alasan Status</h3>
                    <p class="mt-1 text-gray-900">{{ $route->status_reason ?? 'Tidak ada alasan yang diberikan' }}</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <h3 class="text-sm font-medium text-gray-500">Diperbarui Pada</h3>
                            <p class="mt-1 text-gray-900">{{ $route->status_updated_at ? $route->status_updated_at->format('d/m/Y H:i') : '-' }}</p>
                        </div>

                        @if($route->status == 'WEATHER_ISSUE' && $route->status_expiry_date)
                            <div>
                                <h3 class="text-sm font-medium text-gray-500">Berlaku Hingga</h3>
                                <p class="mt-1 text-gray-900">{{ $route->status_expiry_date->format('d/m/Y') }}</p>
                            </div>
                        @endif
                    </div>
                </div>
            @endif
        </div>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-blue-600">Harga Tiket</h2>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Harga Dasar</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">Rp {{ number_format($route->base_price, 0, ',', '.') }}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Harga Motor</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">Rp {{ number_format($route->motorcycle_price, 0, ',', '.') }}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Harga Mobil</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">Rp {{ number_format($route->car_price, 0, ',', '.') }}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Harga Bus</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">Rp {{ number_format($route->bus_price, 0, ',', '.') }}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Harga Truk</h3>
                    <p class="mt-1 text-lg font-semibold text-gray-900">Rp {{ number_format($route->truck_price, 0, ',', '.') }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="flex justify-between items-center mt-8">
        <form action="{{ route('admin.routes.destroy', $route->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus rute ini?');">
            @csrf
            @method('DELETE')
            <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Rute
            </button>
        </form>
    </div>
</div>
@endsection
