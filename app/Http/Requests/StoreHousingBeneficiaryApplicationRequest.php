<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHousingBeneficiaryApplicationRequest extends FormRequest
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
        $applicationType = $this->input('applicationType', 'individual');

        return [
            // Application Type
            'applicationType' => ['required', 'in:individual,household'],

            // Individual Beneficiary Information (required for individual, optional for household)
            'beneficiary.firstName' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'max:255',
            ],
            'beneficiary.lastName' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'max:255',
            ],
            'beneficiary.middleName' => ['nullable', 'string', 'max:255'],
            'beneficiary.suffix' => ['nullable', 'string', 'max:10'],
            'beneficiary.birthDate' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'date',
                'before:today',
            ],
            'beneficiary.gender' => ['nullable', 'in:male,female,other'],
            'beneficiary.civilStatus' => ['nullable', 'string', 'max:50'],
            'beneficiary.email' => ['nullable', 'email', 'max:255'],
            'beneficiary.mobileNumber' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'regex:/^09\d{9}$/',
            ],
            'beneficiary.telephoneNumber' => ['nullable', 'string', 'max:20'],
            'beneficiary.address' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'max:500',
            ],
            'beneficiary.street' => ['nullable', 'string', 'max:255'],
            'beneficiary.barangay' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'max:255',
            ],
            'beneficiary.city' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'max:255',
            ],
            'beneficiary.province' => [
                'nullable',
                Rule::requiredIf($applicationType === 'individual'),
                'string',
                'max:255',
            ],
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

            // Household Information (required for household type)
            'household.householdName' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'string',
                'max:255',
            ],
            'household.primaryContactMobile' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'string',
                'regex:/^09\d{9}$/',
            ],
            'household.primaryContactEmail' => ['nullable', 'email', 'max:255'],
            'household.address' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'string',
                'max:500',
            ],
            'household.barangay' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'string',
                'max:255',
            ],
            'household.city' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'string',
                'max:255',
            ],
            'household.province' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'string',
                'max:255',
            ],
            'household.householdSize' => [
                'nullable',
                Rule::requiredIf($applicationType === 'household'),
                'integer',
                'min:1',
            ],
            'household.totalMonthlyIncome' => ['nullable', 'numeric', 'min:0'],

            // Documents
            'documents.proofOfIdentity' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],
            'documents.proofOfIncome' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],
            'documents.proofOfResidence' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],
            'documents.specialEligibilityCertificate' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
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
            'applicationType.required' => 'Please select an application type.',
            'beneficiary.firstName.required_if' => 'First name is required for individual applications.',
            'beneficiary.lastName.required_if' => 'Last name is required for individual applications.',
            'beneficiary.birthDate.required_if' => 'Birth date is required for individual applications.',
            'beneficiary.birthDate.before' => 'Birth date must be in the past.',
            'beneficiary.mobileNumber.required_if' => 'Mobile number is required for individual applications.',
            'beneficiary.mobileNumber.regex' => 'Mobile number must be a valid Philippine mobile number (09XXXXXXXXX).',
            'beneficiary.email.email' => 'Please enter a valid email address.',
            'beneficiary.address.required_if' => 'Address is required for individual applications.',
            'beneficiary.barangay.required_if' => 'Barangay is required for individual applications.',
            'beneficiary.city.required_if' => 'City is required for individual applications.',
            'beneficiary.province.required_if' => 'Province is required for individual applications.',
            'household.householdName.required_if' => 'Household name is required for household applications.',
            'household.primaryContactMobile.required_if' => 'Primary contact mobile number is required for household applications.',
            'household.primaryContactMobile.regex' => 'Primary contact mobile number must be a valid Philippine mobile number (09XXXXXXXXX).',
            'household.address.required_if' => 'Address is required for household applications.',
            'household.barangay.required_if' => 'Barangay is required for household applications.',
            'household.city.required_if' => 'City is required for household applications.',
            'household.province.required_if' => 'Province is required for household applications.',
            'household.householdSize.required_if' => 'Household size is required for household applications.',
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
