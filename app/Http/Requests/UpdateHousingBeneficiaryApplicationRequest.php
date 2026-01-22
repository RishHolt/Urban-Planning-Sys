<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHousingBeneficiaryApplicationRequest extends FormRequest
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
        // Similar to StoreHousingBeneficiaryApplicationRequest but all fields are optional
        // since this is for updating draft applications
        return [
            'applicationType' => ['sometimes', 'in:individual,household'],

            // Individual Beneficiary Information
            'beneficiary.firstName' => ['sometimes', 'string', 'max:255'],
            'beneficiary.lastName' => ['sometimes', 'string', 'max:255'],
            'beneficiary.middleName' => ['nullable', 'string', 'max:255'],
            'beneficiary.suffix' => ['nullable', 'string', 'max:10'],
            'beneficiary.birthDate' => ['sometimes', 'date', 'before:today'],
            'beneficiary.gender' => ['nullable', 'in:male,female,other'],
            'beneficiary.civilStatus' => ['nullable', 'string', 'max:50'],
            'beneficiary.email' => ['nullable', 'email', 'max:255'],
            'beneficiary.mobileNumber' => ['sometimes', 'string', 'regex:/^09\d{9}$/'],
            'beneficiary.telephoneNumber' => ['nullable', 'string', 'max:20'],
            'beneficiary.address' => ['sometimes', 'string', 'max:500'],
            'beneficiary.street' => ['nullable', 'string', 'max:255'],
            'beneficiary.barangay' => ['sometimes', 'string', 'max:255'],
            'beneficiary.city' => ['sometimes', 'string', 'max:255'],
            'beneficiary.province' => ['sometimes', 'string', 'max:255'],
            'beneficiary.zipCode' => ['nullable', 'string', 'max:10'],

            // Income/Employment Information
            'beneficiary.employmentStatus' => ['nullable', 'in:employed,unemployed,self_employed,retired,student,other'],
            'beneficiary.occupation' => ['nullable', 'string', 'max:255'],
            'beneficiary.employerName' => ['nullable', 'string', 'max:255'],
            'beneficiary.monthlyIncome' => ['nullable', 'numeric', 'min:0'],
            'beneficiary.householdIncome' => ['nullable', 'numeric', 'min:0'],

            // Eligibility Criteria
            'beneficiary.isIndigent' => ['nullable', 'boolean'],
            'beneficiary.isSeniorCitizen' => ['nullable', 'boolean'],
            'beneficiary.isPwd' => ['nullable', 'boolean'],
            'beneficiary.isSingleParent' => ['nullable', 'boolean'],
            'beneficiary.isVictimOfDisaster' => ['nullable', 'boolean'],
            'beneficiary.specialEligibilityNotes' => ['nullable', 'string', 'max:1000'],

            // Household Information
            'household.householdName' => ['sometimes', 'string', 'max:255'],
            'household.primaryContactMobile' => ['sometimes', 'string', 'regex:/^09\d{9}$/'],
            'household.primaryContactEmail' => ['nullable', 'email', 'max:255'],
            'household.address' => ['sometimes', 'string', 'max:500'],
            'household.barangay' => ['sometimes', 'string', 'max:255'],
            'household.city' => ['sometimes', 'string', 'max:255'],
            'household.province' => ['sometimes', 'string', 'max:255'],
            'household.householdSize' => ['sometimes', 'integer', 'min:1'],
            'household.totalMonthlyIncome' => ['nullable', 'numeric', 'min:0'],

            // Documents
            'documents.proofOfIdentity' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120',
            ],
            'documents.proofOfIncome' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120',
            ],
            'documents.proofOfResidence' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120',
            ],
            'documents.specialEligibilityCertificate' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120',
            ],

            // Application Notes
            'applicationNotes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'beneficiary.mobileNumber.regex' => 'Mobile number must be a valid Philippine mobile number (09XXXXXXXXX).',
            'beneficiary.email.email' => 'Please enter a valid email address.',
            'beneficiary.birthDate.before' => 'Birth date must be in the past.',
            'household.primaryContactMobile.regex' => 'Primary contact mobile number must be a valid Philippine mobile number (09XXXXXXXXX).',
            'documents.proofOfIdentity.mimes' => 'Proof of identity must be a JPEG, PNG, or PDF file.',
            'documents.proofOfIdentity.max' => 'Proof of identity must not exceed 5MB.',
            'documents.proofOfIncome.mimes' => 'Proof of income must be a JPEG, PNG, or PDF file.',
            'documents.proofOfIncome.max' => 'Proof of income must not exceed 5MB.',
            'documents.proofOfResidence.mimes' => 'Proof of residence must be a JPEG, PNG, or PDF file.',
            'documents.proofOfResidence.max' => 'Proof of residence must not exceed 5MB.',
            'documents.specialEligibilityCertificate.mimes' => 'Special eligibility certificate must be a JPEG, PNG, or PDF file.',
            'documents.specialEligibilityCertificate.max' => 'Special eligibility certificate must not exceed 5MB.',
        ];
    }
}
