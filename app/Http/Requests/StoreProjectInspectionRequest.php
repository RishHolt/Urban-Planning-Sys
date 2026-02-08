<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectInspectionRequest extends FormRequest
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
            'inspection_type' => ['required', Rule::in(['pre_construction', 'material_inspection', 'progress_inspection', 'milestone_inspection', 'final_inspection', 'follow_up'])],
            'phase_id' => ['nullable', 'exists:project_phases,id'],
            'inspector_id' => ['required', 'exists:users,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
        ];
    }
}
