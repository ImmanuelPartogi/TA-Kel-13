@extends('layouts.auth')

@section('content')
<div class="w-full max-w-md">
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Login header -->
        <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-admin to-admin-dark opacity-90"></div>
            <div class="relative py-8 px-6 md:px-10">
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4">
                        <i class="fas fa-user-shield text-admin text-2xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Login Admin</h2>
                    <p class="text-admin-light mt-1">Masukkan kredensial untuk akses dashboard admin</p>
                </div>
            </div>
        </div>

        <!-- Login form -->
        <div class="py-6 px-6 md:px-10">
            <form method="POST" action="{{ route('admin.login.submit') }}">
                @csrf

                <div class="mb-4">
                    <label for="email" class="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-envelope text-gray-400"></i>
                        </div>
                        <input id="email" type="email" class="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin focus:border-transparent @error('email') border-red-500 @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus placeholder="email@example.com">
                    </div>
                    @error('email')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="mb-6">
                    <label for="password" class="block text-gray-700 text-sm font-medium mb-2">Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-lock text-gray-400"></i>
                        </div>
                        <input id="password" type="password" class="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin focus:border-transparent @error('password') border-red-500 @enderror" name="password" required autocomplete="current-password" placeholder="••••••••">
                    </div>
                    @error('password')
                        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <input id="remember" type="checkbox" class="h-4 w-4 text-admin focus:ring-admin border-gray-300 rounded" name="remember" {{ old('remember') ? 'checked' : '' }}>
                        <label for="remember" class="ml-2 block text-sm text-gray-700">
                            Ingat Saya
                        </label>
                    </div>

                    @if (Route::has('admin.password.request'))
                        <a class="text-sm text-admin hover:text-admin-dark" href="{{ route('admin.password.request') }}">
                            Lupa Password?
                        </a>
                    @endif
                </div>

                <div>
                    <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-admin hover:bg-admin-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin transition-colors duration-200">
                        <i class="fas fa-sign-in-alt mr-2"></i> Masuk
                    </button>
                </div>
            </form>
        </div>

        <!-- Login footer -->
        <div class="py-4 px-6 md:px-10 bg-gray-50 border-t border-gray-100 text-center">
            <p class="text-sm text-gray-600">
                <a href="{{ route('operator.login') }}" class="text-admin hover:text-admin-dark transition-colors duration-200">
                    <i class="fas fa-user-tie mr-1"></i> Login sebagai Operator
                </a>
            </p>
        </div>
    </div>

    <!-- Additional info or help text can go here -->
    <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
            Butuh bantuan? <a href="#" class="text-admin hover:text-admin-dark transition-colors duration-200">Hubungi Kami</a>
        </p>
    </div>
</div>
@endsection