<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    /**
     * Show the admin login form.
     */
    public function create(): Response
    {
        return Inertia::render('AdminLogin');
    }

    /**
     * Handle admin login against .env credentials.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();

        $envEmail = env('ADMIN_EMAIL');
        $envPassword = env('ADMIN_PASSWORD');

        if (
            $credentials['email'] !== $envEmail ||
            $credentials['password'] !== $envPassword
        ) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $user = User::firstOrCreate(
            ['email' => $envEmail],
            [
                'password' => Hash::make($envPassword),
                'role' => 'admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // Ensure profile exists
        Profile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'email' => $user->email,
                'first_name' => 'Local',
                'last_name' => 'Admin',
                'middle_name' => null,
                'suffix' => null,
                'mobile_number' => '09000000000',
                'address' => 'GoServePH Office',
                'street' => 'Main Street',
                'barangay' => 'Sample Barangay',
                'city' => 'Sample City',
            ]
        );

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('admin.home');
    }
}
