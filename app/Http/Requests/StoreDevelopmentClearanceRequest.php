<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDevelopmentClearanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'project_type' => 'required|in:subdivision_only,subdivision_with_building',
            'zoning_clearance_no' => 'required|string|max:30',
            'applicant_type' => 'required|in:developer,authorized_rep',
            'contact_number' => 'required|string|max:20',
            'contact_email' => 'nullable|email|max:100',
            'pin_lat' => 'required|numeric',
            'pin_lng' => 'required|numeric',
            'project_address' => 'required|string|max:255',
            'developer_name' => 'required|string|max:150',
            'subdivision_name' => 'required|string|max:150',
            'project_description' => 'nullable|string',
            'total_area_sqm' => 'required|numeric|min:0',
            'total_lots_planned' => 'required|integer|min:1',
            'open_space_percentage' => 'required|numeric|min:30|max:100',
        ];

        // Add building fields validation if project_type is subdivision_with_building
        if ($this->input('project_type') === 'subdivision_with_building') {
            $rules['building_type'] = 'required|string|max:50';
            $rules['number_of_floors'] = 'required|integer|min:1';
            $rules['building_footprint_sqm'] = 'required|numeric|min:0';
            $rules['total_floor_area_sqm'] = 'nullable|numeric|min:0';
            $rules['front_setback_m'] = 'nullable|numeric|min:0';
            $rules['rear_setback_m'] = 'nullable|numeric|min:0';
            $rules['side_setback_m'] = 'nullable|numeric|min:0';
            $rules['floor_area_ratio'] = 'nullable|numeric|min:0';
            $rules['building_open_space_sqm'] = 'nullable|numeric|min:0';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'project_type.required' => 'Please select a project type.',
            'project_type.in' => 'Invalid project type selected.',
            'zoning_clearance_no.required' => 'Zoning clearance number is required.',
            'open_space_percentage.min' => 'Open space must be at least 30% to comply with PD 957 regulations.',
            'building_type.required' => 'Building type is required when building structures are part of the project.',
            'number_of_floors.required' => 'Number of floors is required when building structures are part of the project.',
            'building_footprint_sqm.required' => 'Building footprint is required when building structures are part of the project.',
        ];
    }
}
