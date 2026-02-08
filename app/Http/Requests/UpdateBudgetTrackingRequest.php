<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBudgetTrackingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phase_id' => ['nullable', 'exists:project_phases,id'],
            'budget_category' => ['sometimes', 'required', Rule::in(['labor', 'materials', 'equipment', 'consultancy', 'contingency', 'other'])],
            'allocated_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'year' => ['sometimes', 'required', 'integer', 'min:2020', 'max:2100'],
            'quarter' => ['sometimes', 'required', 'integer', 'min:1', 'max:4'],
        ];
    }
}
