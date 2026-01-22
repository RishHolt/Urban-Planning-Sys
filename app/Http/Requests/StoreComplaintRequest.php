<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class StoreComplaintRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'allocation_id' => [
                'required',
                function ($attribute, $value, $fail) {
                    $exists = DB::connection('hbr_db')
                        ->table('allocations')
                        ->where('id', $value)
                        ->exists();

                    if (! $exists) {
                        $fail('The selected allocation does not exist.');
                    }
                },
            ],
            'complaint_type' => ['required', 'in:maintenance,neighbor_dispute,payment_issue,violation,documentation,relocation_request,other'],
            'description' => ['required', 'string', 'max:5000'],
            'priority' => ['nullable', 'in:low,medium,high,urgent'],
        ];
    }
}
