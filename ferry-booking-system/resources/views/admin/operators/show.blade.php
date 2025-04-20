@extends('layouts.app')

@section('title', 'Detail Operator')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800 mb-2 md:mb-0">Detail Operator</h1>
        <div class="flex space-x-2">
            <a href="{{ route('admin.operators.edit', $operator->id) }}" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
            </a>
            <a href="{{ route('admin.operators.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-medium text-blue-600">Informasi Operator</h2>
                </div>
                <div class="p-6">
                    <table class="min-w-full divide-y divide-gray-200">
                        <tbody class="divide-y divide-gray-200">
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">ID</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->id }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perusahaan</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->company_name }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->email }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Telepon</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->phone_number }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Lisensi</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->license_number }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Armada</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->fleet_size }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat Perusahaan</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->company_address }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Terakhir</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->last_login ? $operator->last_login->format('d/m/Y H:i') : 'Belum pernah login' }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Registrasi</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->created_at->format('d/m/Y H:i') }}</td>
                            </tr>
                            <tr>
                                <th scope="row" class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Diperbarui</th>
                                <td class="px-6 py-3 text-sm text-gray-900">{{ $operator->updated_at->format('d/m/Y H:i') }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div>
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-medium text-blue-600">Rute yang Dikelola</h2>
                </div>
                <div class="p-6">
                    @if(is_array($operator->assigned_routes) && count($operator->assigned_routes) > 0)
                        <ul class="divide-y divide-gray-200">
                            @foreach($routes as $route)
                                @if(in_array($route->id, $operator->assigned_routes))
                                    <li class="py-4">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium text-gray-900">{{ $route->origin }} - {{ $route->destination }}</span>
                                            <span class="text-sm text-gray-500">{{ $route->description }}</span>
                                        </div>
                                    </li>
                                @endif
                            @endforeach
                        </ul>
                    @else
                        <div class="flex items-center justify-center h-32">
                            <p class="text-sm text-gray-500">Operator ini belum memiliki rute yang dikelola</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
