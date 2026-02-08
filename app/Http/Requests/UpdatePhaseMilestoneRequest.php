<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePhaseMilestoneRequest extends FormRequest
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
            'milestone_name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'target_date' => ['sometimes', 'required', 'date'],
            'actual_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'required', Rule::in(['pending', 'achieved', 'missed', 'rescheduled'])],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
