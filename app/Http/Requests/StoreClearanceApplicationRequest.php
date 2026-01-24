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
        // Validation turning off for testing as requested
        return [
            // Removed: application_category
            'zone_id' => ['nullable'],
            'applicant_type' => ['nullable'], // Updated logic in frontend, simple enum here
            'is_representative' => ['nullable', 'boolean'],
            'contact_number' => ['nullable'],
            'contact_email' => ['nullable'],
            'tax_dec_ref_no' => ['nullable'],
            'barangay_permit_ref_no' => ['nullable'],
            'pin_lat' => ['nullable'],
            'pin_lng' => ['nullable'],
            'lot_address' => ['nullable'],
            'province' => ['nullable'],
            'municipality' => ['nullable'],
            'barangay' => ['nullable'],
            'street_name' => ['nullable'],
            'lot_owner' => ['nullable'],
            'lot_area_total' => ['nullable'],
            'lot_area_used' => ['nullable'],
            'is_subdivision' => ['nullable'],
            'subdivision_name' => ['nullable'],
            'block_no' => ['nullable'],
            'lot_no' => ['nullable'],
            'total_lots_planned' => ['nullable'],
            'has_subdivision_plan' => ['nullable'],
            'land_use_type' => ['nullable'],
            'project_type' => ['nullable'],
            'building_type' => ['nullable'],
            'project_description' => ['nullable'],
            'existing_structure' => ['nullable'],
            'number_of_storeys' => ['nullable'],
            'floor_area_sqm' => ['nullable'],
            'number_of_units' => ['nullable'],
            'purpose' => ['nullable'],
        ];
    }
}
