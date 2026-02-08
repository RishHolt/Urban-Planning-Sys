<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user exists
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // User exists, check if active
                if (! $user->is_active) {
                    return redirect()->route('login')->withErrors([
                        'email' => 'Your account is inactive. Please contact support.',
                    ]);
                }

                // Update email_verified_at if not already verified
                if (! $user->email_verified_at) {
                    $user->update(['email_verified_at' => now()]);
                }

                Auth::login($user);
            } else {
                // Create new user
                DB::transaction(function () use ($googleUser, &$user) {
                    $nameParts = $this->parseName($googleUser->getName());

                    $user = User::create([
                        'email' => $googleUser->getEmail(),
                        'password' => bcrypt(str()->random(32)), // Random password since Google handles auth
                        'role' => 'citizen',
                        'is_active' => true,
                        'email_verified_at' => now(), // Google email is already verified
                    ]);

                    // Create profile
                    $user->profile()->create([
                        'email' => $googleUser->getEmail(),
                        'first_name' => $nameParts['first_name'],
                        'last_name' => $nameParts['last_name'],
                        'middle_name' => $nameParts['middle_name'],
                    ]);
                });

                Auth::login($user);
            }

            $request = request();
            $request->session()->regenerate();

            $role = $user->role ?? 'citizen';

            if (in_array($role, ['admin', 'staff'])) {
                return redirect()->route('admin.home');
            }

            return redirect()->route('user.home');
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Google authentication failed. Please try again.',
            ]);
        }
    }

    /**
     * Parse full name into first, middle, and last name.
     */
    private function parseName(string $fullName): array
    {
        $parts = explode(' ', trim($fullName));
        $count = count($parts);

        if ($count === 1) {
            return [
                'first_name' => $parts[0],
                'last_name' => '',
                'middle_name' => null,
            ];
        }

        if ($count === 2) {
            return [
                'first_name' => $parts[0],
                'last_name' => $parts[1],
                'middle_name' => null,
            ];
        }

        // 3 or more parts: first, middle(s), last
        return [
            'first_name' => $parts[0],
            'last_name' => $parts[$count - 1],
            'middle_name' => implode(' ', array_slice($parts, 1, $count - 2)),
        ];
    }
}
