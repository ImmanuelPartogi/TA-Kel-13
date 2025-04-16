@extends('layouts.frontend')

@section('content')
    <div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 pt-16">
        <div class="container mx-auto px-4">
            <!-- Hero Section -->
            <div class="flex flex-col md:flex-row items-center justify-between py-12">
                <div class="md:w-1/2 text-white mb-8 md:mb-0">
                    <h1 class="text-4xl md:text-5xl font-bold mb-4">Ferry Booking System</h1>
                    <p class="text-xl mb-8">Pesan tiket kapal ferry dengan mudah, cepat, dan aman!</p>
                    <div class="flex space-x-4">
                        <a href="{{ route('admin.login') }}"
                            class="bg-white text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-lg font-medium transition duration-200">
                            Login Admin
                        </a>
                        <a href="{{ route('operator.login') }}"
                            class="border border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium transition duration-200">
                            Login Operator
                        </a>
                    </div>
                </div>
                <div class="md:w-1/2">
                    <img src="https://placehold.co/600x400?text=Ferry+Illustration" alt="Ferry Illustration"
                        class="w-full h-auto">
                </div>
            </div>

            <!-- Searching Panel -->
            <div class="bg-white rounded-lg shadow-xl p-6 -mb-12 relative z-10">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Cari Tiket</h2>
                <form action="{{ route('search-schedule') }}" method="GET">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Rute</label>
                            <select name="route_id"
                                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Pilih Rute</option>
                                @foreach ($routes as $route)
                                    <option value="{{ $route->id }}">{{ $route->origin }} - {{ $route->destination }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Tanggal Keberangkatan</label>
                            <input type="date" name="departure_date" min="{{ date('Y-m-d') }}"
                                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="flex items-end">
                            <button type="submit"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                                <i class="fas fa-search mr-2"></i> Cari
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Upcoming Schedules -->
        <div class="bg-gray-100 pt-24 pb-12">
            <div class="container mx-auto px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Jadwal Mendatang</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @forelse($upcomingSchedules as $scheduleDate)
                        <div class="bg-white rounded-lg shadow-md overflow-hidden">
                            <div class="bg-blue-600 text-white p-4">
                                <div class="flex justify-between items-center">
                                    <h3 class="font-bold">{{ $scheduleDate->schedule->route->origin }} -
                                        {{ $scheduleDate->schedule->route->destination }}</h3>
                                    <span
                                        class="text-sm bg-blue-700 px-2 py-1 rounded">{{ $scheduleDate->schedule->ferry->name }}</span>
                                </div>
                            </div>
                            <div class="p-4">
                                <div class="flex justify-between mb-2">
                                    <div>
                                        <span class="text-gray-500 text-sm">Tanggal</span>
                                        <p class="font-medium">
                                            {{ \Carbon\Carbon::parse($scheduleDate->date)->format('d M Y') }}
                                        </p>
                                    </div>
                                    <div>
                                        <span class="text-gray-500 text-sm">Jam</span>
                                        <p class="font-medium">
                                            {{ \Carbon\Carbon::parse($scheduleDate->departure_time)->format('H:i') }}</p>
                                    </div>
                                </div>
                                <div class="flex justify-between">
                                    <div>
                                        <span class="text-gray-500 text-sm">Harga</span>
                                        <p class="font-medium">Rp
                                            {{ number_format($scheduleDate->schedule->price, 0, ',', '.') }}</p>
                                    </div>
                                    <div>
                                        <span class="text-gray-500 text-sm">Kapasitas</span>
                                        <p class="font-medium">{{ $scheduleDate->schedule->ferry->capacity }} penumpang</p>
                                    </div>
                                </div>
                                <a href="{{ route('book', ['schedule_date_id' => $scheduleDate->id]) }}"
                                    class="mt-4 block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                                    Pesan Sekarang
                                </a>
                            </div>
                        </div>
                    @empty
                        <div class="col-span-3 text-center py-8">
                            <p class="text-gray-500">Tidak ada jadwal mendatang yang tersedia.</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="py-12 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-2xl font-bold text-gray-800 mb-12 text-center">Kenapa Memilih Kami?</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="text-center p-6">
                        <div
                            class="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-ticket-alt text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Pemesanan Mudah</h3>
                        <p class="text-gray-600">Pesan tiket kapan saja dan dimana saja dengan mudah melalui platform kami.
                        </p>
                    </div>

                    <div class="text-center p-6">
                        <div
                            class="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-shield-alt text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Pembayaran Aman</h3>
                        <p class="text-gray-600">Nikmati transaksi yang aman dan terpercaya dengan berbagai metode
                            pembayaran.</p>
                    </div>

                    <div class="text-center p-6">
                        <div
                            class="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-headset text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Layanan 24/7</h3>
                        <p class="text-gray-600">Tim customer service kami siap membantu Anda 24 jam setiap hari.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
