<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInspectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'application_id' => ['required', 'exists:zoning_applications,id'],
            'inspector_id' => ['required', 'integer', 'exists:users,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'findings' => ['nullable', 'string'],
            'result' => ['nullable', Rule::in(['pending', 'passed', 'failed'])],
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
            'application_id.required' => 'Please select an application.',
            'application_id.exists' => 'The selected application does not exist.',
            'inspector_id.required' => 'Please select an inspector.',
            'inspector_id.exists' => 'The selected inspector does not exist.',
            'scheduled_date.required' => 'Please select a scheduled date.',
            'scheduled_date.date' => 'The scheduled date must be a valid date.',
            'scheduled_date.after_or_equal' => 'The scheduled date must be today or a future date.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ];
    }
}
