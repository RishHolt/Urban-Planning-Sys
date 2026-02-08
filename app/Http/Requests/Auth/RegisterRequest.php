<?php

namespace App\Http\Requests\Auth;

use App\Services\RecaptchaService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            // User fields
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],

            // Profile fields
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],
            'street' => ['required', 'string', 'max:255'],
            'barangay' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
        ];

        // Only require reCAPTCHA if site key is configured
        if (config('services.recaptcha.site_key')) {
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
            'email.unique' => 'This email is already registered.',
            'password.required' => 'Password is required.',
            'password.confirmed' => 'Password confirmation does not match.',
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'mobile_number.required' => 'Mobile number is required.',
            'address.required' => 'Address is required.',
            'street.required' => 'Street is required.',
            'barangay.required' => 'Barangay is required.',
            'city.required' => 'City is required.',
            'g-recaptcha-response.required' => 'Please complete the reCAPTCHA verification.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Only verify captcha if site key is configured and token is provided
            if (config('services.recaptcha.site_key') && $this->has('g-recaptcha-response')) {
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
