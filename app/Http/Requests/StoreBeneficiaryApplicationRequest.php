<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBeneficiaryApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('beneficiary.has_existing_property')) {
            $beneficiary = $this->input('beneficiary', []);
            $beneficiary['has_existing_property'] = filter_var(
                $this->input('beneficiary.has_existing_property'),
                FILTER_VALIDATE_BOOLEAN
            );
            $this->merge(['beneficiary' => $beneficiary]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $employmentStatus = $this->input('beneficiary.employment_status');
        $priorityStatus = $this->input('beneficiary.priority_status');

        return [
            // Beneficiary fields
            'beneficiary.first_name' => ['required', 'string', 'max:255'],
            'beneficiary.last_name' => ['required', 'string', 'max:255'],
            'beneficiary.middle_name' => ['nullable', 'string', 'max:255'],
            'beneficiary.birth_date' => ['required', 'date'],
            'beneficiary.gender' => ['required', 'in:male,female'],
            'beneficiary.civil_status' => ['required', 'in:single,married,widowed,separated,live_in'],
            'beneficiary.email' => ['required', 'email', 'max:255'],
            'beneficiary.contact_number' => ['required', 'string', 'max:20'],
            'beneficiary.current_address' => ['required', 'string', 'max:500'],
            'beneficiary.barangay' => ['required', 'string', 'max:100'],
            'beneficiary.years_of_residency' => ['required', 'integer', 'min:0'],
            'beneficiary.employment_status' => ['required', 'in:employed,self_employed,unemployed,retired,student'],
            'beneficiary.employer_name' => [
                'nullable',
                Rule::requiredIf($employmentStatus === 'employed'),
                'string',
                'max:255',
            ],
            'beneficiary.monthly_income' => ['required', 'numeric', 'min:0'],
            'beneficiary.has_existing_property' => ['boolean'],
            'beneficiary.priority_status' => ['required', 'in:none,pwd,senior_citizen,solo_parent,disaster_victim,indigenous'],
            'beneficiary.priority_id_no' => [
                'nullable',
                Rule::requiredIf($priorityStatus !== 'none'),
                'string',
                'max:100',
            ],

            // Application fields
            'housing_program' => ['required', 'in:socialized_housing,relocation,rental_subsidy,housing_loan'],
            'application_reason' => ['required', 'string', 'max:2000'],

            // Documents
            'documents' => ['required', 'array', 'min:1'],
            'documents.*.document_type' => ['required', 'in:valid_id,birth_certificate,marriage_certificate,income_proof,barangay_certificate,tax_declaration,dswd_certification,pwd_id,senior_citizen_id,solo_parent_id,disaster_certificate'],
            'documents.*.file' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],

            // Household members
            'household_members' => ['nullable', 'array'],
            'household_members.*.full_name' => ['required', 'string', 'max:255'],
            'household_members.*.relationship' => ['required', 'in:spouse,child,parent,sibling,other'],
            'household_members.*.birth_date' => ['required', 'date', 'before:today'],
            'household_members.*.gender' => ['required', 'in:male,female'],
            'household_members.*.occupation' => ['nullable', 'string', 'max:255'],
            'household_members.*.monthly_income' => ['nullable', 'numeric', 'min:0'],
            'household_members.*.is_dependent' => ['boolean'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $priorityStatus = $this->input('beneficiary.priority_status');
            $civilStatus = $this->input('beneficiary.civil_status');
            $documents = $this->input('documents', []);
            $documentTypes = array_column($documents, 'document_type');

            // Check required documents
            $requiredDocs = ['valid_id', 'income_proof', 'barangay_certificate'];
            foreach ($requiredDocs as $doc) {
                if (! in_array($doc, $documentTypes)) {
                    $validator->errors()->add(
                        'documents',
                        "Required document missing: {$doc}"
                    );
                }
            }

            // Check marriage certificate - only required if married
            if ($civilStatus === 'married' && ! in_array('marriage_certificate', $documentTypes)) {
                $validator->errors()->add(
                    'documents',
                    'Marriage certificate is required for married applicants'
                );
            }

            // Check priority-specific documents
            $priorityDocs = [
                'pwd' => 'pwd_id',
                'senior_citizen' => 'senior_citizen_id',
                'solo_parent' => 'solo_parent_id',
                'disaster_victim' => 'disaster_certificate',
            ];

            if ($priorityStatus !== 'none' && isset($priorityDocs[$priorityStatus])) {
                $requiredDoc = $priorityDocs[$priorityStatus];
                if (! in_array($requiredDoc, $documentTypes)) {
                    $validator->errors()->add(
                        'documents',
                        "Priority document required: {$requiredDoc}"
                    );
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'beneficiary_id.required' => 'Beneficiary is required.',
            'beneficiary_id.exists' => 'Selected beneficiary does not exist.',
            'housing_program.required' => 'Housing program is required.',
            'housing_program.in' => 'Invalid housing program selected.',
            'application_reason.required' => 'Application reason is required.',
            'documents.required' => 'At least one document is required.',
            'documents.min' => 'At least one document is required.',
            'documents.*.file.required' => 'Document file is required.',
            'documents.*.file.mimes' => 'Document must be a JPEG, PNG, or PDF file.',
            'documents.*.file.max' => 'Document must not exceed 10MB.',
        ];
    }
}
