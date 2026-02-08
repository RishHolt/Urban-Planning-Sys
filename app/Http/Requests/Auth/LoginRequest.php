<?php

namespace App\Http\Requests\Auth;

use App\Services\RecaptchaService;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'code' => ['sometimes', 'string', 'size:6'],
        ];

        // Only require captcha when not verifying OTP (code not present) and site key is configured
        if (! $this->has('code') && config('services.recaptcha.site_key')) {
            $rules['g-recaptcha-response'] = ['required', 'string'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email is required.',
            'email.email' => 'Please enter a valid email address.',
            'password.required' => 'Password is required.',
            'g-recaptcha-response.required' => 'Please complete the reCAPTCHA verification.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Only verify captcha when not verifying OTP (code not present) and site key is configured
            if (config('services.recaptcha.site_key') && $this->has('g-recaptcha-response') && ! $this->input('code')) {
                $recaptchaService = app(RecaptchaService::class);
                $token = $this->input('g-recaptcha-response');

                if (! $recaptchaService->verify($token, $this->ip())) {
                    $validator->errors()->add(
                        'g-recaptcha-response',
                        'reCAPTCHA verification failed. Please try again.'
                    );
                }
            }
        });
    }
}
