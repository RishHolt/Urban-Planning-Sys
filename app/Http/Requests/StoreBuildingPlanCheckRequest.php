<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBuildingPlanCheckRequest extends FormRequest
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
            'building_review_id' => ['required', 'exists:building_reviews,id'],
            'check_type' => ['required', Rule::in(['safety_sanitation', 'structural', 'deed_restrictions'])],
            'result' => ['required', Rule::in(['passed', 'failed', 'conditional'])],
            'findings' => ['nullable', 'string'],
            'recommendations' => ['nullable', 'string'],
        ];
    }
}
