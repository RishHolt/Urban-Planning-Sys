<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConductInspectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['admin', 'staff', 'inspector']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'inspection_date' => ['nullable', 'date'],
            'findings' => ['required', 'string'],
            'deficiencies' => ['nullable', 'string'],
            'result' => ['required', Rule::in(['passed', 'failed', 'conditional'])],
            'recommendations' => ['nullable', 'string'],
            'next_inspection_date' => ['nullable', 'date', 'after:inspection_date'],
        ];
    }
}
