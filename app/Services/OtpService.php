<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\EmailVerification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    /**
     * Generate a random numeric OTP code.
     */
    public function generateCode(int $length = 6): string
    {
        $min = pow(10, $length - 1);
        $max = pow(10, $length) - 1;

        return (string) random_int($min, $max);
    }

    /**
     * Send OTP email to the specified email address.
     */
    public function sendOtp(string $email, string $type): EmailVerification
    {
        // Invalidate any existing unverified OTPs for this email and type
        EmailVerification::where('email', $email)
            ->where('type', $type)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->update(['verified_at' => now()]);

        // Generate new OTP code
        $code = $this->generateCode();

        // Create OTP record
        $otp = EmailVerification::create([
            'email' => $email,
            'code' => $code,
            'type' => $type,
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
            'max_attempts' => 5,
        ]);


        // Send email synchronously (don't queue OTP emails)
        Mail::to($email)->send(new OtpMail($code, $type));

        return $otp;
    }

    /**
     * Verify OTP code.
     */
    public function verifyOtp(string $email, string $code, string $type): bool
    {
        $otp = EmailVerification::forEmail($email)
            ->forType($type)
            ->valid()
            ->where('code', $code)
            ->first();

        if (! $otp) {
            // Increment attempts for the most recent unverified OTP if it exists
            $latestOtp = EmailVerification::forEmail($email)
                ->forType($type)
                ->whereNull('verified_at')
                ->where('expires_at', '>', now())
                ->latest()
                ->first();

            if ($latestOtp && ! $latestOtp->isMaxAttemptsReached()) {
                $latestOtp->incrementAttempts();
            }

            return false;
        }

        // Mark as verified
        $otp->markAsVerified();

        return true;
    }

    /**
     * Check if OTP can be resent (rate limiting: max 3 per hour).
     */
    public function canResend(string $email, string $type): bool
    {
        $oneHourAgo = now()->subHour();

        $recentOtps = EmailVerification::forEmail($email)
            ->forType($type)
            ->where('created_at', '>=', $oneHourAgo)
            ->count();

        return $recentOtps < 3;
    }

    /**
     * Resend OTP with rate limiting.
     */
    public function resendOtp(string $email, string $type): EmailVerification
    {
        if (! $this->canResend($email, $type)) {
            throw new \Exception('Too many resend attempts. Please try again later.');
        }

        return $this->sendOtp($email, $type);
    }

    /**
     * Clean up expired OTP records.
     */
    public function cleanupExpiredOtp(): int
    {
        return EmailVerification::where('expires_at', '<', now())
            ->orWhere(function ($query) {
                $query->whereColumn('attempts', '>=', 'max_attempts')
                    ->whereNull('verified_at');
            })
            ->delete();
    }
}
