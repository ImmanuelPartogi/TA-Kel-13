<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BackendLoginController extends Controller
{
    /**
     * Show admin login form
     */
    public function showAdminLoginForm()
    {
        return view('admin.auth.login');
    }

    /**
     * Handle admin login
     */
    public function adminLogin(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Coba login
        if (Auth::guard('admin')->attempt([
            'email' => $request->email,
            'password' => $request->password
        ], $request->filled('remember'))) {
            // Regenerate session untuk menghindari session fixation
            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'));
        }

        // Jika gagal, kembalikan dengan error
        return back()->withErrors([
            'email' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
        ])->withInput($request->only('email', 'remember'));
    }

    /**
     * Handle admin logout
     */
    public function adminLogout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    /**
     * Show operator login form
     */
    public function showOperatorLoginForm()
    {
        return view('operator.auth.login');
    }

    /**
     * Handle operator login
     */
    public function operatorLogin(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Coba login
        if (Auth::guard('operator')->attempt([
            'email' => $request->email,
            'password' => $request->password
        ], $request->filled('remember'))) {
            // Regenerate session untuk menghindari session fixation
            $request->session()->regenerate();

            return redirect()->intended(route('operator.dashboard'));
        }

        // Jika gagal, kembalikan dengan error
        return back()->withErrors([
            'email' => 'Kredensial yang diberikan tidak cocok dengan data kami.',
        ])->withInput($request->only('email', 'remember'));
    }

    /**
     * Handle operator logout
     */
    public function operatorLogout(Request $request)
    {
        Auth::guard('operator')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('operator.login');
    }
}
