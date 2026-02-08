<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectPhotoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['admin', 'staff', 'project_manager', 'inspector']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photo_description' => ['nullable', 'string', 'max:255'],
            'photo_category' => ['sometimes', 'required', Rule::in(['progress', 'milestone', 'inspection', 'before_after', 'deficiency', 'completion', 'as_built', 'other'])],
            'taken_at' => ['nullable', 'date'],
        ];
    }
}
