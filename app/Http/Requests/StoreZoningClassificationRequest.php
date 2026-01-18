<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreZoningClassificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role, ['admin', 'staff', 'superadmin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $clupId = $this->input('clup_id');
        $zoningId = $this->route('id');

        return [
            'clup_id' => ['required', 'integer', 'exists:zcs_db.clup_master,clup_id'],
            'zoning_code' => [
                'required',
                'string',
                'max:10',
                \Illuminate\Validation\Rule::unique('zcs_db.zoning_classification', 'zoning_code')
                    ->where('clup_id', $clupId)
                    ->ignore($zoningId, 'zoning_id'),
            ],
            'zone_name' => ['required', 'string', 'max:100'],
            'land_use_category' => ['nullable', 'string', 'max:50'],
            'allowed_uses' => ['nullable', 'string'],
            'conditional_uses' => ['nullable', 'string'],
            'prohibited_uses' => ['nullable', 'string'],
        ];
    }
}
