@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Jadwalkan Ulang Booking</h1>
            <p class="mt-1 text-gray-600">Kode: <span class="font-medium">{{ $booking->booking_code }}</span></p>
        </div>
        <div class="mt-4 md:mt-0">
            <a href="{{ route('admin.bookings.show', $booking->id) }}" class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm">
                <i class="fas fa-arrow-left mr-2 text-sm"></i> Kembali
            </a>
        </div>
    </div>

    <!-- Error message -->
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

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Reschedule Form -->
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="font-semibold text-lg text-gray-800">Pilih Jadwal Baru</h2>
                </div>

                <div class="p-6">
                    <form id="rescheduleForm" action="{{ route('admin.bookings.process-reschedule', $booking->id) }}" method="POST">
                        @csrf
                        <div class="space-y-6">
                            <div>
                                <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">
                                    Rute <span class="text-red-500">*</span>
                                </label>
                                <select id="route_id" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" required>
                                    <option value="">Pilih Rute</option>
                                    @foreach($routes as $route)
                                        <option value="{{ $route->id }}" {{ $booking->schedule->route_id == $route->id ? 'selected' : '' }}>
                                            {{ $route->origin }} - {{ $route->destination }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div>
                                <label for="booking_date" class="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Baru <span class="text-red-500">*</span>
                                </label>
                                <input type="date" id="booking_date" name="booking_date"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    min="{{ date('Y-m-d') }}" required>
                            </div>

                            <div>
                                <button type="button" id="checkSchedulesBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm">
                                    <i class="fas fa-search mr-2"></i> Cari Jadwal Tersedia
                                </button>
                            </div>

                            <div id="scheduleResults" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Jadwal Tersedia</label>
                                <div id="scheduleList" class="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3"></div>
                            </div>

                            <div id="noSchedulesFound" class="hidden bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm text-yellow-700">Tidak ada jadwal yang tersedia untuk tanggal dan rute yang dipilih.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan
                                </label>
                                <textarea id="notes" name="notes" rows="3"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>
                            </div>

                            <input type="hidden" id="schedule_id" name="schedule_id">

                            <div class="pt-4">
                                <button type="submit" id="submitButton" class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled>
                                    <i class="fas fa-calendar-check mr-2"></i> Jadwalkan Ulang
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Right Column - Booking Summary -->
        <div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 class="font-semibold text-gray-800">Booking Saat Ini</h2>
                </div>

                <div class="p-6">
                    <dl class="divide-y divide-gray-200">
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Kode Booking</dt>
                            <dd class="text-sm font-medium text-blue-600">{{ $booking->booking_code }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Status</dt>
                            <dd>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Confirmed
                                </span>
                            </dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Pengguna</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->user->name }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Rute</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Tanggal</dt>
                            <dd class="text-sm text-gray-900">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Jadwal</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->schedule->departure_time }} - {{ $booking->schedule->arrival_time }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Kapal</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->schedule->ferry->name }}</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Penumpang</dt>
                            <dd class="text-sm text-gray-900">{{ $booking->passenger_count }} orang</dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Kendaraan</dt>
                            <dd class="text-sm text-gray-900">
                                @if($booking->vehicle_count > 0)
                                    @php
                                        $vehicleCounts = [
                                            'MOTORCYCLE' => 0,
                                            'CAR' => 0,
                                            'BUS' => 0,
                                            'TRUCK' => 0
                                        ];

                                        foreach($booking->vehicles as $vehicle) {
                                            $vehicleCounts[$vehicle->type]++;
                                        }

                                        $vehicleTexts = [];
                                        if($vehicleCounts['MOTORCYCLE'] > 0) $vehicleTexts[] = $vehicleCounts['MOTORCYCLE'] . ' Motor';
                                        if($vehicleCounts['CAR'] > 0) $vehicleTexts[] = $vehicleCounts['CAR'] . ' Mobil';
                                        if($vehicleCounts['BUS'] > 0) $vehicleTexts[] = $vehicleCounts['BUS'] . ' Bus';
                                        if($vehicleCounts['TRUCK'] > 0) $vehicleTexts[] = $vehicleCounts['TRUCK'] . ' Truk';
                                    @endphp
                                    {{ implode(', ', $vehicleTexts) }}
                                @else
                                    Tidak ada
                                @endif
                            </dd>
                        </div>
                        <div class="py-3 flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">Total</dt>
                            <dd class="text-sm font-bold text-blue-600">Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const routeId = document.getElementById('route_id');
        const bookingDate = document.getElementById('booking_date');
        const checkSchedulesBtn = document.getElementById('checkSchedulesBtn');
        const scheduleResults = document.getElementById('scheduleResults');
        const scheduleList = document.getElementById('scheduleList');
        const noSchedulesFound = document.getElementById('noSchedulesFound');
        const scheduleIdInput = document.getElementById('schedule_id');
        const submitButton = document.getElementById('submitButton');

        // Kendaraan yang ada dalam booking
        const vehicleCounts = {
            @if($booking->vehicle_count > 0)
                @php
                    $vehicleCounts = [
                        'MOTORCYCLE' => 0,
                        'CAR' => 0,
                        'BUS' => 0,
                        'TRUCK' => 0
                    ];

                    foreach($booking->vehicles as $vehicle) {
                        $vehicleCounts[$vehicle->type]++;
                    }
                @endphp
                'MOTORCYCLE': {{ $vehicleCounts['MOTORCYCLE'] }},
                'CAR': {{ $vehicleCounts['CAR'] }},
                'BUS': {{ $vehicleCounts['BUS'] }},
                'TRUCK': {{ $vehicleCounts['TRUCK'] }}
            @endif
        };

        // Set tanggal minimal ke hari ini
        bookingDate.min = new Date().toISOString().split('T')[0];

        // Event listener untuk tombol cek jadwal
        checkSchedulesBtn.addEventListener('click', function() {
            if (!routeId.value) {
                alert('Silakan pilih rute terlebih dahulu');
                return;
            }

            if (!bookingDate.value) {
                alert('Silakan pilih tanggal keberangkatan terlebih dahulu');
                return;
            }

            fetchAvailableSchedules();
        });

        // Fungsi untuk mengambil jadwal yang tersedia
        function fetchAvailableSchedules() {
            const data = {
                route_id: routeId.value,
                date: bookingDate.value,
                passenger_count: {{ $booking->passenger_count }},
                vehicle_counts: vehicleCounts
            };

            fetch('{{ route('admin.bookings.get-available-schedules') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displaySchedules(data.data);
                } else {
                    alert('Terjadi kesalahan saat mengambil jadwal');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mencari jadwal');
            });
        }

        // Fungsi untuk menampilkan jadwal yang tersedia
        function displaySchedules(schedules) {
            scheduleList.innerHTML = '';

            if (schedules.length === 0) {
                scheduleResults.classList.add('hidden');
                noSchedulesFound.classList.remove('hidden');
                submitButton.disabled = true;
                return;
            }

            schedules.forEach(schedule => {
                const available = schedule.is_available;

                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'border rounded-md p-3 ' + (available ? 'bg-white hover:bg-blue-50 cursor-pointer' : 'bg-gray-50 opacity-75');

                if (available) {
                    scheduleItem.dataset.id = schedule.id;
                    scheduleItem.onclick = function() {
                        selectSchedule(this, schedule);
                    };
                }

                const scheduleTitle = document.createElement('div');
                scheduleTitle.className = 'flex justify-between items-center mb-2';
                scheduleTitle.innerHTML = `
                    <div class="font-medium ${available ? 'text-gray-900' : 'text-gray-500'}">
                        ${schedule.departure_time} - ${schedule.arrival_time}
                    </div>
                    <div>
                        ${available ?
                            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tersedia</span>' :
                            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Tidak Tersedia</span>'
                        }
                    </div>
                `;

                const scheduleDetails = document.createElement('div');
                scheduleDetails.className = 'text-sm text-gray-600 space-y-1';
                scheduleDetails.innerHTML = `
                    <div>Kapal: <span class="font-medium">${schedule.ferry.name}</span></div>
                    <div>Kapasitas: ${schedule.available_passenger} penumpang tersedia</div>
                    ${vehicleCounts.MOTORCYCLE > 0 ? `<div>Motor: ${schedule.available_motorcycle} tersedia</div>` : ''}
                    ${vehicleCounts.CAR > 0 ? `<div>Mobil: ${schedule.available_car} tersedia</div>` : ''}
                    ${vehicleCounts.BUS > 0 ? `<div>Bus: ${schedule.available_bus} tersedia</div>` : ''}
                    ${vehicleCounts.TRUCK > 0 ? `<div>Truk: ${schedule.available_truck} tersedia</div>` : ''}
                `;

                scheduleItem.appendChild(scheduleTitle);
                scheduleItem.appendChild(scheduleDetails);

                scheduleList.appendChild(scheduleItem);
            });

            scheduleResults.classList.remove('hidden');
            noSchedulesFound.classList.add('hidden');
        }

        // Fungsi untuk memilih jadwal
        function selectSchedule(element, schedule) {
            // Hapus kelas selected dari semua item
            const allItems = scheduleList.querySelectorAll('div[data-id]');
            allItems.forEach(item => {
                item.classList.remove('border-blue-500', 'bg-blue-50');
                item.classList.add('border-gray-200');
            });

            // Tambahkan kelas selected ke item yang dipilih
            element.classList.remove('border-gray-200');
            element.classList.add('border-blue-500', 'bg-blue-50');

            // Set schedule_id
            scheduleIdInput.value = schedule.id;

            // Aktifkan tombol submit
            submitButton.disabled = false;
        }
    });
</script>
@endsection
