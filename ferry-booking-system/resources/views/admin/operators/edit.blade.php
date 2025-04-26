@extends('layouts.app')

@section('title', 'Edit Operator')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header dengan gradient background -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-white bg-opacity-30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">Edit Operator</h1>
                    <p class="text-blue-100 mt-1">{{ $operator->company_name }} (ID: {{ $operator->id }})</p>
                </div>
            </div>
            <div class="mt-4 md:mt-0">
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

    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 class="text-lg font-semibold text-gray-800">Data Operator</h2>
            <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Terakhir diperbarui: {{ $operator->updated_at->format('d/m/Y H:i') }}
            </span>
        </div>

        <div class="p-6">
            <form action="{{ route('admin.operators.update', $operator->id) }}" method="POST" id="operatorForm" class="space-y-8">
                @csrf
                @method('PUT')

                <!-- Informasi Dasar -->
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 class="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <span class="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">1</span>
                        Informasi Dasar
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="company_name" class="block text-sm font-medium text-gray-700 mb-1">
                                Nama Perusahaan <span class="text-red-600">*</span>
                            </label>
                            <input type="text"
                                   class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('company_name') border-red-500 @enderror"
                                   id="company_name" name="company_name" value="{{ old('company_name', $operator->company_name) }}" required>
                            @error('company_name')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                                Email <span class="text-red-600">*</span>
                            </label>
                            <input type="email"
                                   class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('email') border-red-500 @enderror"
                                   id="email" name="email" value="{{ old('email', $operator->email) }}" required>
                            @error('email')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Informasi Kontak & Administrasi -->
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 class="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <span class="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">2</span>
                        Informasi Kontak & Administrasi
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Telepon <span class="text-red-600">*</span>
                            </label>
                            <div class="relative">
                                <input type="text"
                                       class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('phone_number') border-red-500 @enderror"
                                       id="phone_number" name="phone_number" value="{{ old('phone_number', $operator->phone_number) }}" required>
                                @error('phone_number')
                                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                        <div>
                            <label for="license_number" class="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Lisensi <span class="text-red-600">*</span>
                            </label>
                            <input type="text"
                                   class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('license_number') border-red-500 @enderror"
                                   id="license_number" name="license_number" value="{{ old('license_number', $operator->license_number) }}" required>
                            @error('license_number')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="fleet_size" class="block text-sm font-medium text-gray-700 mb-1">
                                Jumlah Armada
                            </label>
                            <div class="relative">
                                <input type="number"
                                       class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('fleet_size') border-red-500 @enderror"
                                       id="fleet_size" name="fleet_size" value="{{ old('fleet_size', $operator->fleet_size) }}" min="0">
                                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">unit</span>
                                </div>
                            </div>
                            @error('fleet_size')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label for="company_address" class="block text-sm font-medium text-gray-700 mb-1">
                                Alamat Perusahaan <span class="text-red-600">*</span>
                            </label>
                            <textarea
                                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('company_address') border-red-500 @enderror"
                                id="company_address" name="company_address" rows="3" required>{{ old('company_address', $operator->company_address) }}</textarea>
                            @error('company_address')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Pengaturan Akun -->
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 class="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <span class="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">3</span>
                        Pengaturan Akun
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                                Password <small class="text-gray-500">(Biarkan kosong jika tidak ingin mengubah)</small>
                            </label>
                            <div class="relative">
                                <input type="password"
                                       class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 @error('password') border-red-500 @enderror"
                                       id="password" name="password">
                                <button type="button" id="togglePassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            @error('password')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="mt-1 text-xs text-gray-500">Minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol</p>
                        </div>
                        <div>
                            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
                                Konfirmasi Password
                            </label>
                            <div class="relative">
                                <input type="password"
                                       class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
                                       id="password_confirmation" name="password_confirmation">
                                <button type="button" id="toggleConfirmPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <p id="password-match" class="mt-1 text-sm hidden"></p>
                        </div>
                    </div>
                </div>

                <!-- Rute -->
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 class="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <span class="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 text-sm">4</span>
                        Rute yang Dikelola
                    </h3>

                    <div class="flex justify-between items-center mb-3">
                        <div class="relative flex-grow mr-3">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input type="text" id="route-search" placeholder="Cari rute..."
                                   class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150">
                        </div>
                        <div class="flex space-x-2">
                            <button type="button" id="selectAll"
                                    class="px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150">
                                Pilih Semua
                            </button>
                            <button type="button" id="clearAll"
                                    class="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150">
                                Hapus Semua
                            </button>
                        </div>
                    </div>

                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto" id="route-list">
                            @foreach($routes as $route)
                            <div class="flex items-center p-2 rounded-lg hover:bg-gray-50 route-item transition duration-150">
                                <div class="flex items-center h-5">
                                    <input type="checkbox"
                                           class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 route-checkbox transition duration-150"
                                           id="route_{{ $route->id }}" name="assigned_routes[]" value="{{ $route->id }}"
                                           {{ (is_array(old('assigned_routes', $operator->assigned_routes)) && in_array($route->id, old('assigned_routes', $operator->assigned_routes))) ? 'checked' : '' }}>
                                </div>
                                <label for="route_{{ $route->id }}" class="ml-2 block text-sm text-gray-900 route-label cursor-pointer">
                                    <span class="font-medium">{{ $route->origin }} - {{ $route->destination }}</span>
                                </label>
                            </div>
                            @endforeach
                        </div>
                    </div>

                    <p id="route-error" class="mt-2 text-sm text-red-600 hidden">Pilih minimal satu rute yang dikelola</p>

                    <div id="selected-count" class="mt-2 text-sm text-gray-500">
                        <span id="count">0</span> rute dipilih
                    </div>
                </div>

                <!-- Buttons -->
                <div class="flex justify-between">
                    <a href="{{ route('admin.operators.show', $operator->id) }}"
                       class="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Detail
                    </a>

                    <div class="flex space-x-3">
                        <a href="{{ route('admin.operators.index') }}"
                           class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150">
                            Batal
                        </a>
                        <button type="submit"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Perbarui
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Info tambahan di bagian bawah -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <h4 class="font-medium text-blue-700 mb-1 text-sm">Tanggal Pendaftaran</h4>
            <p class="text-gray-600">{{ $operator->created_at->format('d M Y, H:i') }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <h4 class="font-medium text-indigo-700 mb-1 text-sm">Login Terakhir</h4>
            <p class="text-gray-600">{{ $operator->last_login ? $operator->last_login->format('d M Y, H:i') : 'Belum pernah login' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <h4 class="font-medium text-green-700 mb-1 text-sm">Update Terakhir</h4>
            <p class="text-gray-600">{{ $operator->updated_at->format('d M Y, H:i') }}</p>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const passwordInput = document.getElementById('password');
        const passwordConfirmation = document.getElementById('password_confirmation');
        const passwordMatch = document.getElementById('password-match');
        const routeSearch = document.getElementById('route-search');
        const routeItems = document.querySelectorAll('.route-item');
        const routeCheckboxes = document.querySelectorAll('.route-checkbox');
        const routeError = document.getElementById('route-error');
        const selectAllButton = document.getElementById('selectAll');
        const clearAllButton = document.getElementById('clearAll');
        const selectedCount = document.getElementById('count');

        // Toggle password visibility
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('svg').classList.toggle('text-blue-500');
        });

        toggleConfirmPassword.addEventListener('click', function() {
            const type = passwordConfirmation.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordConfirmation.setAttribute('type', type);
            this.querySelector('svg').classList.toggle('text-blue-500');
        });

        // Password match check
        passwordInput.addEventListener('input', checkPasswordMatch);
        passwordConfirmation.addEventListener('input', checkPasswordMatch);

        function checkPasswordMatch() {
            if (passwordInput.value !== '' && passwordConfirmation.value !== '') {
                if (passwordInput.value === passwordConfirmation.value) {
                    passwordMatch.textContent = 'Password cocok';
                    passwordMatch.classList.remove('hidden', 'text-red-600');
                    passwordMatch.classList.add('text-green-600');
                } else {
                    passwordMatch.textContent = 'Password tidak cocok';
                    passwordMatch.classList.remove('hidden', 'text-green-600');
                    passwordMatch.classList.add('text-red-600');
                }
            } else {
                passwordMatch.classList.add('hidden');
            }
        }

        // Update selected routes count
        function updateSelectedCount() {
            const checkedCount = document.querySelectorAll('.route-checkbox:checked').length;
            selectedCount.textContent = checkedCount;

            if (checkedCount > 0) {
                routeError.classList.add('hidden');
            }
        }

        // Initialize count
        updateSelectedCount();

        // Add event listeners to checkboxes
        routeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedCount);
        });

        // Route search
        routeSearch.addEventListener('keyup', function() {
            const searchText = this.value.toLowerCase();

            routeItems.forEach(item => {
                const label = item.querySelector('.route-label').textContent.toLowerCase();
                if (label.includes(searchText)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });

        // Select All Routes
        selectAllButton.addEventListener('click', function() {
            document.querySelectorAll('.route-checkbox').forEach(checkbox => {
                checkbox.checked = true;
            });
            updateSelectedCount();
        });

        // Clear All Routes
        clearAllButton.addEventListener('click', function() {
            document.querySelectorAll('.route-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            updateSelectedCount();
        });

        // Form submission validation
        document.getElementById('operatorForm').addEventListener('submit', function(e) {
            let isValid = true;

            // Cek apakah minimal satu rute dipilih
            if (document.querySelectorAll('.route-checkbox:checked').length === 0) {
                routeError.classList.remove('hidden');
                isValid = false;
            }

            // Cek apakah password dan konfirmasi cocok jika ada password baru
            if (passwordInput.value !== '' && passwordInput.value !== passwordConfirmation.value) {
                passwordMatch.textContent = 'Password tidak cocok';
                passwordMatch.classList.remove('hidden', 'text-green-600');
                passwordMatch.classList.add('text-red-600');
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    });
</script>
@endsection
