<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    /**
     * Verify reCAPTCHA token.
     */
    public function verify(string $token, ?string $ip = null): bool
    {
        $secretKey = config('services.recaptcha.secret_key');

        if (! $secretKey) {
            Log::warning('reCAPTCHA secret key not configured');

            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $ip,
            ]);

            $result = $response->json();

            return isset($result['success']) && $result['success'] === true;
        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification failed: '.$e->getMessage());

            return false;
        }
    }
}
