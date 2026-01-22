<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreZoningGisPolygonRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && in_array($user->role, ['admin', 'staff']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'zoning_id' => ['required', 'integer', 'exists:zcs_db.zoning_classification,zoning_id'],
            'barangay' => ['nullable', 'string', 'max:100'],
            'area_sqm' => ['nullable', 'numeric', 'min:0'],
            'geometry' => ['required', 'array'], // GeoJSON as array
        ];
    }
}
