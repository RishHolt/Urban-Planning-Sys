<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class StoreAllocationRequest extends FormRequest
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
            'application_id' => [
                'required',
                function ($attribute, $value, $fail) {
                    $exists = DB::connection('hbr_db')
                        ->table('beneficiary_applications')
                        ->where('id', $value)
                        ->exists();

                    if (! $exists) {
                        $fail('The selected application does not exist.');
                    }
                },
            ],
            'unit_id' => [
                'required',
                function ($attribute, $value, $fail) {
                    $exists = DB::connection('hbr_db')
                        ->table('housing_units')
                        ->where('id', $value)
                        ->exists();

                    if (! $exists) {
                        $fail('The selected unit does not exist.');
                    }
                },
            ],
            'total_contract_price' => ['required', 'numeric', 'min:0'],
            'monthly_amortization' => ['required', 'numeric', 'min:0'],
            'amortization_months' => ['required', 'integer', 'min:1'],
            'special_conditions' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
