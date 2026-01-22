<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestDocumentsRequest extends FormRequest
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
            'documentTypes' => ['required', 'array', 'min:1'],
            'documentTypes.*' => ['required', 'string', 'in:proof_of_identity,proof_of_income,proof_of_residence,special_eligibility_certificate'],
            'message' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'documentTypes.required' => 'Please select at least one document type to request.',
            'documentTypes.array' => 'Document types must be an array.',
            'documentTypes.min' => 'Please select at least one document type to request.',
            'documentTypes.*.in' => 'Invalid document type selected.',
            'message.required' => 'A message is required when requesting documents.',
            'message.max' => 'Message cannot exceed 1000 characters.',
        ];
    }
}
