<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBeneficiaryProfileRequest extends FormRequest
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
        $employmentStatus = $this->input('employment_status');
        $priorityStatus = $this->input('priority_status');

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'birth_date' => ['sometimes', 'required', 'date'],
            'gender' => ['sometimes', 'required', 'in:male,female'],
            'civil_status' => ['sometimes', 'required', 'in:single,married,widowed,separated,live_in'],
            'email' => ['sometimes', 'required', 'email', 'max:255'],
            'contact_number' => ['sometimes', 'required', 'string', 'max:20'],
            'telephone_number' => ['nullable', 'string', 'max:20'],
            'current_address' => ['sometimes', 'required', 'string', 'max:500'],
            'address' => ['nullable', 'string', 'max:500'],
            'street' => ['nullable', 'string', 'max:255'],
            'barangay' => ['sometimes', 'required', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['nullable', 'string', 'max:10'],
            'years_of_residency' => ['sometimes', 'required', 'integer', 'min:0'],
            'employment_status' => ['sometimes', 'required', 'in:employed,self_employed,unemployed,retired,student'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'monthly_income' => ['sometimes', 'required', 'numeric', 'min:0'],
            'household_income' => ['nullable', 'numeric', 'min:0'],
            'has_existing_property' => ['nullable', 'boolean'],
            'priority_status' => ['sometimes', 'required', 'in:none,pwd,senior_citizen,solo_parent,disaster_victim,indigenous'],
            'priority_id_no' => [
                'nullable',
                Rule::requiredIf($priorityStatus !== 'none'),
                'string',
                'max:100',
            ],
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
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'birth_date.required' => 'Birth date is required.',
            'gender.required' => 'Gender is required.',
            'civil_status.required' => 'Civil status is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Please provide a valid email address.',
            'contact_number.required' => 'Contact number is required.',
            'current_address.required' => 'Current address is required.',
            'barangay.required' => 'Barangay is required.',
            'years_of_residency.required' => 'Years of residency is required.',
            'employment_status.required' => 'Employment status is required.',
            'monthly_income.required' => 'Monthly income is required.',
            'priority_status.required' => 'Priority status is required.',
        ];
    }
}
