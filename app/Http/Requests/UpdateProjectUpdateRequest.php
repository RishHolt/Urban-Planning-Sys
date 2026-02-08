<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectUpdateRequest extends FormRequest
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
            'update_description' => ['sometimes', 'required', 'string'],
            'progress_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'issues' => ['nullable', 'string'],
            'next_steps' => ['nullable', 'string'],
        ];
    }
}
