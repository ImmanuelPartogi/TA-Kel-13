<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
{
    View::composer('*', function ($view) {
        if (Auth::guard('admin')->check()) {
            $view->with('authUser', Auth::guard('admin')->user());
            $view->with('role', 'admin');
        } elseif (Auth::guard('operator')->check()) {
            $view->with('authUser', Auth::guard('operator')->user());
            $view->with('role', 'operator');
        } else {
            $view->with('authUser', null);
            $view->with('role', null);
        }
    });
}
}
