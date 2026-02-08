<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInfrastructureProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['admin', 'staff', 'project_manager']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_name' => ['sometimes', 'required', 'string', 'max:150'],
            'project_description' => ['nullable', 'string'],
            'project_type' => ['sometimes', 'required', Rule::in(['road_construction', 'drainage_system', 'water_supply', 'sewerage', 'electrical', 'multi_utility'])],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'pin_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'pin_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'barangay' => ['nullable', 'string', 'max:100'],
            'budget' => ['sometimes', 'required', 'numeric', 'min:0'],
            'actual_cost' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'target_completion' => ['nullable', 'date', 'after_or_equal:start_date'],
            'actual_completion' => ['nullable', 'date'],
            'status' => ['sometimes', 'required', Rule::in(['planning', 'approved', 'bidding', 'contract_signed', 'ongoing', 'suspended', 'delayed', 'completed', 'cancelled'])],
            'project_manager_id' => ['sometimes', 'required', 'exists:users,id'],
            'scope_of_work' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
