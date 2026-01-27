<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IssueClearanceRequest extends FormRequest
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
            'application_id' => ['required', 'exists:zcs_db.zoning_applications,id'],
            'issue_date' => ['required', 'date'],
            'valid_until' => ['nullable', 'date', 'after:issue_date'],
            'conditions' => ['nullable', 'string'],
        ];
    }
}
