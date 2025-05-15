@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Buat Booking Baru</h1>
            <p class="mt-1 text-gray-600">Buat reservasi tiket kapal ferry baru</p>
        </div>
        <div class="mt-4 md:mt-0">
            <a href="{{ route('admin.bookings.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm">
                <i class="fas fa-arrow-left mr-2 text-sm"></i> Kembali
            </a>
        </div>
    </div>

    <!-- Alert for Errors -->
    @if($errors->any())
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-circle text-red-500"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Ada beberapa kesalahan:</h3>
                    <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'" class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100">
                            <span class="sr-only">Dismiss</span>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-semibold text-xl text-gray-800">Form Booking</h2>
        </div>
        <div class="p-6">
            <form id="bookingForm" action="{{ route('admin.bookings.store') }}" method="POST" class="space-y-6">
                @csrf
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Left Column: Travel Information -->
                    <div class="space-y-6">
                        <div class="bg-blue-50 rounded-lg border border-blue-100 p-4">
                            <h3 class="text-lg font-semibold text-blue-800 mb-4">Informasi Perjalanan</h3>

                            <div class="space-y-4">
                                <div>
                                    <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">
                                        Rute <span class="text-red-500">*</span>
                                    </label>
                                    <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="route_id" name="route_id" required>
                                        <option value="">Pilih Rute</option>
                                        @foreach($routes as $route)
                                            <option value="{{ $route->id }}" {{ old('route_id') == $route->id ? 'selected' : '' }}>
                                                {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                                            </option>
                                        @endforeach
                                    </select>
                                </div>

                                <div>
                                    <label for="booking_date" class="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Keberangkatan <span class="text-red-500">*</span>
                                    </label>
                                    <input type="date" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="booking_date" name="booking_date" value="{{ old('booking_date') ?? date('Y-m-d') }}" required min="{{ date('Y-m-d') }}">
                                </div>

                                <div>
                                    <label for="schedule_id" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jadwal <span class="text-red-500">*</span>
                                    </label>
                                    <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="schedule_id" name="schedule_id" required disabled>
                                        <option value="">Pilih rute dan tanggal terlebih dahulu</option>
                                    </select>
                                    <div id="scheduleInfo" class="mt-2 text-sm"></div>
                                </div>

                                <div>
                                    <button type="button" id="checkScheduleBtn" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors">
                                        <i class="fas fa-search mr-2"></i> Cek Jadwal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Passenger Information -->
                    <div class="space-y-6">
                        <div class="bg-green-50 rounded-lg border border-green-100 p-4">
                            <h3 class="text-lg font-semibold text-green-800 mb-4">Informasi Penumpang Utama</h3>

                            <div class="space-y-4">
                                <div>
                                    <label for="user_search" class="block text-sm font-medium text-gray-700 mb-1">
                                        Cari Pengguna <span class="text-red-500">*</span>
                                    </label>
                                    <div class="flex">
                                        <input type="text" class="flex-grow rounded-l-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            id="user_search" placeholder="Masukkan nama, email, atau telepon">
                                        <button class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                            type="button" id="searchUserBtn">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                    <p class="mt-1 text-xs text-gray-500">Minimal 3 karakter</p>
                                </div>

                                <div id="searchResults" class="hidden mt-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Hasil Pencarian</label>
                                    <div class="list-group overflow-y-auto max-h-48 border rounded-md divide-y divide-gray-200" id="userList"></div>
                                </div>

                                <div id="selectedUser" class="hidden mt-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Pengguna Terpilih</label>
                                    <div class="bg-white rounded-md border border-gray-200 shadow-sm">
                                        <div class="p-3">
                                            <div class="flex justify-between items-center">
                                                <div>
                                                    <h6 class="font-medium text-gray-900" id="selectedUserName"></h6>
                                                    <p class="text-sm text-gray-500" id="selectedUserEmail"></p>
                                                    <p class="text-sm text-gray-500" id="selectedUserPhone"></p>
                                                </div>
                                                <button type="button" id="changeUserBtn" class="text-sm px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                    Ganti
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="hidden" id="user_id" name="user_id">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Details (initially hidden) -->
                <div id="bookingDetails" class="hidden space-y-6">
                    <div class="border-t border-gray-200 my-6"></div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Passengers & Vehicles -->
                        <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Penumpang & Kendaraan</h3>

                            <div class="space-y-4">
                                <div>
                                    <label for="passenger_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Penumpang <span class="text-red-500">*</span>
                                    </label>
                                    <div class="flex">
                                        <button class="inline-flex items-center justify-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-md hover:bg-gray-100"
                                            type="button" id="decreasePassenger">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <input type="number" class="flex-grow text-center border-gray-300"
                                            id="passenger_count" name="passenger_count" value="1" min="1" max="10" required>
                                        <button class="inline-flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                                            type="button" id="increasePassenger">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label for="vehicle_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Kendaraan
                                    </label>
                                    <div class="flex">
                                        <button class="inline-flex items-center justify-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 rounded-l-md hover:bg-gray-100"
                                            type="button" id="decreaseVehicle">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <input type="number" class="flex-grow text-center border-gray-300"
                                            id="vehicle_count" name="vehicle_count" value="0" min="0" max="5">
                                        <button class="inline-flex items-center justify-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                                            type="button" id="increaseVehicle">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Vehicle container will be populated dynamically -->
                                <div id="vehicleContainer" class="hidden space-y-4"></div>
                            </div>
                        </div>

                        <!-- Payment Information -->
                        <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Pembayaran</h3>

                            <div class="space-y-4">
                                <div>
                                    <label for="payment_method" class="block text-sm font-medium text-gray-700 mb-1">
                                        Metode Pembayaran <span class="text-red-500">*</span>
                                    </label>
                                    <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="payment_method" name="payment_method" required>
                                        <option value="">Pilih Metode Pembayaran</option>
                                        <option value="CASH" {{ old('payment_method') == 'CASH' ? 'selected' : '' }}>Tunai</option>
                                        <option value="BANK_TRANSFER" {{ old('payment_method') == 'BANK_TRANSFER' ? 'selected' : '' }}>Transfer Bank</option>
                                        <option value="VIRTUAL_ACCOUNT" {{ old('payment_method') == 'VIRTUAL_ACCOUNT' ? 'selected' : '' }}>Virtual Account</option>
                                        <option value="E_WALLET" {{ old('payment_method') == 'E_WALLET' ? 'selected' : '' }}>E-Wallet</option>
                                        <option value="CREDIT_CARD" {{ old('payment_method') == 'CREDIT_CARD' ? 'selected' : '' }}>Kartu Kredit</option>
                                    </select>
                                </div>

                                <div id="paymentChannelContainer" class="hidden">
                                    <label for="payment_channel" class="block text-sm font-medium text-gray-700 mb-1">
                                        Channel Pembayaran <span class="text-red-500">*</span>
                                    </label>
                                    <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="payment_channel" name="payment_channel" required>
                                        <option value="">Pilih Channel Pembayaran</option>
                                    </select>
                                </div>

                                <div>
                                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                                        Catatan
                                    </label>
                                    <textarea class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="notes" name="notes" rows="3">{{ old('notes') }}</textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 my-6"></div>

                    <!-- Passenger Data Section -->
                    <div id="passengerContainer" class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800">Data Penumpang</h3>

                        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden passenger-card" data-index="0">
                            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 class="font-medium text-gray-800">Penumpang 1 (Utama)</h4>
                            </div>
                            <div class="p-4">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label for="passengers[0][name]" class="block text-sm font-medium text-gray-700 mb-1">
                                            Nama <span class="text-red-500">*</span>
                                        </label>
                                        <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            id="passengers[0][name]" name="passengers[0][name]" required>
                                    </div>
                                    <div>
                                        <label for="passengers[0][id_number]" class="block text-sm font-medium text-gray-700 mb-1">
                                            Nomor Identitas <span class="text-red-500">*</span>
                                        </label>
                                        <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            id="passengers[0][id_number]" name="passengers[0][id_number]" required>
                                    </div>
                                    <div>
                                        <label for="passengers[0][id_type]" class="block text-sm font-medium text-gray-700 mb-1">
                                            Jenis Identitas <span class="text-red-500">*</span>
                                        </label>
                                        <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            id="passengers[0][id_type]" name="passengers[0][id_type]" required>
                                            <option value="KTP">KTP</option>
                                            <option value="SIM">SIM</option>
                                            <option value="PASPOR">Paspor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Summary Section -->
                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div class="px-4 py-3 bg-blue-50 border-b border-blue-100">
                            <h3 class="font-semibold text-blue-800">Ringkasan Booking</h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Rute:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900" id="summaryRoute">-</div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Tanggal:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900" id="summaryDate">-</div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Jadwal:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900" id="summarySchedule">-</div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Kapal:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900" id="summaryFerry">-</div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Penumpang:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900">
                                            <span id="summaryPassengers">1</span> orang
                                        </div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Kendaraan:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900" id="summaryVehicles">-</div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Pembayaran:</div>
                                        <div class="flex-1 text-sm font-medium text-gray-900" id="summaryPayment">-</div>
                                    </div>
                                    <div class="flex items-start">
                                        <div class="w-28 text-sm font-medium text-gray-500">Total:</div>
                                        <div class="flex-1 text-lg font-bold text-blue-600" id="summaryTotal">Rp 0</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="pt-4">
                        <button type="submit" class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg shadow-sm transition-colors">
                            <i class="fas fa-check-circle mr-2"></i> Buat Booking
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Variables
        const route_id = document.getElementById('route_id');
        const booking_date = document.getElementById('booking_date');
        const schedule_id = document.getElementById('schedule_id');
        const scheduleInfo = document.getElementById('scheduleInfo');
        const checkScheduleBtn = document.getElementById('checkScheduleBtn');
        const bookingDetails = document.getElementById('bookingDetails');

        const userSearch = document.getElementById('user_search');
        const searchUserBtn = document.getElementById('searchUserBtn');
        const searchResults = document.getElementById('searchResults');
        const userList = document.getElementById('userList');
        const selectedUser = document.getElementById('selectedUser');
        const selectedUserName = document.getElementById('selectedUserName');
        const selectedUserEmail = document.getElementById('selectedUserEmail');
        const selectedUserPhone = document.getElementById('selectedUserPhone');
        const user_id = document.getElementById('user_id');
        const changeUserBtn = document.getElementById('changeUserBtn');

        const passenger_count = document.getElementById('passenger_count');
        const decreasePassenger = document.getElementById('decreasePassenger');
        const increasePassenger = document.getElementById('increasePassenger');
        const vehicle_count = document.getElementById('vehicle_count');
        const decreaseVehicle = document.getElementById('decreaseVehicle');
        const increaseVehicle = document.getElementById('increaseVehicle');
        const vehicleContainer = document.getElementById('vehicleContainer');
        const passengerContainer = document.getElementById('passengerContainer');

        const payment_method = document.getElementById('payment_method');
        const payment_channel = document.getElementById('payment_channel');
        const paymentChannelContainer = document.getElementById('paymentChannelContainer');

        const summaryRoute = document.getElementById('summaryRoute');
        const summaryDate = document.getElementById('summaryDate');
        const summarySchedule = document.getElementById('summarySchedule');
        const summaryFerry = document.getElementById('summaryFerry');
        const summaryPassengers = document.getElementById('summaryPassengers');
        const summaryVehicles = document.getElementById('summaryVehicles');
        const summaryPayment = document.getElementById('summaryPayment');
        const summaryTotal = document.getElementById('summaryTotal');

        let scheduleData = [];
        let basePrice = 0;
        let motorcyclePrice = 0;
        let carPrice = 0;
        let busPrice = 0;
        let truckPrice = 0;

        // Check Schedule Button
        checkScheduleBtn.addEventListener('click', function() {
            if (!route_id.value) {
                alert('Silakan pilih rute terlebih dahulu');
                return;
            }
            if (!booking_date.value) {
                alert('Silakan pilih tanggal keberangkatan terlebih dahulu');
                return;
            }

            // Fetch schedules
            fetch(`/admin/bookings/get-schedules?route_id=${route_id.value}&date=${booking_date.value}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        scheduleData = data.data;

                        schedule_id.innerHTML = '<option value="">Pilih Jadwal</option>';

                        if (scheduleData.length === 0) {
                            scheduleInfo.innerHTML = '<div class="text-sm text-red-600"><i class="fas fa-exclamation-circle mr-1"></i> Tidak ada jadwal tersedia untuk tanggal yang dipilih</div>';
                        } else {
                            scheduleData.forEach(schedule => {
                                const option = document.createElement('option');
                                option.value = schedule.id;
                                option.textContent = `${schedule.departure_time} - ${schedule.arrival_time} (${schedule.ferry.name})`;
                                schedule_id.appendChild(option);
                            });

                            scheduleInfo.innerHTML = '<div class="text-sm text-green-600"><i class="fas fa-check-circle mr-1"></i> Jadwal tersedia, silakan pilih jadwal</div>';
                        }

                        schedule_id.disabled = scheduleData.length === 0;
                    } else {
                        alert('Gagal mendapatkan jadwal');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat mencari jadwal');
                });
        });

        // Schedule change event
        schedule_id.addEventListener('change', function() {
            updateBookingSummary();

            if (this.value && user_id.value) {
                bookingDetails.classList.remove('hidden');
            } else {
                bookingDetails.classList.add('hidden');
            }

            if (this.value) {
                const selectedSchedule = scheduleData.find(s => s.id == this.value);
                if (selectedSchedule) {
                    basePrice = selectedSchedule.route.base_price;
                    motorcyclePrice = selectedSchedule.route.motorcycle_price;
                    carPrice = selectedSchedule.route.car_price;
                    busPrice = selectedSchedule.route.bus_price;
                    truckPrice = selectedSchedule.route.truck_price;

                    scheduleInfo.innerHTML = `
                        <div class="mt-3 text-sm text-green-600 space-y-1">
                            <div><i class="fas fa-users mr-1"></i> Kapasitas Penumpang: <span class="font-medium">${selectedSchedule.available_passenger}</span> tersedia</div>
                            <div><i class="fas fa-motorcycle mr-1"></i> Kapasitas Motor: <span class="font-medium">${selectedSchedule.available_motorcycle}</span> tersedia</div>
                            <div><i class="fas fa-car mr-1"></i> Kapasitas Mobil: <span class="font-medium">${selectedSchedule.available_car}</span> tersedia</div>
                            <div><i class="fas fa-bus mr-1"></i> Kapasitas Bus: <span class="font-medium">${selectedSchedule.available_bus}</span> tersedia</div>
                            <div><i class="fas fa-truck mr-1"></i> Kapasitas Truk: <span class="font-medium">${selectedSchedule.available_truck}</span> tersedia</div>
                        </div>
                    `;
                }
            }
        });

        // Search User
        searchUserBtn.addEventListener('click', function() {
            const query = userSearch.value.trim();

            if (query.length < 3) {
                alert('Masukkan minimal 3 karakter untuk pencarian');
                return;
            }

            fetch(`/admin/bookings/search-users?query=${query}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        userList.innerHTML = '';

                        if (data.data.length === 0) {
                            userList.innerHTML = '<div class="px-4 py-3 text-sm text-gray-700">Tidak ada pengguna ditemukan</div>';
                        } else {
                            data.data.forEach(user => {
                                const item = document.createElement('a');
                                item.href = '#';
                                item.className = 'block px-4 py-3 hover:bg-gray-50';
                                item.dataset.id = user.id;
                                item.dataset.name = user.name;
                                item.dataset.email = user.email;
                                item.dataset.phone = user.phone || 'Tidak ada nomor telepon';

                                item.innerHTML = `
                                    <div class="flex justify-between">
                                        <h6 class="text-sm font-medium text-gray-900">${user.name}</h6>
                                    </div>
                                    <p class="text-sm text-gray-600">${user.email}</p>
                                    <p class="text-xs text-gray-500">${user.phone || 'Tidak ada nomor telepon'}</p>
                                `;

                                item.addEventListener('click', function(e) {
                                    e.preventDefault();

                                    selectedUserName.textContent = this.dataset.name;
                                    selectedUserEmail.textContent = this.dataset.email;
                                    selectedUserPhone.textContent = this.dataset.phone;
                                    user_id.value = this.dataset.id;

                                    searchResults.classList.add('hidden');
                                    selectedUser.classList.remove('hidden');

                                    // Auto fill first passenger
                                    if (document.querySelector('[name="passengers[0][name]"]')) {
                                        document.querySelector('[name="passengers[0][name]"]').value = this.dataset.name;
                                    }

                                    if (schedule_id.value) {
                                        bookingDetails.classList.remove('hidden');
                                    }

                                    updateBookingSummary();
                                });

                                userList.appendChild(item);
                            });
                        }

                        searchResults.classList.remove('hidden');
                    } else {
                        alert('Gagal mendapatkan data pengguna');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Terjadi kesalahan saat mencari pengguna');
                });
        });

        // Change User Button
        changeUserBtn.addEventListener('click', function() {
            selectedUser.classList.add('hidden');
            searchResults.classList.remove('hidden');
            user_id.value = '';
            bookingDetails.classList.add('hidden');
        });

        // Passenger Counter
        decreasePassenger.addEventListener('click', function() {
            const currentValue = parseInt(passenger_count.value);
            if (currentValue > 1) {
                passenger_count.value = currentValue - 1;
                updatePassengerCards();
                updateBookingSummary();
            }
        });

        increasePassenger.addEventListener('click', function() {
            const currentValue = parseInt(passenger_count.value);
            if (currentValue < 10) {
                passenger_count.value = currentValue + 1;
                updatePassengerCards();
                updateBookingSummary();
            }
        });

        passenger_count.addEventListener('change', function() {
            updatePassengerCards();
            updateBookingSummary();
        });

        // Vehicle Counter
        decreaseVehicle.addEventListener('click', function() {
            const currentValue = parseInt(vehicle_count.value);
            if (currentValue > 0) {
                vehicle_count.value = currentValue - 1;
                updateVehicleCards();
                updateBookingSummary();
            }
        });

        increaseVehicle.addEventListener('click', function() {
            const currentValue = parseInt(vehicle_count.value);
            if (currentValue < 5) {
                vehicle_count.value = currentValue + 1;
                updateVehicleCards();
                updateBookingSummary();
            }
        });

        vehicle_count.addEventListener('change', function() {
            updateVehicleCards();
            updateBookingSummary();
        });

        // Payment Method Change
        payment_method.addEventListener('change', function() {
            updatePaymentChannels();
            updateBookingSummary();
        });

        payment_channel.addEventListener('change', function() {
            updateBookingSummary();
        });

        // Update Passenger Cards
        function updatePassengerCards() {
            const count = parseInt(passenger_count.value);

            // Remove existing cards except first
            const existingCards = document.querySelectorAll('.passenger-card');
            for (let i = existingCards.length - 1; i > 0; i--) {
                existingCards[i].remove();
            }

            // Add new cards
            for (let i = 1; i < count; i++) {
                const card = document.createElement('div');
                card.className = 'bg-white rounded-lg border border-gray-200 overflow-hidden passenger-card';
                card.dataset.index = i;

                card.innerHTML = `
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 class="font-medium text-gray-800">Penumpang ${i + 1}</h4>
                    </div>
                    <div class="p-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label for="passengers[${i}][name]" class="block text-sm font-medium text-gray-700 mb-1">
                                    Nama <span class="text-red-500">*</span>
                                </label>
                                <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    id="passengers[${i}][name]" name="passengers[${i}][name]" required>
                            </div>
                            <div>
                                <label for="passengers[${i}][id_number]" class="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Identitas <span class="text-red-500">*</span>
                                </label>
                                <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    id="passengers[${i}][id_number]" name="passengers[${i}][id_number]" required>
                            </div>
                            <div>
                                <label for="passengers[${i}][id_type]" class="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Identitas <span class="text-red-500">*</span>
                                </label>
                                <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    id="passengers[${i}][id_type]" name="passengers[${i}][id_type]" required>
                                    <option value="KTP">KTP</option>
                                    <option value="SIM">SIM</option>
                                    <option value="PASPOR">Paspor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;

                passengerContainer.appendChild(card);
            }
        }

        // Update Vehicle Cards
        function updateVehicleCards() {
            const count = parseInt(vehicle_count.value);

            if (count > 0) {
                vehicleContainer.classList.remove('hidden');
                vehicleContainer.innerHTML = '';

                for (let i = 0; i < count; i++) {
                    const card = document.createElement('div');
                    card.className = 'bg-white rounded-lg border border-gray-200 overflow-hidden vehicle-card';
                    card.dataset.index = i;

                    card.innerHTML = `
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h4 class="font-medium text-gray-800">Kendaraan ${i + 1}</h4>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label for="vehicles[${i}][type]" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jenis <span class="text-red-500">*</span>
                                    </label>
                                    <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 vehicle-type"
                                        id="vehicles[${i}][type]" name="vehicles[${i}][type]" required data-index="${i}">
                                        <option value="">Pilih Jenis</option>
                                        <option value="MOTORCYCLE">Motor</option>
                                        <option value="CAR">Mobil</option>
                                        <option value="BUS">Bus</option>
                                        <option value="TRUCK">Truk</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="vehicles[${i}][license_plate]" class="block text-sm font-medium text-gray-700 mb-1">
                                        Plat Nomor <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="vehicles[${i}][license_plate]" name="vehicles[${i}][license_plate]" required>
                                </div>
                                <div>
                                    <label for="vehicles[${i}][brand]" class="block text-sm font-medium text-gray-700 mb-1">
                                        Merk
                                    </label>
                                    <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="vehicles[${i}][brand]" name="vehicles[${i}][brand]">
                                </div>
                                <div>
                                    <label for="vehicles[${i}][model]" class="block text-sm font-medium text-gray-700 mb-1">
                                        Model
                                    </label>
                                    <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        id="vehicles[${i}][model]" name="vehicles[${i}][model]">
                                </div>
                            </div>
                        </div>
                    `;

                    vehicleContainer.appendChild(card);
                }

                // Add change event to vehicle type selects
                document.querySelectorAll('.vehicle-type').forEach(select => {
                    select.addEventListener('change', function() {
                        updateBookingSummary();
                    });
                });
            } else {
                vehicleContainer.classList.add('hidden');
            }
        }

        // Update Payment Channels
        function updatePaymentChannels() {
            const method = payment_method.value;

            if (method) {
                paymentChannelContainer.classList.remove('hidden');
                payment_channel.innerHTML = '<option value="">Pilih Channel Pembayaran</option>';

                switch (method) {
                    case 'CASH':
                        payment_channel.innerHTML += `<option value="COUNTER">Counter</option>`;
                        payment_channel.value = "COUNTER"; // Auto select
                        break;
                    case 'BANK_TRANSFER':
                        payment_channel.innerHTML += `
                            <option value="BCA">BCA</option>
                            <option value="MANDIRI">Mandiri</option>
                            <option value="BNI">BNI</option>
                            <option value="BRI">BRI</option>
                        `;
                        break;
                    case 'VIRTUAL_ACCOUNT':
                        payment_channel.innerHTML += `
                            <option value="BCA_VA">BCA Virtual Account</option>
                            <option value="MANDIRI_VA">Mandiri Virtual Account</option>
                            <option value="BNI_VA">BNI Virtual Account</option>
                            <option value="BRI_VA">BRI Virtual Account</option>
                        `;
                        break;
                    case 'E_WALLET':
                        payment_channel.innerHTML += `
                            <option value="GOPAY">GoPay</option>
                            <option value="OVO">OVO</option>
                            <option value="DANA">DANA</option>
                            <option value="LINKAJA">LinkAja</option>
                        `;
                        break;
                    case 'CREDIT_CARD':
                        payment_channel.innerHTML += `
                            <option value="CREDIT_CARD">Kartu Kredit</option>
                        `;
                        payment_channel.value = "CREDIT_CARD"; // Auto select
                        break;
                }
            } else {
                paymentChannelContainer.classList.add('hidden');
            }
        }

        // Update Booking Summary
        function updateBookingSummary() {
            // Route & Schedule
            if (route_id.value && schedule_id.value) {
                const routeText = route_id.options[route_id.selectedIndex].text;
                const scheduleText = schedule_id.options[schedule_id.selectedIndex].text;
                const selectedSchedule = scheduleData.find(s => s.id == schedule_id.value);

                summaryRoute.textContent = routeText;
                summaryDate.textContent = booking_date.value;
                summarySchedule.textContent = scheduleText;
                summaryFerry.textContent = selectedSchedule ? selectedSchedule.ferry.name : '-';

                // Calculate total
                let total = parseInt(passenger_count.value) * basePrice;

                // Add vehicle prices
                const vehicleTypes = document.querySelectorAll('.vehicle-type');
                let vehicleSummary = [];

                vehicleTypes.forEach(select => {
                    if (select.value) {
                        switch (select.value) {
                            case 'MOTORCYCLE':
                                total += motorcyclePrice;
                                vehicleSummary.push('Motor');
                                break;
                            case 'CAR':
                                total += carPrice;
                                vehicleSummary.push('Mobil');
                                break;
                            case 'BUS':
                                total += busPrice;
                                vehicleSummary.push('Bus');
                                break;
                            case 'TRUCK':
                                total += truckPrice;
                                vehicleSummary.push('Truk');
                                break;
                        }
                    }
                });

                // Update summary
                summaryPassengers.textContent = passenger_count.value;
                summaryVehicles.textContent = vehicleSummary.length > 0 ? vehicleSummary.join(', ') : 'Tidak ada';

                if (payment_method.value) {
                    let paymentText = payment_method.options[payment_method.selectedIndex].text;

                    if (payment_channel.value) {
                        paymentText += ' - ' + payment_channel.options[payment_channel.selectedIndex].text;
                    }

                    summaryPayment.textContent = paymentText;
                } else {
                    summaryPayment.textContent = '-';
                }

                summaryTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
            }
        }

        // Form Submission Validation
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            const selectedSchedule = scheduleData.find(s => s.id == schedule_id.value);

            if (!selectedSchedule) {
                e.preventDefault();
                alert('Silakan pilih jadwal terlebih dahulu');
                return;
            }

            if (!user_id.value) {
                e.preventDefault();
                alert('Silakan pilih pengguna terlebih dahulu');
                return;
            }

            const passengerCount = parseInt(passenger_count.value);
            if (passengerCount < 1 || passengerCount > 10) {
                e.preventDefault();
                alert('Jumlah penumpang harus antara 1-10');
                return;
            }

            if (passengerCount > selectedSchedule.available_passenger) {
                e.preventDefault();
                alert('Jumlah penumpang melebihi kapasitas yang tersedia');
                return;
            }

            const vehicleCount = parseInt(vehicle_count.value);
            if (vehicleCount > 0) {
                let motorcycleCount = 0;
                let carCount = 0;
                let busCount = 0;
                let truckCount = 0;

                document.querySelectorAll('.vehicle-type').forEach(select => {
                    switch (select.value) {
                        case 'MOTORCYCLE': motorcycleCount++; break;
                        case 'CAR': carCount++; break;
                        case 'BUS': busCount++; break;
                        case 'TRUCK': truckCount++; break;
                    }
                });

                if (motorcycleCount > selectedSchedule.available_motorcycle) {
                    e.preventDefault();
                    alert('Jumlah motor melebihi kapasitas yang tersedia');
                    return;
                }

                if (carCount > selectedSchedule.available_car) {
                    e.preventDefault();
                    alert('Jumlah mobil melebihi kapasitas yang tersedia');
                    return;
                }

                if (busCount > selectedSchedule.available_bus) {
                    e.preventDefault();
                    alert('Jumlah bus melebihi kapasitas yang tersedia');
                    return;
                }

                if (truckCount > selectedSchedule.available_truck) {
                    e.preventDefault();
                    alert('Jumlah truk melebihi kapasitas yang tersedia');
                    return;
                }
            }

            if (!payment_method.value) {
                e.preventDefault();
                alert('Silakan pilih metode pembayaran');
                return;
            }

            if (!payment_channel.value) {
                e.preventDefault();
                alert('Silakan pilih channel pembayaran');
                return;
            }
        });
    });
</script>
@endsection
