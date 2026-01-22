<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubdivisionApplicationRequest extends FormRequest
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
            'zoning_clearance_no' => ['required', 'string', 'max:30'],
            'applicant_type' => ['required', Rule::in(['developer', 'authorized_rep'])],
            'contact_number' => ['required', 'string', 'max:20'],
            'contact_email' => ['nullable', 'email', 'max:100'],
            'pin_lat' => ['required', 'numeric', 'between:-90,90'],
            'pin_lng' => ['required', 'numeric', 'between:-180,180'],
            'project_address' => ['required', 'string', 'max:255'],
            'developer_name' => ['required', 'string', 'max:150'],
            'subdivision_name' => ['required', 'string', 'max:150'],
            'project_description' => ['nullable', 'string'],
            'total_area_sqm' => ['required', 'numeric', 'min:0'],
            'total_lots_planned' => ['required', 'integer', 'min:1'],
            'open_space_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
