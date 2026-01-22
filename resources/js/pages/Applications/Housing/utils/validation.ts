import { HousingApplicationFormData, PriorityStatus, DocumentType, ValidationErrors } from '../types';

const documentLabels: Record<DocumentType, string> = {
    valid_id: 'Valid ID',
    birth_certificate: 'Birth Certificate',
    marriage_certificate: 'Marriage Certificate',
    income_proof: 'Proof of Income',
    barangay_certificate: 'Barangay Certificate',
    tax_declaration: 'Tax Declaration',
    dswd_certification: 'DSWD Certification',
    pwd_id: 'PWD ID',
    senior_citizen_id: 'Senior Citizen ID',
    solo_parent_id: 'Solo Parent ID',
    disaster_certificate: 'Disaster Certificate',
};

export function validateStep(step: number, data: HousingApplicationFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    switch (step) {
        case 1: // Personal Info
            if (!data.beneficiary.firstName) errors['beneficiary.firstName'] = 'First name is required';
            if (!data.beneficiary.lastName) errors['beneficiary.lastName'] = 'Last name is required';
            if (!data.beneficiary.birthDate) errors['beneficiary.birthDate'] = 'Birth date is required';
            if (!data.beneficiary.gender) errors['beneficiary.gender'] = 'Gender is required';
            if (!data.beneficiary.civilStatus) errors['beneficiary.civilStatus'] = 'Civil status is required';
            break;
        case 2: // Contact & Address
            if (!data.beneficiary.contactNumber) errors['beneficiary.contactNumber'] = 'Contact number is required';
            if (!data.beneficiary.email) errors['beneficiary.email'] = 'Email is required';
            if (!data.beneficiary.currentAddress) errors['beneficiary.currentAddress'] = 'Current address is required';
            if (!data.beneficiary.barangay) errors['beneficiary.barangay'] = 'Barangay is required';
            if (!data.beneficiary.yearsOfResidency) errors['beneficiary.yearsOfResidency'] = 'Years of residency is required';
            break;
        case 3: // Employment
            if (!data.beneficiary.employmentStatus) errors['beneficiary.employmentStatus'] = 'Employment status is required';
            if (data.beneficiary.employmentStatus === 'employed' && !data.beneficiary.employerName) {
                errors['beneficiary.employerName'] = 'Employer name is required when employed';
            }
            if (!data.beneficiary.monthlyIncome) errors['beneficiary.monthlyIncome'] = 'Monthly income is required';
            break;
        case 4: // Priority Status
            if (!data.beneficiary.priorityStatus) errors['beneficiary.priorityStatus'] = 'Priority status is required';
            if (data.beneficiary.priorityStatus !== 'none' && !data.beneficiary.priorityIdNo) {
                errors['beneficiary.priorityIdNo'] = 'Priority ID number is required';
            }
            break;
        case 5: // Household Members (optional, no validation needed)
            break;
        case 6: // Application Details
            if (!data.application.housingProgram) errors['housing_program'] = 'Housing program is required';
            if (!data.application.applicationReason) errors['application_reason'] = 'Application reason is required';
            break;
        case 7: // Documents
            const requiredDocs = ['valid_id', 'income_proof', 'barangay_certificate'];
            const priorityDocs: Record<PriorityStatus, DocumentType | null> = {
                'none': null,
                'pwd': 'pwd_id',
                'senior_citizen': 'senior_citizen_id',
                'solo_parent': 'solo_parent_id',
                'disaster_victim': 'disaster_certificate',
                'indigenous': null,
            };

            requiredDocs.forEach(doc => {
                if (!data.documents[doc as DocumentType]) {
                    errors[`documents.${doc}`] = `${documentLabels[doc as DocumentType]} is required`;
                }
            });

            // Marriage certificate only required if married
            if (data.beneficiary.civilStatus === 'married' && !data.documents.marriage_certificate) {
                errors['documents.marriage_certificate'] = 'Marriage certificate is required for married applicants';
            }

            if (data.beneficiary.priorityStatus !== 'none') {
                const requiredPriorityDoc = priorityDocs[data.beneficiary.priorityStatus];
                if (requiredPriorityDoc && !data.documents[requiredPriorityDoc]) {
                    errors[`documents.${requiredPriorityDoc}`] = `${documentLabels[requiredPriorityDoc]} is required for your priority status`;
                }
            }
            break;
    }

    return errors;
}

/**
 * Validate a specific field
 */
export function validateField(fieldKey: string, data: HousingApplicationFormData): string | undefined {
    const stepErrors = validateStep(getStepForField(fieldKey), data);
    return stepErrors[fieldKey];
}

/**
 * Get the step number for a given field key
 */
function getStepForField(fieldKey: string): number {
    if (fieldKey.startsWith('beneficiary.firstName') || fieldKey.startsWith('beneficiary.lastName') || 
        fieldKey.startsWith('beneficiary.middleName') || fieldKey.startsWith('beneficiary.birthDate') ||
        fieldKey.startsWith('beneficiary.gender') || fieldKey.startsWith('beneficiary.civilStatus')) {
        return 1;
    }
    if (fieldKey.startsWith('beneficiary.contactNumber') || fieldKey.startsWith('beneficiary.email') ||
        fieldKey.startsWith('beneficiary.currentAddress') || fieldKey.startsWith('beneficiary.barangay') ||
        fieldKey.startsWith('beneficiary.yearsOfResidency')) {
        return 2;
    }
    if (fieldKey.startsWith('beneficiary.employmentStatus') || fieldKey.startsWith('beneficiary.employerName') ||
        fieldKey.startsWith('beneficiary.monthlyIncome')) {
        return 3;
    }
    if (fieldKey.startsWith('beneficiary.priorityStatus') || fieldKey.startsWith('beneficiary.priorityIdNo')) {
        return 4;
    }
    if (fieldKey.startsWith('housing_program') || fieldKey.startsWith('application_reason')) {
        return 6;
    }
    if (fieldKey.startsWith('documents.')) {
        return 7;
    }
    return 1; // Default to step 1
}

export { documentLabels };
