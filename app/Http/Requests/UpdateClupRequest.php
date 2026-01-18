<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'lgu_name' => ['required', 'string', 'max:150'],
            'coverage_start_year' => ['required', 'integer', 'min:1900', 'max:2100'],
            'coverage_end_year' => [
                'required',
                'integer',
                'min:1900',
                'max:2100',
                'gt:coverage_start_year',
                function ($attribute, $value, $fail) {
                    $startYear = (int) $this->input('coverage_start_year');
                    $endYear = (int) $value;
                    
                    if ($startYear && $endYear) {
                        $yearsDifference = $endYear - $startYear;
                        if ($yearsDifference < 10 || $yearsDifference > 12) {
                            $fail('Coverage period should be 10 to 12 years.');
                        }
                    }
                },
            ],
            'approval_date' => ['required', 'date'],
            'approving_body' => ['nullable', 'string', 'max:150'],
            'resolution_no' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:Active,Archived'],
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'coverage_end_year.gt' => 'Coverage period should be 10 to 12 years. The end year must be greater than the start year.',
        ];
    }
}
