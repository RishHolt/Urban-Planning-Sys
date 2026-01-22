<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClearanceApplicationRequest extends FormRequest
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
        $category = $this->input('application_category');

        $rules = [
            // Basic Info
            'application_category' => ['required', Rule::in(['individual_lot', 'subdivision_development'])],
            'zone_id' => ['required', 'exists:zcs_db.zones,id'],
            'applicant_type' => ['required', Rule::in(['owner', 'authorized_rep', 'contractor'])],
            'contact_number' => ['required', 'string', 'max:20'],
            'contact_email' => ['nullable', 'email', 'max:100'],

            // Prerequisites
            'tax_dec_ref_no' => ['required', 'string', 'max:50'],
            'barangay_permit_ref_no' => ['required', 'string', 'max:50'],

            // Location
            'pin_lat' => ['required', 'numeric', 'between:-90,90'],
            'pin_lng' => ['required', 'numeric', 'between:-180,180'],

            // Property Info
            'lot_address' => ['required', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'barangay' => ['nullable', 'string', 'max:100'],
            'street_name' => ['nullable', 'string', 'max:255'],
            'lot_owner' => ['required', 'string', 'max:150'],
            'lot_area_total' => ['required', 'numeric', 'min:0'],

            // Subdivision Info
            'is_subdivision' => ['required', 'boolean'],
            'subdivision_name' => ['nullable', 'string', 'max:100'],
            'block_no' => ['nullable', 'string', 'max:20'],
            'lot_no' => ['nullable', 'string', 'max:20'],
            'total_lots_planned' => ['nullable', 'integer', 'min:1'],
            'has_subdivision_plan' => ['nullable', 'boolean'],

            // Project Details
            'land_use_type' => ['required', Rule::in(['residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use'])],
            'project_type' => ['required', Rule::in(['new_construction', 'renovation', 'addition', 'change_of_use'])],
            'building_type' => ['nullable', 'string', 'max:100'],
            'project_description' => ['required', 'string'],
            'existing_structure' => ['required', Rule::in(['none', 'existing_to_retain', 'existing_to_demolish', 'existing_to_renovate'])],
            'number_of_storeys' => ['nullable', 'integer', 'min:1'],
            'floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'purpose' => ['required', 'string'],
        ];

        // Category-specific validation
        if ($category === 'individual_lot') {
            $rules['building_type'] = ['nullable', 'string', 'max:100'];
            $rules['number_of_storeys'] = ['nullable', 'integer', 'min:1'];
            $rules['floor_area_sqm'] = ['nullable', 'numeric', 'min:0'];

            // If in subdivision, require subdivision fields
            if ($this->input('is_subdivision')) {
                $rules['subdivision_name'] = ['required', 'string', 'max:100'];
                $rules['block_no'] = ['required', 'string', 'max:20'];
                $rules['lot_no'] = ['required', 'string', 'max:20'];
            }
        } elseif ($category === 'subdivision_development') {
            $rules['subdivision_name'] = ['required', 'string', 'max:100'];
            $rules['total_lots_planned'] = ['required', 'integer', 'min:1'];
            $rules['has_subdivision_plan'] = ['required', 'boolean', 'accepted'];
        }

        return $rules;
    }
}
