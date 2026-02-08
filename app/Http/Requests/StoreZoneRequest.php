<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreZoneRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'zoning_classification_id' => ['required', 'exists:zoning_classifications,id'],
            'label' => ['nullable', 'string', 'max:100', 'regex:/^ZN-\d{8}$/'], // Optional, but if provided must match format
            'geometry' => ['nullable', 'array'], // GeoJSON Polygon or MultiPolygon
            'is_active' => ['boolean'],
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
            'zoning_classification_id.required' => 'Zoning classification is required.',
            'zoning_classification_id.exists' => 'Selected zoning classification does not exist.',
        ];
    }
}
