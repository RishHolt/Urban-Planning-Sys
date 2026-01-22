<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class OtpVerificationRequest extends FormRequest
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
        return [
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'type' => ['required', 'string', 'in:registration,login,password_reset,email_change'],
        ];
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
            'code.required' => 'Verification code is required.',
            'code.size' => 'Verification code must be 6 digits.',
            'type.required' => 'Verification type is required.',
            'type.in' => 'Invalid verification type.',
        ];
    }
}
