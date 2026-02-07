<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBeneficiaryApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Application fields (only these can be updated by user)
            'housing_program' => ['sometimes', 'in:socialized_housing,relocation,rental_subsidy,housing_loan'],
            'application_reason' => ['sometimes', 'string', 'max:2000'],
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
            'housing_program.in' => 'Invalid housing program selected.',
            'application_reason.max' => 'Application reason must not exceed 2000 characters.',
        ];
    }
}
