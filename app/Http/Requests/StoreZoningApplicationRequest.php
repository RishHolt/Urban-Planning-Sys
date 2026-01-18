<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreZoningApplicationRequest extends FormRequest
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
        $isPropertyOwner = $this->boolean('isPropertyOwner');
        $applicantType = $this->input('applicantType');
        $taxDeclarationType = $this->input('taxDeclarationType', 'manual');
        $barangayClearanceType = $this->input('barangayClearanceType', 'manual');
        $applicationType = $this->input('applicationType');
        $hasExistingStructure = $this->boolean('hasExistingStructure');

        return [
            // Step 1: Applicant Information
            'applicantType' => ['required', 'in:individual,company,developer,Government'],
            'applicantName' => [
                'nullable',
                'required_if:applicantType,individual',
                'string',
                'max:255',
            ],
            'applicantEmail' => ['required', 'email', 'max:255'],
            'applicantContact' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'validId' => [
                'nullable',
                'required_if:applicantType,individual',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],
            'companyName' => [
                'nullable',
                Rule::requiredIf(in_array($applicantType, ['company', 'developer', 'Government'])),
                'string',
                'max:255',
            ],
            'secDtiRegNo' => [
                'nullable',
                Rule::requiredIf(in_array($applicantType, ['company', 'developer'])),
                'string',
                'max:255',
            ],
            'authorizedRepresentative' => [
                'nullable',
                Rule::requiredIf(in_array($applicantType, ['company', 'developer', 'Government'])),
                'string',
                'max:255',
            ],
            'isPropertyOwner' => [
                'required',
                'boolean',
            ],
            'authorizationLetter' => [
                'nullable',
                Rule::requiredIf(! $isPropertyOwner && $applicantType !== 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],

            // Step 2: Property Owner Information (not required for Government)
            'ownerName' => [
                'nullable',
                Rule::requiredIf($applicantType !== 'Government'),
                'string',
                'max:255',
            ],
            'ownerAddress' => [
                'nullable',
                Rule::requiredIf($applicantType !== 'Government'),
                'string',
                'max:500',
            ],
            'ownerContact' => [
                'nullable',
                Rule::requiredIf($applicantType !== 'Government'),
                'string',
                'regex:/^09\d{9}$/',
            ],
            'proofOfOwnership' => [
                'nullable',
                Rule::requiredIf($applicantType !== 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'taxDeclarationType' => [
                'nullable',
                Rule::requiredIf($applicantType !== 'Government'),
                'in:manual,upload',
            ],
            'taxDeclarationId' => [
                'nullable',
                Rule::requiredIf($taxDeclarationType === 'manual' && $applicantType !== 'Government'),
                'string',
                'max:255',
            ],
            'taxDeclaration' => [
                'nullable',
                Rule::requiredIf($taxDeclarationType === 'upload' && $applicantType !== 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],

            // Step 3: Property Location
            'province' => ['required', 'string', 'max:255'],
            'municipality' => ['required', 'string', 'max:255'],
            'barangay' => ['required', 'string', 'max:255'],
            'lotNo' => ['nullable', 'string', 'max:100'],
            'blockNo' => ['nullable', 'string', 'max:100'],
            'streetName' => ['nullable', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],

            // Step 4: Land & Property Details
            'landType' => ['required', 'string', 'max:255'],
            'hasExistingStructure' => ['required', 'boolean'],
            'numberOfBuildings' => [
                'nullable',
                Rule::requiredIf($hasExistingStructure),
                'integer',
                'min:1',
            ],
            'lotArea' => ['required', 'numeric', 'min:0.01'],

            // Step 5: Proposed Development
            'applicationType' => ['required', 'in:new_construction,renovation,change_of_use,others'],
            'proposedUse' => ['required', 'in:residential,commercial,mixed_use,institutional'],
            'projectDescription' => ['nullable', 'string', 'max:2000'],
            'siteDevelopmentPlan' => [
                'nullable',
                Rule::requiredIf($applicationType === 'new_construction'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'existingBuildingPhotos' => [
                'nullable',
                Rule::requiredIf($applicationType === 'renovation'),
                'array',
                'min:1',
            ],
            'existingBuildingPhotos.*' => [
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'previousUse' => [
                'nullable',
                Rule::requiredIf($applicationType === 'change_of_use'),
                'string',
                'max:255',
            ],
            'justification' => [
                'nullable',
                Rule::requiredIf($applicationType === 'change_of_use'),
                'string',
                'max:2000',
            ],

            // Step 6: Documents
            'locationMap' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'vicinityMap' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'barangayClearanceType' => [
                'nullable',
                Rule::requiredIf($applicantType !== 'Government'),
                'in:manual,upload',
            ],
            'barangayClearanceId' => [
                'nullable',
                Rule::requiredIf($barangayClearanceType === 'manual' && $applicantType !== 'Government'),
                'string',
                'max:255',
            ],
            'barangayClearance' => [
                'nullable',
                Rule::requiredIf($barangayClearanceType === 'upload' && $applicantType !== 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],
            'letterOfIntent' => [
                'nullable',
                Rule::requiredIf($applicantType === 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'proofOfLegalAuthority' => [
                'nullable',
                Rule::requiredIf($applicantType === 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'endorsementsApprovals' => [
                'nullable',
                Rule::requiredIf($applicantType === 'Government'),
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'environmentalCompliance' => [
                'nullable',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],
            'otherDocuments' => ['nullable', 'array'],
            'otherDocuments.*' => [
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:10240', // 10MB
            ],

            // Step 7: Declarations
            'declarationOfTruthfulness' => ['required', 'accepted'],
            'agreementToComply' => ['required', 'accepted'],
            'dataPrivacyConsent' => ['required', 'accepted'],
            'signature' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,pdf',
                'max:5120', // 5MB
            ],
            'applicationDate' => ['required', 'date'],
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
            // Step 1
            'applicantType.required' => 'Please select an applicant type.',
            'applicantName.required_if' => 'Applicant name is required.',
            'applicantEmail.required' => 'Email address is required.',
            'applicantEmail.email' => 'Please enter a valid email address.',
            'applicantContact.required' => 'Contact number is required.',
            'applicantContact.regex' => 'Contact number must be a valid Philippine mobile number (09XXXXXXXXX).',
            'validId.required_if' => 'Valid ID is required.',
            'validId.mimes' => 'Valid ID must be a JPEG, PNG, or PDF file.',
            'validId.max' => 'Valid ID must not exceed 5MB.',
            'companyName.required_if' => 'Company name is required.',
            'secDtiRegNo.required_if' => 'SEC/DTI Registration Number is required.',
            'authorizedRepresentative.required_if' => 'Authorized Representative is required.',
            'authorizationLetter.required' => 'Authorization Letter is required when you are not the property owner.',
            'authorizationLetter.mimes' => 'Authorization Letter must be a JPEG, PNG, or PDF file.',
            'authorizationLetter.max' => 'Authorization Letter must not exceed 5MB.',

            // Step 2
            'ownerName.required' => 'Owner name is required.',
            'ownerAddress.required' => 'Owner address is required.',
            'ownerContact.required' => 'Owner contact number is required.',
            'ownerContact.regex' => 'Owner contact number must be a valid Philippine mobile number (09XXXXXXXXX).',
            'proofOfOwnership.required' => 'Transfer Certificate of Title (TCT) is required.',
            'proofOfOwnership.mimes' => 'TCT must be a JPEG, PNG, or PDF file.',
            'proofOfOwnership.max' => 'TCT must not exceed 10MB.',
            'taxDeclarationId.required' => 'Tax Declaration ID is required when using manual input.',
            'taxDeclaration.required' => 'Tax Declaration document is required when uploading.',
            'taxDeclaration.mimes' => 'Tax Declaration must be a JPEG, PNG, or PDF file.',
            'taxDeclaration.max' => 'Tax Declaration must not exceed 10MB.',

            // Step 3
            'province.required' => 'Province is required.',
            'municipality.required' => 'Municipality/City is required.',
            'barangay.required' => 'Barangay is required.',
            'latitude.required' => 'GPS coordinates are required. Please select a location on the map.',
            'latitude.between' => 'Invalid latitude value.',
            'longitude.required' => 'GPS coordinates are required. Please select a location on the map.',
            'longitude.between' => 'Invalid longitude value.',

            // Step 4
            'landType.required' => 'Land type is required.',
            'hasExistingStructure.required' => 'Please indicate if there is an existing structure.',
            'numberOfBuildings.required' => 'Number of buildings is required when there is an existing structure.',
            'numberOfBuildings.min' => 'Number of buildings must be at least 1.',
            'lotArea.required' => 'Lot area is required.',
            'lotArea.min' => 'Lot area must be greater than 0.',

            // Step 5
            'applicationType.required' => 'Application type is required.',
            'proposedUse.required' => 'Proposed use is required.',
            'siteDevelopmentPlan.required' => 'Site Development Plan is required for new construction.',
            'siteDevelopmentPlan.mimes' => 'Site Development Plan must be a JPEG, PNG, or PDF file.',
            'siteDevelopmentPlan.max' => 'Site Development Plan must not exceed 10MB.',
            'existingBuildingPhotos.required' => 'Existing building photos are required for renovation.',
            'existingBuildingPhotos.min' => 'At least one existing building photo is required.',
            'existingBuildingPhotos.*.mimes' => 'Building photos must be JPEG, PNG, or PDF files.',
            'existingBuildingPhotos.*.max' => 'Each building photo must not exceed 10MB.',
            'previousUse.required' => 'Previous use is required for change of use applications.',
            'justification.required' => 'Justification is required for change of use applications.',

            // Step 6
            'locationMap.required' => 'Location Map is required.',
            'locationMap.mimes' => 'Location Map must be a JPEG, PNG, or PDF file.',
            'locationMap.max' => 'Location Map must not exceed 10MB.',
            'vicinityMap.required' => 'Vicinity Map is required.',
            'vicinityMap.mimes' => 'Vicinity Map must be a JPEG, PNG, or PDF file.',
            'vicinityMap.max' => 'Vicinity Map must not exceed 10MB.',
            'barangayClearanceType.required' => 'Barangay Clearance type is required.',
            'barangayClearanceId.required' => 'Barangay Clearance ID is required when using manual input.',
            'barangayClearance.required' => 'Barangay Clearance document is required when uploading.',
            'barangayClearance.mimes' => 'Barangay Clearance must be a JPEG, PNG, or PDF file.',
            'barangayClearance.max' => 'Barangay Clearance must not exceed 5MB.',
            'letterOfIntent.required' => 'Letter of Intent / Application is required for Government applicants.',
            'letterOfIntent.mimes' => 'Letter of Intent must be a JPEG, PNG, or PDF file.',
            'letterOfIntent.max' => 'Letter of Intent must not exceed 10MB.',
            'proofOfLegalAuthority.required' => 'Proof of Legal Authority is required for Government applicants.',
            'proofOfLegalAuthority.mimes' => 'Proof of Legal Authority must be a JPEG, PNG, or PDF file.',
            'proofOfLegalAuthority.max' => 'Proof of Legal Authority must not exceed 10MB.',
            'endorsementsApprovals.required' => 'Endorsements / Approvals is required for Government applicants.',
            'endorsementsApprovals.mimes' => 'Endorsements / Approvals must be a JPEG, PNG, or PDF file.',
            'endorsementsApprovals.max' => 'Endorsements / Approvals must not exceed 10MB.',
            'environmentalCompliance.mimes' => 'Environmental Compliance Certificate must be a JPEG, PNG, or PDF file.',
            'environmentalCompliance.max' => 'Environmental Compliance Certificate must not exceed 10MB.',
            'otherDocuments.*.mimes' => 'Other documents must be JPEG, PNG, or PDF files.',
            'otherDocuments.*.max' => 'Each document must not exceed 10MB.',

            // Step 7
            'declarationOfTruthfulness.required' => 'You must acknowledge the declaration of truthfulness.',
            'declarationOfTruthfulness.accepted' => 'You must acknowledge the declaration of truthfulness.',
            'agreementToComply.required' => 'You must agree to comply with zoning laws.',
            'agreementToComply.accepted' => 'You must agree to comply with zoning laws.',
            'dataPrivacyConsent.required' => 'You must consent to data privacy terms.',
            'dataPrivacyConsent.accepted' => 'You must consent to data privacy terms.',
            'signature.required' => 'Digital signature is required.',
            'signature.mimes' => 'Signature must be a JPEG, PNG, or PDF file.',
            'signature.max' => 'Signature must not exceed 5MB.',
            'applicationDate.required' => 'Application date is required.',
        ];
    }
}
