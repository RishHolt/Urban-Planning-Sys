<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSiteVisitRequest extends FormRequest
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
                    $exists = DB
                        ->table('beneficiary_applications')
                        ->where('id', $value)
                        ->exists();

                    if (! $exists) {
                        $fail('The selected application does not exist.');
                    }
                },
            ],
            'scheduled_date' => ['required', 'date', 'after:today'],
            'address_visited' => ['required', 'string', 'max:500'],
        ];
    }
}
