import { HousingApplicationFormData, PriorityStatus, DocumentType, CivilStatus } from '../types';
import { documentLabels } from './validation';

export function getDocumentsToShow(data: HousingApplicationFormData): DocumentType[] {
    // Always required documents for all applicants
    const alwaysRequired: DocumentType[] = ['valid_id', 'income_proof', 'barangay_certificate'];
    
    // Documents to show based on conditions
    const conditionalDocs: DocumentType[] = [];
    
    // Marriage certificate only for married status
    if (data.beneficiary.civilStatus === 'married') {
        conditionalDocs.push('marriage_certificate');
    }
    
    // Priority-specific documents - ONLY show if that priority status is selected
    const priorityDocs: Record<PriorityStatus, DocumentType[]> = {
        'none': [],
        'pwd': ['pwd_id'],
        'senior_citizen': ['senior_citizen_id'],
        'solo_parent': ['solo_parent_id'],
        'disaster_victim': ['disaster_certificate'],
        'indigenous': [],
        '': [], // Empty string case
    };
    
    // Get priority documents for current priority status
    const currentPriorityStatus = data.beneficiary.priorityStatus || 'none';
    const priorityDocuments = priorityDocs[currentPriorityStatus] || [];
    
    // Combine all documents that should be shown
    const documentsToShow: DocumentType[] = [
        ...alwaysRequired,
        ...priorityDocuments, // Only priority docs for selected status
        ...conditionalDocs,
    ];
    
    // Remove duplicates (in case of any overlap)
    return Array.from(new Set(documentsToShow));
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
