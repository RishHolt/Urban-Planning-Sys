<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubdivisionStageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stage' => ['required', Rule::in(['concept', 'preliminary', 'improvement', 'final'])],
            'result' => ['required', Rule::in(['approved', 'revision_required', 'denied'])],
            'findings' => ['nullable', 'string'],
            'recommendations' => ['nullable', 'string'],
        ];
    }
}
