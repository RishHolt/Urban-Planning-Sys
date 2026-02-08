<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHousingProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['staff', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_code' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) {
                    $exists = DB
                        ->table('housing_projects')
                        ->where('project_code', $value)
                        ->exists();

                    if ($exists) {
                        $fail('The project code has already been taken.');
                    }
                },
            ],
            'project_name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:500'],
            'barangay' => ['required', 'string', 'max:255'],
            'zoning_clearance_no' => ['nullable', 'string', 'max:30'],
            'project_source' => ['required', 'in:lgu_built,nha,shfc,private_developer'],
            'housing_program' => ['required', 'in:socialized_housing,relocation,rental_subsidy,housing_loan'],
            'total_units' => ['required', 'integer', 'min:1'],
            'lot_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'unit_floor_area_sqm' => ['nullable', 'numeric', 'min:0'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'monthly_amortization' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
