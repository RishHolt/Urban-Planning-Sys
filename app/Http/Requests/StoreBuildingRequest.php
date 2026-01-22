<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBuildingRequest extends FormRequest
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
            'building_code' => ['required', 'string', 'max:30', 'unique:omt_db.BUILDINGS,building_code'],
            'sbr_reference_no' => ['nullable', 'string', 'max:30'],
            'building_permit_no' => ['nullable', 'string', 'max:30'],
            'housing_project_code' => ['nullable', 'string', 'max:30'],
            'building_name' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'pin_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'pin_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'owner_contact' => ['nullable', 'string', 'max:50'],
            'building_type' => ['required', Rule::in(['residential', 'commercial', 'industrial', 'mixed_use', 'institutional'])],
            'structure_source' => ['required', Rule::in(['sbr', 'housing', 'building_permit', 'manual'])],
            'total_floors' => ['required', 'integer', 'min:1'],
            'total_units' => ['required', 'integer', 'min:0'],
            'total_floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'occupancy_status' => ['required', Rule::in(['vacant', 'partially_occupied', 'fully_occupied', 'under_construction', 'condemned'])],
            'certificate_of_occupancy_date' => ['nullable', 'date'],
            'last_inspection_date' => ['nullable', 'date'],
            'next_inspection_date' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ];
    }
}
