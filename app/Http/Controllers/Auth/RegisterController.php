<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Profile;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Handle a registration request.
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $otp = null;

        DB::transaction(function () use ($validated, $request, &$otp) {
            // Create User
            $user = User::create([
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'citizen',
                'is_active' => true,
            ]);

            // Create Profile
            $user->profile()->create([
                'email' => $validated['email'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'suffix' => $validated['suffix'] ?? null,
                'mobile_number' => $validated['mobile_number'],
                'address' => $validated['address'],
                'street' => $validated['street'],
                'barangay' => $validated['barangay'],
                'city' => $validated['city'],
            ]);

            // Send OTP
            $otp = $this->otpService->sendOtp($validated['email'], 'registration');

            // Store user ID in session for OTP verification
            $request->session()->put('registration_user_id', $user->id);
            $request->session()->put('registration_email', $validated['email']);
            $request->session()->put('verification_type', 'registration');
        });

        // Return response with email and OTP code for testing (browser console)
        return redirect()->route('verify-otp.show')->with([
            'email' => $validated['email'],
            'otp_code' => $otp?->code, // For browser console testing
            'type' => 'registration',
        ]);
    }
}
