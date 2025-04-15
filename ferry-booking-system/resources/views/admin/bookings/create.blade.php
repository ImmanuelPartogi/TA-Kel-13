@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Buat Booking Baru</h1>
        <a href="{{ route('admin.bookings.index') }}" class="d-none d-sm-inline-block btn btn-secondary shadow-sm">
            <i class="fas fa-arrow-left fa-sm text-white-50"></i> Kembali
        </a>
    </div>

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Form Booking</h6>
        </div>
        <div class="card-body">
            <form id="bookingForm" action="{{ route('admin.bookings.store') }}" method="POST">
                @csrf
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="mb-3">Informasi Perjalanan</h5>
                        <div class="mb-3">
                            <label for="route_id" class="form-label">Rute <span class="text-danger">*</span></label>
                            <select class="form-control" id="route_id" name="route_id" required>
                                <option value="">Pilih Rute</option>
                                @foreach($routes as $route)
                                    <option value="{{ $route->id }}" {{ old('route_id') == $route->id ? 'selected' : '' }}>
                                        {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="booking_date" class="form-label">Tanggal Keberangkatan <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="booking_date" name="booking_date" value="{{ old('booking_date') ?? date('Y-m-d') }}" required min="{{ date('Y-m-d') }}">
                        </div>
                        <div class="mb-3">
                            <label for="schedule_id" class="form-label">Jadwal <span class="text-danger">*</span></label>
                            <select class="form-control" id="schedule_id" name="schedule_id" required disabled>
                                <option value="">Pilih rute dan tanggal terlebih dahulu</option>
                            </select>
                            <div id="scheduleInfo" class="small mt-2"></div>
                        </div>
                        <div class="mb-3">
                            <button type="button" id="checkScheduleBtn" class="btn btn-primary">
                                <i class="fas fa-search"></i> Cek Jadwal
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5 class="mb-3">Informasi Penumpang Utama</h5>
                        <div class="mb-3">
                            <label for="user_search" class="form-label">Cari Pengguna <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="user_search" placeholder="Masukkan nama, email, atau telepon">
                                <button class="btn btn-primary" type="button" id="searchUserBtn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                            <small class="form-text text-muted">Minimal 3 karakter</small>
                        </div>
                        <div id="searchResults" class="mb-3" style="display: none;">
                            <label class="form-label">Hasil Pencarian</label>
                            <div class="list-group" id="userList"></div>
                        </div>
                        <div id="selectedUser" class="mb-3" style="display: none;">
                            <label class="form-label">Pengguna Terpilih</label>
                            <div class="card">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-0" id="selectedUserName"></h6>
                                            <small class="text-muted" id="selectedUserEmail"></small><br>
                                            <small class="text-muted" id="selectedUserPhone"></small>
                                        </div>
                                        <button type="button" id="changeUserBtn" class="btn btn-sm btn-outline-secondary">Ganti</button>
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" id="user_id" name="user_id">
                        </div>
                    </div>
                </div>

                <div id="bookingDetails" style="display: none;">
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <h5 class="mb-3">Penumpang & Kendaraan</h5>
                            <div class="mb-3">
                                <label for="passenger_count" class="form-label">Jumlah Penumpang <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <button class="btn btn-outline-secondary" type="button" id="decreasePassenger">-</button>
                                    <input type="number" class="form-control text-center" id="passenger_count" name="passenger_count" value="1" min="1" max="10" required>
                                    <button class="btn btn-outline-secondary" type="button" id="increasePassenger">+</button>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="vehicle_count" class="form-label">Jumlah Kendaraan</label>
                                <div class="input-group">
                                    <button class="btn btn-outline-secondary" type="button" id="decreaseVehicle">-</button>
                                    <input type="number" class="form-control text-center" id="vehicle_count" name="vehicle_count" value="0" min="0" max="5">
                                    <button class="btn btn-outline-secondary" type="button" id="increaseVehicle">+</button>
                                </div>
                            </div>

                            <div id="vehicleContainer" style="display: none;"></div>
                        </div>
                        <div class="col-md-6">
                            <h5 class="mb-3">Pembayaran</h5>
                            <div class="mb-3">
                                <label for="payment_method" class="form-label">Metode Pembayaran <span class="text-danger">*</span></label>
                                <select class="form-control" id="payment_method" name="payment_method" required>
                                    <option value="">Pilih Metode Pembayaran</option>
                                    <option value="CASH" {{ old('payment_method') == 'CASH' ? 'selected' : '' }}>Tunai</option>
                                    <option value="BANK_TRANSFER" {{ old('payment_method') == 'BANK_TRANSFER' ? 'selected' : '' }}>Transfer Bank</option>
                                    <option value="VIRTUAL_ACCOUNT" {{ old('payment_method') == 'VIRTUAL_ACCOUNT' ? 'selected' : '' }}>Virtual Account</option>
                                    <option value="E_WALLET" {{ old('payment_method') == 'E_WALLET' ? 'selected' : '' }}>E-Wallet</option>
                                    <option value="CREDIT_CARD" {{ old('payment_method') == 'CREDIT_CARD' ? 'selected' : '' }}>Kartu Kredit</option>
                                </select>
                            </div>
                            <div class="mb-3" id="paymentChannelContainer" style="display: none;">
                                <label for="payment_channel" class="form-label">Channel Pembayaran <span class="text-danger">*</span></label>
                                <select class="form-control" id="payment_channel" name="payment_channel" required>
                                    <option value="">Pilih Channel Pembayaran</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="notes" class="form-label">Catatan</label>
                                <textarea class="form-control" id="notes" name="notes" rows="3">{{ old('notes') }}</textarea>
                            </div>
                        </div>
                    </div>

                    <hr>
                    <div id="passengerContainer">
                        <h5 class="mb-3">Data Penumpang</h5>
                        <div class="card mb-3 passenger-card" data-index="0">
                            <div class="card-header bg-light">
                                <h6 class="mb-0">Penumpang 1 (Utama)</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="passengers[0][name]" class="form-label">Nama <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="passengers[0][name]" name="passengers[0][name]" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="passengers[0][id_number]" class="form-label">Nomor Identitas <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="passengers[0][id_number]" name="passengers[0][id_number]" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="passengers[0][id_type]" class="form-label">Jenis Identitas <span class="text-danger">*</span></label>
                                        <select class="form-control" id="passengers[0][id_type]" name="passengers[0][id_type]" required>
                                            <option value="KTP">KTP</option>
                                            <option value="SIM">SIM</option>
                                            <option value="PASPOR">Paspor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card shadow mb-4">
                        <div class="card-header py-3">
                            <h6 class="m-0 font-weight-bold text-primary">Ringkasan Booking</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Rute:</strong> <span id="summaryRoute">-</span></p>
                                    <p class="mb-1"><strong>Tanggal:</strong> <span id="summaryDate">-</span></p>
                                    <p class="mb-1"><strong>Jadwal:</strong> <span id="summarySchedule">-</span></p>
                                    <p class="mb-1"><strong>Kapal:</strong> <span id="summaryFerry">-</span></p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Penumpang:</strong> <span id="summaryPassengers">1</span> orang</p>
                                    <p class="mb-1"><strong>Kendaraan:</strong> <span id="summaryVehicles">0</span></p>
                                    <p class="mb-1"><strong>Pembayaran:</strong> <span id="summaryPayment">-</span></p>
                                    <p class="mb-1"><strong>Total:</strong> <span id="summaryTotal">Rp 0</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary btn-lg">Buat Booking</button>
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
                            scheduleInfo.innerHTML = '<div class="text-danger">Tidak ada jadwal tersedia untuk tanggal yang dipilih</div>';
                        } else {
                            scheduleData.forEach(schedule => {
                                const option = document.createElement('option');
                                option.value = schedule.id;
                                option.textContent = `${schedule.departure_time} - ${schedule.arrival_time} (${schedule.ferry.name})`;
                                schedule_id.appendChild(option);
                            });

                            scheduleInfo.innerHTML = '<div class="text-success">Jadwal tersedia, silakan pilih jadwal</div>';
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
                bookingDetails.style.display = 'block';
            } else {
                bookingDetails.style.display = 'none';
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
                        <div class="text-success">
                            <div>Kapasitas Penumpang: ${selectedSchedule.available_passenger} tersedia</div>
                            <div>Kapasitas Motor: ${selectedSchedule.available_motorcycle} tersedia</div>
                            <div>Kapasitas Mobil: ${selectedSchedule.available_car} tersedia</div>
                            <div>Kapasitas Bus: ${selectedSchedule.available_bus} tersedia</div>
                            <div>Kapasitas Truk: ${selectedSchedule.available_truck} tersedia</div>
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
                            userList.innerHTML = '<div class="list-group-item">Tidak ada pengguna ditemukan</div>';
                        } else {
                            data.data.forEach(user => {
                                const item = document.createElement('a');
                                item.href = '#';
                                item.className = 'list-group-item list-group-item-action';
                                item.dataset.id = user.id;
                                item.dataset.name = user.name;
                                item.dataset.email = user.email;
                                item.dataset.phone = user.phone || 'Tidak ada nomor telepon';

                                item.innerHTML = `
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${user.name}</h6>
                                    </div>
                                    <p class="mb-1">${user.email}</p>
                                    <small>${user.phone || 'Tidak ada nomor telepon'}</small>
                                `;

                                item.addEventListener('click', function(e) {
                                    e.preventDefault();

                                    selectedUserName.textContent = this.dataset.name;
                                    selectedUserEmail.textContent = this.dataset.email;
                                    selectedUserPhone.textContent = this.dataset.phone;
                                    user_id.value = this.dataset.id;

                                    searchResults.style.display = 'none';
                                    selectedUser.style.display = 'block';

                                    // Auto fill first passenger
                                    if (document.querySelector('[name="passengers[0][name]"]')) {
                                        document.querySelector('[name="passengers[0][name]"]').value = this.dataset.name;
                                    }

                                    if (schedule_id.value) {
                                        bookingDetails.style.display = 'block';
                                    }

                                    updateBookingSummary();
                                });

                                userList.appendChild(item);
                            });
                        }

                        searchResults.style.display = 'block';
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
            selectedUser.style.display = 'none';
            searchResults.style.display = 'block';
            user_id.value = '';
            bookingDetails.style.display = 'none';
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
                card.className = 'card mb-3 passenger-card';
                card.dataset.index = i;

                card.innerHTML = `
                    <div class="card-header bg-light">
                        <h6 class="mb-0">Penumpang ${i + 1}</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="passengers[${i}][name]" class="form-label">Nama <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="passengers[${i}][name]" name="passengers[${i}][name]" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="passengers[${i}][id_number]" class="form-label">Nomor Identitas <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="passengers[${i}][id_number]" name="passengers[${i}][id_number]" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="passengers[${i}][id_type]" class="form-label">Jenis Identitas <span class="text-danger">*</span></label>
                                <select class="form-control" id="passengers[${i}][id_type]" name="passengers[${i}][id_type]" required>
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
                vehicleContainer.style.display = 'block';
                vehicleContainer.innerHTML = '';

                for (let i = 0; i < count; i++) {
                    const card = document.createElement('div');
                    card.className = 'card mb-3 vehicle-card';
                    card.dataset.index = i;

                    card.innerHTML = `
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Kendaraan ${i + 1}</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label for="vehicles[${i}][type]" class="form-label">Jenis <span class="text-danger">*</span></label>
                                    <select class="form-control vehicle-type" id="vehicles[${i}][type]" name="vehicles[${i}][type]" required data-index="${i}">
                                        <option value="">Pilih Jenis</option>
                                        <option value="MOTORCYCLE">Motor</option>
                                        <option value="CAR">Mobil</option>
                                        <option value="BUS">Bus</option>
                                        <option value="TRUCK">Truk</option>
                                    </select>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="vehicles[${i}][license_plate]" class="form-label">Plat Nomor <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="vehicles[${i}][license_plate]" name="vehicles[${i}][license_plate]" required>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="vehicles[${i}][brand]" class="form-label">Merk</label>
                                    <input type="text" class="form-control" id="vehicles[${i}][brand]" name="vehicles[${i}][brand]">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="vehicles[${i}][model]" class="form-label">Model</label>
                                    <input type="text" class="form-control" id="vehicles[${i}][model]" name="vehicles[${i}][model]">
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
                vehicleContainer.style.display = 'none';
            }
        }

        // Update Payment Channels
        function updatePaymentChannels() {
            const method = payment_method.value;

            if (method) {
                paymentChannelContainer.style.display = 'block';
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
                paymentChannelContainer.style.display = 'none';
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
