import { HousingApplicationFormData, PriorityStatus, DocumentType, CivilStatus } from '../types';
import { documentLabels } from './validation';

export function getDocumentsToShow(data: HousingApplicationFormData): DocumentType[] {
    const alwaysRequired: DocumentType[] = ['valid_id', 'income_proof', 'barangay_certificate'];
    const optional: DocumentType[] = ['birth_certificate', 'dswd_certification'];
    
    // Conditionally add documents based on civil status
    const conditionalDocs: DocumentType[] = [];
    
    // Marriage certificate only for married status
    if (data.beneficiary.civilStatus === 'married') {
        conditionalDocs.push('marriage_certificate');
    }
    
    // Tax declaration - only show if user has existing property (might need it for property verification)
    // Actually, let's remove tax_declaration as it's not typically needed for housing applications
    // If needed later, we can add it back conditionally
    
    const priorityDocs: Record<PriorityStatus, DocumentType[]> = {
        'none': [],
        'pwd': ['pwd_id'],
        'senior_citizen': ['senior_citizen_id'],
        'solo_parent': ['solo_parent_id'],
        'disaster_victim': ['disaster_certificate'],
        'indigenous': [],
    };
    
    return [
        ...alwaysRequired,
        ...(priorityDocs[data.beneficiary.priorityStatus] || []),
        ...conditionalDocs,
        ...optional,
    ];
}

export function isDocumentRequired(
    docType: DocumentType, 
    priorityStatus: PriorityStatus, 
    civilStatus?: CivilStatus
): boolean {
    const requiredDocs: DocumentType[] = ['valid_id', 'income_proof', 'barangay_certificate'];
    const priorityDocs: Record<PriorityStatus, DocumentType | null> = {
        'none': null,
        'pwd': 'pwd_id',
        'senior_citizen': 'senior_citizen_id',
        'solo_parent': 'solo_parent_id',
        'disaster_victim': 'disaster_certificate',
        'indigenous': null,
    };

    if (requiredDocs.includes(docType)) {
        return true;
    }

    // Marriage certificate only required if married
    if (docType === 'marriage_certificate') {
        return civilStatus === 'married';
    }

    if (priorityStatus !== 'none' && priorityDocs[priorityStatus] === docType) {
        return true;
    }

    return false;
}

export { documentLabels };
