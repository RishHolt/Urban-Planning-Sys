<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Show the login form.
     */
    public function create(): Response
    {
        return Inertia::render('Login');
    }

    /**
     * Handle an incoming authentication request (Step 1: Password verification).
     */
    public function store(LoginRequest $request): RedirectResponse|Response
    {
        $credentials = $request->validated();

        // Check if OTP code is provided (Step 2: OTP verification)
        if ($request->has('code')) {
            return $this->verifyOtp($request);
        }

        // Step 1: Verify password
        if (! Auth::validate($credentials)) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])->onlyInput('email');
        }

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! $user->is_active) {
            return back()->withErrors([
                'email' => 'Your account is inactive or does not exist.',
            ])->onlyInput('email');
        }

        try {
            // Send OTP
            $otp = $this->otpService->sendOtp($credentials['email'], 'login');

            // Store user ID in session for OTP verification
            $request->session()->put('login_user_id', $user->id);
            $request->session()->put('login_email', $credentials['email']);
            $request->session()->put('verification_type', 'login');

            // Return response with email and OTP code for testing (browser console)
            return back()->with([
                'email' => $credentials['email'],
                'otp_code' => $otp->code, // For browser console testing
            ]);
        } catch (\Exception $e) {
            Log::error('OTP sending failed: '.$e->getMessage(), [
                'email' => $credentials['email'],
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'email' => 'Failed to send verification code. Please try again.',
            ])->onlyInput('email');
        }
    }

    /**
     * Verify OTP code for login (Step 2).
     */
    public function verifyOtp(LoginRequest $request): RedirectResponse
    {
        $email = $request->session()->get('login_email');
        $code = $request->input('code');

        if (! $email || ! $code) {
            return redirect()->route('login')->withErrors([
                'email' => 'Please complete the login process.',
            ]);
        }

        $isValid = $this->otpService->verifyOtp($email, $code, 'login');

        if (! $isValid) {
            return back()->withErrors([
                'code' => 'Invalid or expired verification code. Please try again.',
            ])->onlyInput('code');
        }

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

    /**
     * Resend OTP for login.
     */
    public function resendOtp(LoginRequest $request): RedirectResponse
    {
        $email = $request->session()->get('login_email');

        if (! $email) {
            return redirect()->route('login')->withErrors([
                'email' => 'Please start the login process again.',
            ]);
        }

        try {
            $otp = $this->otpService->resendOtp($email, 'login');

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
}
