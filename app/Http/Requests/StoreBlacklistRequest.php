<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlacklistRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'beneficiary_id' => [
                'required',
                function ($attribute, $value, $fail) {
                    $exists = DB
                        ->table('beneficiaries')
                        ->where('id', $value)
                        ->exists();

                    if (! $exists) {
                        $fail('The selected beneficiary does not exist.');
                    }
                },
            ],
            'reason' => ['required', 'in:fraud,abandoned_unit,non_payment,subletting,criminal_activity,property_damage,duplicate_benefit,other'],
            'details' => ['required', 'string', 'max:2000'],
        ];
    }
}
