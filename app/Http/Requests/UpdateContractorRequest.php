<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContractorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['admin', 'staff']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['sometimes', 'required', 'string', 'max:150'],
            'contact_person' => ['sometimes', 'required', 'string', 'max:150'],
            'contact_number' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'contractor_type' => ['sometimes', 'required', Rule::in(['general_contractor', 'subcontractor', 'supplier', 'consultant'])],
            'is_active' => ['boolean'],
        ];
    }
}
