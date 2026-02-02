<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarangayBoundaryRequest extends FormRequest
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
            'geometry' => ['required', 'array'], // GeoJSON Polygon or MultiPolygon
            'label' => ['required', 'string', 'max:255'], // Barangay name
            'barangay_code' => ['nullable', 'string', 'max:50'],
            'name' => ['nullable', 'string', 'max:255'], // Alias for label
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
            'geometry.required' => 'Boundary geometry is required.',
            'geometry.array' => 'Boundary geometry must be a valid GeoJSON object.',
            'label.required' => 'Barangay name is required.',
        ];
    }
}
