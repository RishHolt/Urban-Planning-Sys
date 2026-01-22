<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\OtpVerificationRequest;
use App\Models\EmailVerification;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OtpVerificationController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Show the OTP verification page.
     */
    public function show(): Response
    {
        $email = session('registration_email') ?? session('login_email');

        if (! $email) {
            return redirect()->route('login');
        }

        return Inertia::render('VerifyOtp', [
            'email' => $email,
            'type' => session('verification_type', 'registration'),
        ]);
    }

    /**
     * Verify OTP code.
     */
    public function verify(OtpVerificationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $isValid = $this->otpService->verifyOtp(
            $validated['email'],
            $validated['code'],
            $validated['type']
        );

        if (! $isValid) {
            return back()->withErrors([
                'code' => 'Invalid or expired verification code. Please try again.',
            ])->onlyInput('code');
        }

        // Handle registration verification
        if ($validated['type'] === 'registration') {
            $userId = $request->session()->pull('registration_user_id');

            if (! $userId) {
                return redirect()->route('login')->withErrors([
                    'email' => 'Registration session expired. Please register again.',
                ]);
            }

            $user = User::findOrFail($userId);
            $user->update(['email_verified_at' => now()]);

            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->forget(['registration_email', 'verification_type']);

            return redirect()->route('user.home');
        }

        // Handle login verification
        if ($validated['type'] === 'login') {
            $userId = $request->session()->pull('login_user_id');

            if (! $userId) {
                return redirect()->route('login')->withErrors([
                    'email' => 'Login session expired. Please try again.',
                ]);
            }

            $user = User::findOrFail($userId);
            Auth::login($user);
            $request->session()->regenerate();
            $request->session()->forget(['login_email', 'verification_type']);

            $role = $user->role ?? 'citizen';

            if (in_array($role, ['admin', 'staff'])) {
                return redirect()->route('admin.home');
            }

            return redirect()->route('user.home');
        }

        return redirect()->route('login');
    }

    /**
     * Resend OTP code.
     */
    public function resend(): RedirectResponse
    {
        $email = session('registration_email') ?? session('login_email');
        $type = session('verification_type', 'registration');

        if (! $email) {
            return redirect()->route('login')->withErrors([
                'email' => 'No verification session found. Please start again.',
            ]);
        }

        try {
            $otp = $this->otpService->resendOtp($email, $type);

            return back()->with([
                'success' => 'Verification code has been resent to your email.',
                'otp_code' => $otp->code, // For browser console testing
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get the latest OTP code for testing (development only).
     */
    public function getOtp(string $email): JsonResponse
    {
        // Only allow in local/development environment
        if (! app()->environment(['local', 'testing'])) {
            return response()->json(['error' => 'Not available in production'], 403);
        }

        $otp = EmailVerification::where('email', $email)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otp) {
            return response()->json(['error' => 'No active OTP found'], 404);
        }

        return response()->json([
            'code' => $otp->code,
            'email' => $otp->email,
            'type' => $otp->type,
            'expires_at' => $otp->expires_at->toIso8601String(),
        ]);
    }
}
