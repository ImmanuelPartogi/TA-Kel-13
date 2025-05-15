@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Detail Booking</h1>
        <div>
            <a href="{{ route('admin.bookings.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 transition ease-in-out duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm">{{ session('success') }}</p>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" data-bs-dismiss="alert">
                            <span class="sr-only">Dismiss</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif

    @if($errors->any())
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <div class="font-medium">Terjadi kesalahan:</div>
            <ul class="mt-1.5 ml-4 list-disc list-inside">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="float-right -mt-4 text-red-700" data-bs-dismiss="alert" aria-label="Close">
                <span class="text-2xl" aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    <!-- Booking Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
            <!-- Booking Information Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200 flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-white">Informasi Booking</h2>
                    <div class="relative inline-block text-left">
                        <button type="button" class="text-white hover:bg-blue-800 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white" id="dropdownMenuButton" aria-expanded="false" data-bs-toggle="dropdown" aria-haspopup="true">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                        <div class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden" role="menu" aria-orientation="vertical" aria-labelledby="dropdownMenuButton" tabindex="-1">
                            <div class="py-1" role="none">
                                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">Cetak Tiket</a>
                                <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">Kirim Email</a>
                                <div class="border-t border-gray-100"></div>
                                <a href="#" class="text-red-600 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1">Batalkan Booking</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Kode Booking:</div>
                            <div class="w-2/3 text-sm text-gray-900 font-semibold">{{ $booking->booking_code }}</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Status:</div>
                            <div class="w-2/3">
                                @if($booking->status == 'PENDING')
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                @elseif($booking->status == 'CONFIRMED')
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Confirmed
                                    </span>
                                @elseif($booking->status == 'CANCELLED')
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        Cancelled
                                    </span>
                                    @if($booking->cancellation_reason)
                                        <span class="block mt-1 text-xs text-gray-500">
                                            Alasan: {{ $booking->cancellation_reason }}
                                        </span>
                                    @endif
                                @elseif($booking->status == 'COMPLETED')
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        Completed
                                    </span>
                                @elseif($booking->status == 'REFUNDED')
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        Refunded
                                    </span>
                                @endif
                            </div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Dibuat Pada:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ $booking->created_at->format('d M Y H:i') }}</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Metode Booking:</div>
                            <div class="w-2/3 text-sm text-gray-900">
                                {{ $booking->booked_by === 'USER' ? 'Online oleh Pengguna' : 'Counter oleh Admin' }}
                                ({{ $booking->booking_channel }})
                            </div>
                        </div>
                        <div class="flex col-span-full">
                            <div class="w-1/6 text-sm font-medium text-gray-500">Catatan:</div>
                            <div class="w-5/6 text-sm text-gray-900">{{ $booking->notes ?? 'Tidak ada catatan' }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trip Information Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Informasi Perjalanan</h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Rute:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Kapal:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ $booking->schedule->ferry->name }} ({{ $booking->schedule->ferry->registration_number }})</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Tanggal Keberangkatan:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') }}</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Jam Keberangkatan:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ $booking->schedule->departure_time }}</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Jam Kedatangan:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ $booking->schedule->arrival_time }}</div>
                        </div>
                        <div class="flex">
                            <div class="w-1/3 text-sm font-medium text-gray-500">Durasi:</div>
                            <div class="w-2/3 text-sm text-gray-900">{{ $booking->schedule->route->duration }} menit</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passenger List Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Data Penumpang</h2>
                </div>
                <div class="p-6 overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Tiket</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penumpang</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($booking->tickets as $ticket)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {{ $ticket->ticket_code }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $ticket->passenger->name ?? 'N/A' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        @if($ticket->status == 'ACTIVE')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Aktif
                                            </span>
                                        @elseif($ticket->status == 'USED')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Digunakan
                                            </span>
                                        @elseif($ticket->status == 'CANCELLED')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Dibatalkan
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        @if($ticket->checked_in)
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Sudah Check-in
                                            </span>
                                        @else
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Belum Check-in
                                            </span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Vehicle List Card -->
            @if($booking->vehicle_count > 0)
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Data Kendaraan</h2>
                </div>
                <div class="p-6 overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merk</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($booking->vehicles as $vehicle)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        @if($vehicle->type == 'MOTORCYCLE')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Motor
                                            </span>
                                        @elseif($vehicle->type == 'CAR')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Mobil
                                            </span>
                                        @elseif($vehicle->type == 'BUS')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Bus
                                            </span>
                                        @elseif($vehicle->type == 'TRUCK')
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Truk
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $vehicle->license_plate }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $vehicle->brand ?? 'N/A' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $vehicle->model ?? 'N/A' }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @endif

            <!-- Booking History Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Riwayat Booking</h2>
                </div>
                <div class="p-6">
                    <div class="flow-root">
                        <ul role="list" class="-mb-8">
                            @foreach($booking->bookingLogs()->orderBy('created_at', 'desc')->get() as $log)
                                <li>
                                    <div class="relative pb-8">
                                        @if(!$loop->last)
                                            <span class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                        @endif
                                        <div class="relative flex items-start space-x-3">
                                            <div class="relative">
                                                <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="min-w-0 flex-1">
                                                <div>
                                                    <div class="text-sm">
                                                        <span class="font-medium text-gray-900">
                                                            Status berubah dari <span class="font-semibold">{{ $log->previous_status }}</span> menjadi <span class="font-semibold">{{ $log->new_status }}</span>
                                                        </span>
                                                    </div>
                                                    <p class="mt-0.5 text-sm text-gray-500">
                                                        {{ $log->created_at->format('d M Y H:i:s') }}
                                                    </p>
                                                </div>
                                                <div class="mt-2 text-sm text-gray-700">
                                                    <p>{{ $log->notes }}</p>
                                                </div>
                                                <div class="mt-1 text-sm text-gray-500">
                                                    Oleh: {{ $log->changed_by_type }}
                                                    @if($log->changed_by_type == 'ADMIN')
                                                        @if(isset($log->changedByAdmin))
                                                            ({{ $log->changedByAdmin->name }})
                                                        @endif
                                                    @elseif($log->changed_by_type == 'USER')
                                                        @if(isset($log->changedByUser))
                                                            ({{ $log->changedByUser->name }})
                                                        @endif
                                                    @endif
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

        <div class="space-y-6">
            <!-- User Information Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-500 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Informasi Pengguna</h2>
                </div>
                <div class="p-6">
                    <div class="flex flex-col items-center mb-6">
                        <div class="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h5 class="text-lg font-semibold text-gray-900">{{ $booking->user->name }}</h5>
                        <p class="text-sm text-gray-500">Member sejak {{ $booking->user->created_at->format('M Y') }}</p>
                    </div>
                    <div class="border-t border-gray-200 pt-4">
                        <dl>
                            <div class="flex justify-between py-2">
                                <dt class="text-sm font-medium text-gray-500">Email:</dt>
                                <dd class="text-sm text-gray-900">{{ $booking->user->email }}</dd>
                            </div>
                            <div class="flex justify-between py-2">
                                <dt class="text-sm font-medium text-gray-500">Telepon:</dt>
                                <dd class="text-sm text-gray-900">{{ $booking->user->phone ?? 'N/A' }}</dd>
                            </div>
                            <div class="flex justify-between py-2">
                                <dt class="text-sm font-medium text-gray-500">Total Booking:</dt>
                                <dd class="text-sm text-gray-900">{{ $booking->user->total_bookings ?? '1' }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <!-- Payment Information Card -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-green-400 to-green-500 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Informasi Pembayaran</h2>
                </div>
                <div class="p-6">
                    @if($booking->payments->isNotEmpty())
                        <div class="space-y-4">
                            @foreach($booking->payments as $payment)
                                <div class="border border-gray-200 rounded-lg p-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="text-sm font-medium text-gray-900">
                                            @if($payment->payment_method)
                                                {{ $payment->payment_method }} ({{ $payment->payment_channel }})
                                            @else
                                                Pembayaran #{{ $loop->iteration }}
                                            @endif
                                        </div>
                                        <div>
                                            @if($payment->status == 'PENDING')
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            @elseif($payment->status == 'SUCCESS')
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Berhasil
                                                </span>
                                            @elseif($payment->status == 'FAILED')
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Gagal
                                                </span>
                                            @elseif($payment->status == 'REFUNDED')
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Dikembalikan
                                                </span>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-y-2 text-sm">
                                        <div class="text-gray-500">Jumlah:</div>
                                        <div class="text-gray-900 font-medium">Rp {{ number_format($payment->amount, 0, ',', '.') }}</div>

                                        @if($payment->payment_date)
                                        <div class="text-gray-500">Tanggal Bayar:</div>
                                        <div class="text-gray-900">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y H:i') }}</div>
                                        @endif

                                        @if($payment->expiry_date)
                                        <div class="text-gray-500">Kadaluarsa:</div>
                                        <div class="text-gray-900">
                                            {{ \Carbon\Carbon::parse($payment->expiry_date)->format('d M Y H:i') }}
                                            @if(\Carbon\Carbon::now() > $payment->expiry_date && $payment->status == 'PENDING')
                                                <span class="inline-flex ml-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 px-1.5 py-0.5">
                                                    Kadaluarsa
                                                </span>
                                            @endif
                                        </div>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="flex flex-col items-center justify-center py-6 text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Tidak ada informasi pembayaran</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Update Status Form -->
            @if(in_array($booking->status, ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']))
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-purple-400 to-purple-500 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-white">Update Status</h2>
                </div>
                <div class="p-6">
                    <form action="{{ route('admin.bookings.update-status', $booking->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="mb-4">
                            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" id="status" name="status" required>
                                <option value="">Pilih Status</option>
                                @if($booking->status == 'PENDING')
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
                        <div class="mb-4 hidden" id="cancellationReasonContainer">
                            <label for="cancellation_reason" class="block text-sm font-medium text-gray-700 mb-1">Alasan Pembatalan</label>
                            <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" id="cancellation_reason" name="cancellation_reason">
                                <option value="">Pilih Alasan</option>
                                <option value="CUSTOMER_REQUEST">Permintaan Pelanggan</option>
                                <option value="SYSTEM_ISSUE">Masalah Sistem</option>
                                <option value="FERRY_ISSUE">Masalah Kapal</option>
                                <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                                <option value="PAYMENT_TIMEOUT">Timeout Pembayaran</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" id="notes" name="notes" rows="3"></textarea>
                        </div>
                        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Update Status
                        </button>
                    </form>
                </div>
            </div>
            @endif
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Dropdown menu toggle
        const dropdownMenuButton = document.getElementById('dropdownMenuButton');
        if (dropdownMenuButton) {
            const dropdownMenu = dropdownMenuButton.nextElementSibling;
            dropdownMenuButton.addEventListener('click', function() {
                dropdownMenu.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(event) {
                if (!dropdownMenuButton.contains(event.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });
        }

        // Status change handler
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
