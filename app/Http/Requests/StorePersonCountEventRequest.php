<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonCountEventRequest extends FormRequest
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
            'count' => ['required', 'integer', 'min:0'],
            'timestamp' => ['required', 'integer', 'min:0'], // Unix timestamp in milliseconds
            'device_id' => ['nullable', 'string', 'max:255'],
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
            'count.required' => 'The person count is required.',
            'count.integer' => 'The person count must be an integer.',
            'count.min' => 'The person count cannot be negative.',
            'timestamp.required' => 'The timestamp is required.',
            'timestamp.integer' => 'The timestamp must be an integer.',
            'timestamp.min' => 'The timestamp must be a valid Unix timestamp.',
            'device_id.max' => 'The device ID may not be greater than 255 characters.',
        ];
    }
}
