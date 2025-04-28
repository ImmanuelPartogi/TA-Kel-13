@extends('layouts.app')

@section('content')
    <div class="container mx-auto px-4 py-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Detail Booking</h1>
                <p class="mt-1 text-gray-600">Kode: <span class="font-medium">{{ $booking->booking_code }}</span></p>
            </div>
            <div class="mt-4 md:mt-0">
                <a href="{{ route('admin.bookings.index') }}"
                    class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors shadow-sm">
                    <i class="fas fa-arrow-left mr-2 text-sm"></i> Kembali
                </a>
            </div>
        </div>

        <!-- Success message -->
        @if (session('success'))
            <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-500"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-green-700">{{ session('success') }}</p>
                    </div>
                    <div class="ml-auto pl-3">
                        <div class="-mx-1.5 -my-1.5">
                            <button type="button"
                                onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'"
                                class="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100">
                                <span class="sr-only">Dismiss</span>
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <!-- Error message -->
        @if ($errors->any())
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-500"></i>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Ada beberapa kesalahan:</h3>
                        <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                    <div class="ml-auto pl-3">
                        <div class="-mx-1.5 -my-1.5">
                            <button type="button"
                                onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'"
                                class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100">
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
            <!-- Left Column - Booking Details -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Booking Info Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 class="font-semibold text-lg text-gray-800">Informasi Booking</h2>
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div x-show="open" @click.away="open = false"
                                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                x-transition:enter="transition ease-out duration-100"
                                x-transition:enter-start="transform opacity-0 scale-95"
                                x-transition:enter-end="transform opacity-100 scale-100"
                                x-transition:leave="transition ease-in duration-75"
                                x-transition:leave-start="transform opacity-100 scale-100"
                                x-transition:leave-end="transform opacity-0 scale-95" style="display: none;">
                                <div class="py-1" role="menu" aria-orientation="vertical">
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem">Cetak Tiket</a>
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        role="menuitem">Kirim Email</a>
                                    <div class="border-t border-gray-100"></div>
                                    <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        role="menuitem">Batalkan Booking</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Kode Booking</p>
                                <p class="font-medium">{{ $booking->booking_code }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Status</p>
                                <div>
                                    @if ($booking->status == 'PENDING')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    @elseif($booking->status == 'CONFIRMED')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Confirmed
                                        </span>
                                    @elseif($booking->status == 'CANCELLED')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Cancelled
                                        </span>
                                        @if ($booking->cancellation_reason)
                                            <p class="mt-1 text-xs text-gray-500">Alasan:
                                                {{ $booking->cancellation_reason }}</p>
                                        @endif
                                    @elseif($booking->status == 'COMPLETED')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Completed
                                        </span>
                                    @elseif($booking->status == 'REFUNDED')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Refunded
                                        </span>
                                    @endif
                                </div>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Dibuat Pada</p>
                                <p>{{ $booking->created_at->format('d M Y H:i') }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Metode Booking</p>
                                <p>{{ $booking->booked_by === 'USER' ? 'Online oleh Pengguna' : 'Counter oleh Admin' }}
                                    ({{ $booking->booking_channel }})</p>
                            </div>
                        </div>

                        <div class="border-t border-gray-100 pt-4">
                            <p class="text-sm text-gray-500 mb-1">Catatan</p>
                            <p>{{ $booking->notes ?? 'Tidak ada catatan' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Trip Information Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="font-semibold text-lg text-gray-800">Informasi Perjalanan</h2>
                    </div>

                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Rute</p>
                                <p class="font-medium">{{ $booking->schedule->route->origin }} -
                                    {{ $booking->schedule->route->destination }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Kapal</p>
                                <p>{{ $booking->schedule->ferry->name }}
                                    ({{ $booking->schedule->ferry->registration_number }})</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Tanggal Keberangkatan</p>
                                <p>{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Jam Keberangkatan</p>
                                <p>{{ $booking->schedule->departure_time }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Jam Kedatangan</p>
                                <p>{{ $booking->schedule->arrival_time }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-1">Durasi</p>
                                <p>{{ $booking->schedule->route->duration }} menit</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Passenger Data Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="font-semibold text-lg text-gray-800">Data Penumpang</h2>
                    </div>

                    <div class="p-6">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kode Tiket
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Penumpang
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Check-in
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    @foreach ($booking->tickets as $ticket)
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {{ $ticket->ticket_code }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                {{ $ticket->passenger->name ?? 'N/A' }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                @if ($ticket->status == 'ACTIVE')
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Aktif
                                                    </span>
                                                @elseif($ticket->status == 'USED')
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Digunakan
                                                    </span>
                                                @elseif($ticket->status == 'CANCELLED')
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Dibatalkan
                                                    </span>
                                                @endif
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                @if ($ticket->checked_in)
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <i class="fas fa-check-circle mr-1"></i> Sudah Check-in
                                                    </span>
                                                @else
                                                    <span
                                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <i class="fas fa-clock mr-1"></i> Belum Check-in
                                                    </span>
                                                @endif
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Vehicle Data Card -->
                @if ($booking->vehicle_count > 0)
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h2 class="font-semibold text-lg text-gray-800">Data Kendaraan</h2>
                        </div>

                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th scope="col"
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jenis
                                            </th>
                                            <th scope="col"
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Plat Nomor
                                            </th>
                                            <th scope="col"
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Merk
                                            </th>
                                            <th scope="col"
                                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Model
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        @foreach ($booking->vehicles as $vehicle)
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    @if ($vehicle->type == 'MOTORCYCLE')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <i class="fas fa-motorcycle mr-1"></i> Motor
                                                        </span>
                                                    @elseif($vehicle->type == 'CAR')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <i class="fas fa-car mr-1"></i> Mobil
                                                        </span>
                                                    @elseif($vehicle->type == 'BUS')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <i class="fas fa-bus mr-1"></i> Bus
                                                        </span>
                                                    @elseif($vehicle->type == 'TRUCK')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <i class="fas fa-truck mr-1"></i> Truk
                                                        </span>
                                                    @endif
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                    {{ $vehicle->license_plate }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {{ $vehicle->brand ?? 'N/A' }}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {{ $vehicle->model ?? 'N/A' }}
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                @endif

                <!-- Booking History Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="font-semibold text-lg text-gray-800">Riwayat Booking</h2>
                    </div>

                    <div class="p-6">
                        <div class="flow-root">
                            <ul class="-mb-8">
                                @foreach ($booking->bookingLogs()->orderBy('created_at', 'desc')->get() as $log)
                                    <li>
                                        <div class="relative pb-8">
                                            @if (!$loop->last)
                                                <span class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"></span>
                                            @endif
                                            <div class="relative flex items-start space-x-3">
                                                <div class="relative">
                                                    <div
                                                        class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                        <i class="fas fa-history text-white"></i>
                                                    </div>
                                                </div>
                                                <div class="min-w-0 flex-1">
                                                    <div class="text-sm">
                                                        <p class="font-medium text-gray-900">
                                                            Status berubah dari <span
                                                                class="font-semibold">{{ $log->previous_status }}</span>
                                                            menjadi <span
                                                                class="font-semibold">{{ $log->new_status }}</span>
                                                        </p>
                                                        <p class="mt-0.5 text-gray-500">
                                                            {{ $log->notes }}
                                                        </p>
                                                        <p class="mt-1 text-xs text-gray-500">
                                                            Oleh: {{ $log->changed_by_type }}
                                                            @if ($log->changed_by_type == 'ADMIN')
                                                                @if (isset($log->changedByAdmin))
                                                                    ({{ $log->changedByAdmin->name }})
                                                                @endif
                                                            @elseif($log->changed_by_type == 'USER')
                                                                @if (isset($log->changedByUser))
                                                                    ({{ $log->changedByUser->name }})
                                                                @endif
                                                            @endif
                                                        </p>
                                                    </div>
                                                    <div class="mt-1 text-xs text-gray-500">
                                                        <time
                                                            datetime="{{ $log->created_at->format('Y-m-d\TH:i:s') }}">{{ $log->created_at->format('d M Y H:i:s') }}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Sidebar Information -->
            <div class="space-y-6">
                <!-- User Information Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="font-semibold text-lg text-gray-800">Informasi Pengguna</h2>
                    </div>

                    <div class="p-6">
                        <div class="flex flex-col items-center text-center mb-6">
                            <div class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                <i class="fas fa-user-circle text-4xl text-gray-400"></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900">{{ $booking->user->name }}</h3>
                            <p class="text-sm text-gray-500">Member sejak {{ $booking->user->created_at->format('M Y') }}
                            </p>
                        </div>

                        <div class="border-t border-gray-200 pt-4">
                            <dl class="divide-y divide-gray-200">
                                <div class="py-3 flex justify-between">
                                    <dt class="text-sm font-medium text-gray-500">Email</dt>
                                    <dd class="text-sm text-right text-gray-900">{{ $booking->user->email }}</dd>
                                </div>
                                <div class="py-3 flex justify-between">
                                    <dt class="text-sm font-medium text-gray-500">Telepon</dt>
                                    <dd class="text-sm text-right text-gray-900">{{ $booking->user->phone ?? 'N/A' }}</dd>
                                </div>
                                <div class="py-3 flex justify-between">
                                    <dt class="text-sm font-medium text-gray-500">Total Booking</dt>
                                    <dd class="text-sm text-right text-gray-900">
                                        {{ $booking->user->total_bookings ?? '1' }}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                <!-- Payment Information Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="font-semibold text-lg text-gray-800">Informasi Pembayaran</h2>
                    </div>

                    <div class="p-6">
                        @if ($booking->payments->isNotEmpty())
                            <div class="space-y-4">
                                @foreach ($booking->payments as $payment)
                                    <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                        <dl class="space-y-2">
                                            <div class="flex justify-between">
                                                <dt class="text-sm font-medium text-gray-500">Status</dt>
                                                <dd>
                                                    @if ($payment->status == 'PENDING')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <i class="fas fa-clock mr-1"></i> Pending
                                                        </span>
                                                    @elseif($payment->status == 'SUCCESS')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <i class="fas fa-check-circle mr-1"></i> Berhasil
                                                        </span>
                                                    @elseif($payment->status == 'FAILED')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <i class="fas fa-times-circle mr-1"></i> Gagal
                                                        </span>
                                                    @elseif($payment->status == 'REFUNDED')
                                                        <span
                                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            <i class="fas fa-undo mr-1"></i> Dikembalikan
                                                        </span>
                                                    @endif
                                                </dd>
                                            </div>
                                            <div class="flex justify-between">
                                                <dt class="text-sm font-medium text-gray-500">Jumlah</dt>
                                                <dd class="text-sm font-medium text-gray-900">Rp
                                                    {{ number_format($payment->amount, 0, ',', '.') }}</dd>
                                            </div>
                                            <div class="flex justify-between">
                                                <dt class="text-sm font-medium text-gray-500">Metode</dt>
                                                <dd class="text-sm text-gray-900">{{ $payment->payment_method }}
                                                    ({{ $payment->payment_channel }})</dd>
                                            </div>
                                            @if ($payment->payment_date)
                                                <div class="flex justify-between">
                                                    <dt class="text-sm font-medium text-gray-500">Tanggal Bayar</dt>
                                                    <dd class="text-sm text-gray-900">
                                                        {{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y H:i') }}
                                                    </dd>
                                                </div>
                                            @endif
                                            @if ($payment->expiry_date)
                                                <div class="flex justify-between">
                                                    <dt class="text-sm font-medium text-gray-500">Kadaluarsa</dt>
                                                    <dd class="text-sm text-gray-900">
                                                        {{ \Carbon\Carbon::parse($payment->expiry_date)->format('d M Y H:i') }}
                                                        @if (\Carbon\Carbon::now() > $payment->expiry_date && $payment->status == 'PENDING')
                                                            <span
                                                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-1">
                                                                <i class="fas fa-exclamation-circle mr-1"></i> Kadaluarsa
                                                            </span>
                                                        @endif
                                                    </dd>
                                                </div>
                                            @endif
                                        </dl>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <div class="flex flex-col items-center justify-center p-6 text-center">
                                <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <i class="fas fa-money-bill-wave text-gray-400"></i>
                                </div>
                                <h3 class="text-sm font-medium text-gray-900 mb-1">Tidak ada informasi pembayaran</h3>
                                <p class="text-xs text-gray-500">Belum ada transaksi pembayaran untuk booking ini</p>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Update Status Form Card -->
                @if (in_array($booking->status, ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']))
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h2 class="font-semibold text-lg text-gray-800">Update Status</h2>
                        </div>

                        <div class="p-6">
                            <form action="{{ route('admin.bookings.update-status', $booking->id) }}" method="POST">
                                @csrf
                                @method('PUT')
                                <div class="space-y-4">
                                    <div>
                                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select id="status" name="status"
                                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            required>
                                            <option value="">Pilih Status</option>
                                            @if ($booking->status == 'PENDING')
                                                <option value="CONFIRMED">Konfirmasi</option>
                                                <option value="CANCELLED">Batalkan</option>
                                            @elseif($booking->status == 'CONFIRMED')
                                                <option value="COMPLETED">Selesai</option>
                                                <option value="CANCELLED">Batalkan</option>
                                            @elseif($booking->status == 'COMPLETED')
                                                <option value="REFUNDED">Refund</option>
                                            @elseif($booking->status == 'CANCELLED')
                                                <option value="REFUNDED">Refund</option>
                                            @endif
                                        </select>
                                    </div>

                                    <div id="cancellationReasonContainer" class="hidden">
                                        <label for="cancellation_reason"
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Alasan Pembatalan
                                        </label>
                                        <select id="cancellation_reason" name="cancellation_reason"
                                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                            <option value="">Pilih Alasan</option>
                                            <option value="CUSTOMER_REQUEST">Permintaan Pelanggan</option>
                                            <option value="SYSTEM_ISSUE">Masalah Sistem</option>
                                            <option value="FERRY_ISSUE">Masalah Kapal</option>
                                            <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                                            <option value="PAYMENT_TIMEOUT">Timeout Pembayaran</option>
                                            <option value="OTHER">Lainnya</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                                            Catatan
                                        </label>
                                        <textarea id="notes" name="notes" rows="3"
                                            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"></textarea>
                                    </div>

                                    <div>
                                        <button type="submit"
                                            class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <i class="fas fa-save mr-2"></i> Update Status
                                        </button>
                                        <!-- Tombol Refund dan Reschedule -->
                                        @if (in_array($booking->status, ['CONFIRMED', 'COMPLETED']))
                                            <div class="mt-4 grid grid-cols-2 gap-3">
                                                <a href="{{ route('admin.refunds.create', $booking->id) }}"
                                                    class="inline-flex justify-center items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md shadow-sm">
                                                    <i class="fas fa-hand-holding-usd mr-2"></i> Refund
                                                </a>

                                                @if ($booking->status === 'CONFIRMED')
                                                    <a href="{{ route('admin.bookings.reschedule', $booking->id) }}"
                                                        class="inline-flex justify-center items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm">
                                                        <i class="fas fa-calendar-alt mr-2"></i> Reschedule
                                                    </a>
                                                @endif
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const statusSelect = document.getElementById('status');
            const cancellationReasonContainer = document.getElementById('cancellationReasonContainer');

            if (statusSelect && cancellationReasonContainer) {
                statusSelect.addEventListener('change', function() {
                    if (this.value === 'CANCELLED') {
                        cancellationReasonContainer.classList.remove('hidden');
                    } else {
                        cancellationReasonContainer.classList.add('hidden');
                    }
                });
            }
        });
    </script>
@endsection
