<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreZoningApplicationRequest extends FormRequest
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
            'zone_id' => ['required', 'exists:zcs_db.zones,id'],
            'applicant_type' => ['required', 'in:individual,business,developer,institution'],
            'is_representative' => ['required', 'boolean'],
            'representative_name' => ['required_if:is_representative,true', 'nullable', 'string', 'max:255'],
            
            'contact_number' => ['required', 'string', 'max:20'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            
            'tax_dec_ref_no' => ['required', 'string', 'max:50'],
            'barangay_permit_ref_no' => ['required', 'string', 'max:50'],
            
            'pin_lat' => ['nullable', 'numeric'],
            'pin_lng' => ['nullable', 'numeric'],
            
            'lot_address' => ['required', 'string', 'max:500'],
            'province' => ['nullable', 'string', 'max:100'],
            'municipality' => ['nullable', 'string', 'max:100'],
            'barangay' => ['nullable', 'string', 'max:100'],
            'street_name' => ['nullable', 'string', 'max:100'],
            
            'lot_owner' => ['required', 'string', 'max:255'],
            'lot_owner_contact_number' => ['nullable', 'string', 'max:20'],
            'lot_owner_contact_email' => ['nullable', 'email', 'max:255'],
            
            'lot_area_total' => ['required', 'numeric', 'min:0'],
            'lot_area_used' => ['nullable', 'numeric', 'min:0'],
            
            'is_subdivision' => ['required', 'boolean'],
            'subdivision_name' => ['required_if:is_subdivision,true', 'nullable', 'string', 'max:255'],
            'block_no' => ['nullable', 'string', 'max:50'],
            'lot_no' => ['nullable', 'string', 'max:50'],
            'total_lots_planned' => ['nullable', 'integer', 'min:0'],
            'has_subdivision_plan' => ['nullable', 'boolean'],
            
            'land_use_type' => ['required', 'string', 'in:residential,commercial,industrial,agricultural,institutional,mixed_use'],
            'project_type' => ['required', 'string', 'in:new_construction,renovation,addition,change_of_use'],
            'building_type' => ['required', 'string', 'max:255'],
            
            'project_description' => ['required', 'string', 'max:2000'],
            'number_of_storeys' => ['nullable', 'integer', 'min:0'],
            'floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'number_of_units' => ['nullable', 'integer', 'min:0'],
            'purpose' => ['required', 'string', 'max:1000'],
        ];
    }
}
