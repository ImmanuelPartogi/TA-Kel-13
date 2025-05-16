@extends('layouts.app')

@section('styles')
    <style>
        .route-hover {
            transition: all 0.3s ease;
        }

        .route-hover:hover {
            background-color: #f9fafb;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .action-button {
            transition: all 0.2s ease;
        }

        .action-button:hover {
            transform: scale(1.1);
        }

        .filter-container {
            background-image: radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 400px);
        }

        .badge-active {
            position: relative;
        }

        .badge-active::before {
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

        .page-header {
            background: linear-gradient(to right, #1e40af, #3b82f6);
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

        .modal-transition {
            transition: all 0.3s ease;
        }

        .search-input:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
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

        .price-info-btn {
            transition: all 0.2s ease;
        }

        .price-info-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
    </style>
@endsection

@section('content')
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header Section -->
        <div class="page-header p-6 text-white relative">
            <div class="absolute right-0 bottom-0 opacity-30 pointer-events-none">
                <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M30.5,-45.6C40.1,-42.3,49.1,-35.8,55.9,-26.5C62.8,-17.3,67.4,-5.4,64.2,4.5C61,14.3,50.1,22.2,40.7,28.4C31.3,34.6,23.5,39.2,14.9,43.3C6.2,47.4,-3.2,51,-13.3,50.1C-23.4,49.3,-34.2,44,-43.5,35.7C-52.8,27.4,-60.6,16.1,-61.5,4.5C-62.4,-7.2,-56.4,-19.1,-48.2,-28.2C-40,-37.4,-29.6,-43.7,-19.4,-46.5C-9.2,-49.3,0.8,-48.5,10.9,-46.9C20.9,-45.3,30.9,-42.8,40.9,-39.9C40.9,-39.9,30.5,-45.6,30.5,-45.6Z"
                        transform="translate(75 75)" fill="#FFFFFF" />
                </svg>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div>
                    <h1 class="text-2xl font-bold flex items-center">
                        <i class="fas fa-route mr-3 text-blue-200"></i> Manajemen Rute
                    </h1>
                    <p class="mt-1 text-blue-100">Kelola semua rute pelayaran dalam sistem</p>
                </div>
                <div>
                    <a href="{{ route('admin.routes.create') }}"
                        class="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
                        <i class="fas fa-plus mr-2"></i> Tambah Rute Baru
                    </a>
                </div>
            </div>
        </div>

        <div class="p-6">
            <!-- Alerts -->
            @if (session('success'))
                <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r shadow-sm"
                    role="alert">
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

            <!-- Filter and Search -->
            <div class="mb-6 filter-container p-5 rounded-lg border border-gray-200 shadow-sm">
                <form action="{{ route('admin.routes.index') }}" method="GET"
                    class="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                    <div class="flex-grow">
                        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Cari Rute</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-search text-gray-400"></i>
                            </div>
                            <input type="text" id="search" name="search" value="{{ request('search') }}"
                                placeholder="Cari asal atau tujuan..."
                                class="search-input pl-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition-all duration-200">
                        </div>
                    </div>

                    <div class="w-full md:w-48">
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status" name="status"
                            class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm">
                            <option value="">Semua Status</option>
                            <option value="ACTIVE" {{ request('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="INACTIVE" {{ request('status') == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif
                            </option>
                            <option value="WEATHER_ISSUE" {{ request('status') == 'WEATHER_ISSUE' ? 'selected' : '' }}>
                                Masalah Cuaca</option>
                        </select>
                    </div>

                    <div class="flex items-end gap-2">
                        <button type="submit"
                            class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg h-10 font-medium transition-colors shadow-sm">
                            <i class="fas fa-filter mr-1"></i> Filter
                        </button>

                        @if (request('search') || request('status'))
                            <a href="{{ route('admin.routes.index') }}"
                                class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-lg h-10 flex items-center transition-colors shadow-sm">
                                <i class="fas fa-times mr-1"></i> Reset
                            </a>
                        @endif
                    </div>
                </form>
            </div>

            <!-- Results Counter -->
            <div class="flex justify-between items-center mb-3">
                <p class="text-sm text-gray-600">
                    Menampilkan <span class="font-medium">{{ $routes->count() }}</span> dari
                    <span class="font-medium">{{ $routes->total() }}</span> rute
                </p>
            </div>

            <!-- Route Table -->
            <div class="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr class="bg-gray-50 table-header">
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asal</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tujuan</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jarak (KM)</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durasi</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Harga Dasar</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status</th>
                            <th scope="col"
                                class="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($routes as $index => $route)
                            <tr class="route-hover">
                                <td class="py-3 px-4 text-sm text-gray-500">{{ $routes->firstItem() + $index }}</td>
                                <td class="py-3 px-4 text-sm font-medium text-gray-900">
                                    <div class="flex items-center">
                                        <div
                                            class="bg-blue-100 text-blue-600 h-7 w-7 rounded-full flex items-center justify-center mr-2">
                                            <i class="fas fa-map-marker-alt"></i>
                                        </div>
                                        {{ $route->origin }}
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-sm font-medium text-gray-900">
                                    <div class="flex items-center">
                                        <div
                                            class="bg-indigo-100 text-indigo-600 h-7 w-7 rounded-full flex items-center justify-center mr-2">
                                            <i class="fas fa-map-marker-alt"></i>
                                        </div>
                                        {{ $route->destination }}
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-sm text-gray-700">
                                    <div class="flex items-center">
                                        <i class="fas fa-ruler text-gray-400 mr-2"></i>
                                        {{ $route->distance ?? '-' }}
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-sm text-gray-700">
                                    <div class="flex items-center">
                                        <i class="fas fa-clock text-gray-400 mr-2"></i>
                                        <span>{{ $route->duration }} menit</span>
                                        <span class="text-xs text-gray-500 ml-1">({{ floor($route->duration / 60) }}j
                                            {{ $route->duration % 60 }}m)</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-sm text-gray-700">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-tag text-gray-400 mr-2"></i>
                                            <span class="font-medium">Rp
                                                {{ number_format($route->base_price, 0, ',', '.') }}</span>
                                        </div>
                                        <button type="button"
                                            class="ml-2 price-info-btn px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none"
                                            onclick="showVehiclePrices('{{ $route->motorcycle_price }}', '{{ $route->car_price }}', '{{ $route->bus_price }}', '{{ $route->truck_price }}')">
                                            <i class="fas fa-info-circle"></i> Kendaraan
                                        </button>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-sm">
                                    @if ($route->status == 'ACTIVE')
                                        <span
                                            class="badge-active px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                            <i class="fas fa-check-circle ml-1 mr-1"></i> Aktif
                                        </span>
                                    @elseif($route->status == 'WEATHER_ISSUE')
                                        <span
                                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            <i class="fas fa-cloud-rain mr-1"></i> Masalah Cuaca
                                        </span>
                                    @else
                                        <span
                                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                            <i class="fas fa-ban mr-1"></i> Tidak Aktif
                                        </span>
                                    @endif
                                </td>
                                <td class="py-3 px-4 text-sm">
                                    <div class="flex items-center space-x-2">
                                        <a href="{{ route('admin.routes.show', $route->id) }}"
                                            class="action-button text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                                            title="Detail">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.routes.edit', $route->id) }}"
                                            class="action-button text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
                                            title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.routes.destroy', $route->id) }}" method="POST"
                                            class="inline delete-form">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit"
                                                class="action-button text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors delete-btn"
                                                title="Hapus"
                                                data-route-name="{{ $route->origin }} - {{ $route->destination }}">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="py-8 px-4 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <div class="rounded-full bg-gray-100 p-6 text-gray-300">
                                            <svg class="w-16 h-16" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                                </path>
                                            </svg>
                                        </div>
                                        <p class="text-lg font-medium text-gray-500 mt-4">Tidak ada data rute</p>
                                        <p class="text-sm text-gray-400 mb-4">Belum ada rute yang ditambahkan atau sesuai
                                            filter yang dipilih</p>
                                        <a href="{{ route('admin.routes.create') }}"
                                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">
                                            <i class="fas fa-plus mr-2"></i> Tambah Rute Baru
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="mt-4">
                {{ $routes->links() }}
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div id="deleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden modal-transition">
        <div class="flex items-center justify-center h-full w-full p-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md transform modal-transition scale-95 opacity-0"
                id="deleteModalContent">
                <div class="p-6">
                    <div class="text-center">
                        <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-1">Konfirmasi Hapus</h3>
                        <p class="text-gray-500">Apakah Anda yakin ingin menghapus rute:</p>
                        <p id="routeNameToDelete" class="font-semibold text-gray-800 mt-2 mb-4"></p>
                    </div>
                    <div class="mt-6 grid grid-cols-2 gap-3">
                        <button id="cancelDelete" type="button"
                            class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                            <i class="fas fa-times mr-2"></i> Batal
                        </button>
                        <button id="confirmDelete" type="button"
                            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                            <i class="fas fa-trash mr-2"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk menampilkan detail harga kendaraan -->
    <div id="vehiclePriceModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden modal-transition">
        <div class="flex items-center justify-center h-full w-full p-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md transform modal-transition scale-95 opacity-0"
                id="vehiclePriceModalContent">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i class="fas fa-tag text-blue-500 mr-2"></i>
                        Detail Harga Kendaraan
                    </h3>
                    <button id="closeVehiclePriceModalX" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
                                    <i class="fas fa-motorcycle text-sm"></i>
                                </div>
                                <span class="font-medium text-gray-700">Motor</span>
                            </div>
                            <span id="motorcyclePrice" class="font-semibold text-gray-800">Rp 0</span>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="p-2 bg-indigo-100 text-indigo-600 rounded-full mr-3">
                                    <i class="fas fa-car text-sm"></i>
                                </div>
                                <span class="font-medium text-gray-700">Mobil</span>
                            </div>
                            <span id="carPrice" class="font-semibold text-gray-800">Rp 0</span>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="p-2 bg-purple-100 text-purple-600 rounded-full mr-3">
                                    <i class="fas fa-bus text-sm"></i>
                                </div>
                                <span class="font-medium text-gray-700">Bus</span>
                            </div>
                            <span id="busPrice" class="font-semibold text-gray-800">Rp 0</span>
                        </div>

                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="p-2 bg-yellow-100 text-yellow-600 rounded-full mr-3">
                                    <i class="fas fa-truck text-sm"></i>
                                </div>
                                <span class="font-medium text-gray-700">Truck</span>
                            </div>
                            <span id="truckPrice" class="font-semibold text-gray-800">Rp 0</span>
                        </div>
                    </div>

                    <div class="mt-6 text-center">
                        <button id="closeVehiclePriceBtn" type="button"
                            class="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors">
                            <i class="fas fa-times mr-2"></i> Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Handle delete confirmation with animation
            const deleteBtns = document.querySelectorAll('.delete-btn');
            const deleteModal = document.getElementById('deleteModal');
            const deleteModalContent = document.getElementById('deleteModalContent');
            const confirmDelete = document.getElementById('confirmDelete');
            const cancelDelete = document.getElementById('cancelDelete');
            const routeNameToDelete = document.getElementById('routeNameToDelete');
            let formToSubmit = null;

            // Vehicle price modal elements
            const vehiclePriceModal = document.getElementById('vehiclePriceModal');
            const vehiclePriceModalContent = document.getElementById('vehiclePriceModalContent');
            const closeVehiclePriceBtn = document.getElementById('closeVehiclePriceBtn');
            const closeVehiclePriceModalX = document.getElementById('closeVehiclePriceModalX');

            function openModal(modal, modalContent) {
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modalContent.classList.add('scale-100', 'opacity-100');
                }, 10);
            }

            function closeModal(modal, modalContent) {
                modalContent.classList.remove('scale-100', 'opacity-100');
                modalContent.classList.add('scale-95', 'opacity-0');

                setTimeout(() => {
                    modal.style.opacity = '0';
                    setTimeout(() => {
                        modal.classList.add('hidden');
                    }, 300);
                }, 200);
            }

            // Delete modal functions
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    formToSubmit = this.closest('.delete-form');
                    const routeName = this.getAttribute('data-route-name');
                    routeNameToDelete.textContent = routeName;
                    openModal(deleteModal, deleteModalContent);
                });
            });

            confirmDelete.addEventListener('click', function() {
                if (formToSubmit) {
                    formToSubmit.submit();
                }
                closeModal(deleteModal, deleteModalContent);
            });

            cancelDelete.addEventListener('click', function() {
                closeModal(deleteModal, deleteModalContent);
            });

            // Close modal when clicking outside
            deleteModal.addEventListener('click', function(e) {
                if (e.target === deleteModal) {
                    closeModal(deleteModal, deleteModalContent);
                }
            });

            // Vehicle price modal functions
            closeVehiclePriceBtn.addEventListener('click', function() {
                closeModal(vehiclePriceModal, vehiclePriceModalContent);
            });

            closeVehiclePriceModalX.addEventListener('click', function() {
                closeModal(vehiclePriceModal, vehiclePriceModalContent);
            });

            vehiclePriceModal.addEventListener('click', function(e) {
                if (e.target === vehiclePriceModal) {
                    closeModal(vehiclePriceModal, vehiclePriceModalContent);
                }
            });

            // Filter form auto-submit on status change
            const statusSelect = document.getElementById('status');
            statusSelect.addEventListener('change', function() {
                this.form.submit();
            });

            // Expose showVehiclePrices function globally
            window.showVehiclePrices = function(motorcycle, car, bus, truck) {
                document.getElementById('motorcyclePrice').textContent = 'Rp ' + formatPrice(motorcycle);
                document.getElementById('carPrice').textContent = 'Rp ' + formatPrice(car);
                document.getElementById('busPrice').textContent = 'Rp ' + formatPrice(bus);
                document.getElementById('truckPrice').textContent = 'Rp ' + formatPrice(truck);
                openModal(vehiclePriceModal, vehiclePriceModalContent);
            };

            // Helper function to format price
            function formatPrice(price) {
                return new Intl.NumberFormat('id-ID').format(price);
            }
        });
    </script>
@endsection
