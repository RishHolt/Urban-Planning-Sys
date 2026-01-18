import { validateEmail, validatePhone, validateRequired, validateCoordinates } from './validation';
import { ZoningApplicationData } from '../pages/Applications/ZoningApplication';

export interface ValidationErrors {
    [key: string]: string;
}

/**
 * Validate Step 1: Applicant Information
 */
export function validateStep1(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.applicantType) {
        errors.applicantType = 'Please select an applicant type.';
    }

    if (data.applicantType === 'individual') {
        if (!validateRequired(data.applicantName)) {
            errors.applicantName = 'Full name is required.';
        }
        if (!data.validId) {
            errors.validId = 'Valid ID is required.';
        }
    } else if (data.applicantType === 'company' || data.applicantType === 'developer' || data.applicantType === 'Government') {
        if (!validateRequired(data.companyName)) {
            errors.companyName = data.applicantType === 'developer' ? 'Developer name is required.' : data.applicantType === 'Government' ? 'Government agency name is required.' : 'Company name is required.';
        }
        if (data.applicantType !== 'Government' && !validateRequired(data.secDtiRegNo)) {
            errors.secDtiRegNo = 'SEC/DTI Registration Number is required.';
        }
        if (!validateRequired(data.authorizedRepresentative)) {
            errors.authorizedRepresentative = 'Authorized Representative is required.';
        }
    }

    if (!validateRequired(data.applicantEmail)) {
        errors.applicantEmail = 'Email address is required.';
    } else if (!validateEmail(data.applicantEmail || '')) {
        errors.applicantEmail = 'Please enter a valid email address.';
    }

    if (!validateRequired(data.applicantContact)) {
        errors.applicantContact = 'Contact number is required.';
    } else if (!validatePhone(data.applicantContact || '')) {
        errors.applicantContact = 'Contact number must be a valid Philippine mobile number (09XXXXXXXXX).';
    }

    if (!data.isPropertyOwner && data.applicantType !== 'Government' && !data.authorizationLetter) {
        errors.authorizationLetter = 'Authorization Letter is required when you are not the property owner.';
    }

    return errors;
}

/**
 * Validate Step 2: Property Owner Information
 */
export function validateStep2(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Skip validation for Government applicants
    if (data.applicantType === 'Government') {
        return errors;
    }

    if (!validateRequired(data.ownerName)) {
        errors.ownerName = 'Owner name is required.';
    }

    if (!validateRequired(data.ownerAddress)) {
        errors.ownerAddress = 'Owner address is required.';
    }

    if (!validateRequired(data.ownerContact)) {
        errors.ownerContact = 'Owner contact number is required.';
    } else if (!validatePhone(data.ownerContact || '')) {
        errors.ownerContact = 'Owner contact number must be a valid Philippine mobile number (09XXXXXXXXX).';
    }

    if (!data.proofOfOwnership) {
        errors.proofOfOwnership = 'Transfer Certificate of Title (TCT) is required.';
    }

    if (data.taxDeclarationType === 'manual') {
        if (!validateRequired(data.taxDeclarationId)) {
            errors.taxDeclarationId = 'Tax Declaration ID is required when using manual input.';
        }
    } else if (data.taxDeclarationType === 'upload') {
        if (!data.taxDeclaration) {
            errors.taxDeclaration = 'Tax Declaration document is required when uploading.';
        }
    }

    return errors;
}

/**
 * Validate Step 3: Property Location
 */
export function validateStep3(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!validateRequired(data.province)) {
        errors.province = 'Province is required.';
    }

    if (!validateRequired(data.municipality)) {
        errors.municipality = 'Municipality/City is required.';
    }

    if (!validateRequired(data.barangay)) {
        errors.barangay = 'Barangay is required.';
    }

    if (data.latitude === undefined || data.longitude === undefined) {
        errors.latitude = 'GPS coordinates are required. Please select a location on the map.';
    } else if (!validateCoordinates(data.latitude, data.longitude)) {
        errors.latitude = 'Invalid GPS coordinates. Please select a valid location on the map.';
    }

    return errors;
}

/**
 * Validate Step 4: Land & Property Details
 */
export function validateStep4(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!validateRequired(data.landType)) {
        errors.landType = 'Land type is required.';
    }

    if (data.hasExistingStructure) {
        if (!data.numberOfBuildings || data.numberOfBuildings < 1) {
            errors.numberOfBuildings = 'Number of buildings is required when there is an existing structure.';
        }
    }

    if (!data.lotArea || data.lotArea <= 0) {
        errors.lotArea = 'Lot area must be greater than 0.';
    }

    return errors;
}

/**
 * Validate Step 5: Proposed Development
 */
export function validateStep5(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.applicationType) {
        errors.applicationType = 'Application type is required.';
    }

    if (!data.proposedUse) {
        errors.proposedUse = 'Proposed use is required.';
    }

    if (data.applicationType === 'new_construction' && !data.siteDevelopmentPlan) {
        errors.siteDevelopmentPlan = 'Site Development Plan is required for new construction.';
    }

    if (data.applicationType === 'renovation') {
        if (!data.existingBuildingPhotos || data.existingBuildingPhotos.length === 0) {
            errors.existingBuildingPhotos = 'Existing building photos are required for renovation.';
        }
    }

    if (data.applicationType === 'change_of_use') {
        if (!validateRequired(data.previousUse)) {
            errors.previousUse = 'Previous use is required for change of use applications.';
        }
        if (!validateRequired(data.justification)) {
            errors.justification = 'Justification is required for change of use applications.';
        }
    }

    return errors;
}

/**
 * Validate Step 6: Documents
 */
export function validateStep6(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};
    const isGovernment = data.applicantType === 'Government';

    if (!data.locationMap) {
        errors.locationMap = 'Location Map is required.';
    }

    if (!data.vicinityMap) {
        errors.vicinityMap = 'Vicinity Map is required.';
    }

    if (isGovernment) {
        // Government-specific document validation
        if (!data.letterOfIntent) {
            errors.letterOfIntent = 'Letter of Intent / Application is required.';
        }

        if (!data.proofOfLegalAuthority) {
            errors.proofOfLegalAuthority = 'Proof of Legal Authority is required.';
        }

        if (!data.endorsementsApprovals) {
            errors.endorsementsApprovals = 'Endorsements / Approvals is required.';
        }

        // environmentalCompliance is optional, no validation needed
    } else {
        // Barangay Clearance validation for non-Government applicants
        if (data.barangayClearanceType === 'manual') {
            if (!validateRequired(data.barangayClearanceId)) {
                errors.barangayClearanceId = 'Barangay Clearance ID is required when using manual input.';
            }
        } else if (data.barangayClearanceType === 'upload') {
            if (!data.barangayClearance) {
                errors.barangayClearance = 'Barangay Clearance document is required when uploading.';
            }
        }
    }

    return errors;
}

/**
 * Validate Step 7: Declarations
 */
export function validateStep7(data: ZoningApplicationData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.declarationOfTruthfulness) {
        errors.declarationOfTruthfulness = 'You must acknowledge the declaration of truthfulness.';
    }

    if (!data.agreementToComply) {
        errors.agreementToComply = 'You must agree to comply with zoning laws.';
    }

    if (!data.dataPrivacyConsent) {
        errors.dataPrivacyConsent = 'You must consent to data privacy terms.';
    }

    if (!data.signature) {
        errors.signature = 'Digital signature is required.';
    }

    if (!validateRequired(data.applicationDate)) {
        errors.applicationDate = 'Application date is required.';
    }

    return errors;
}

/**
 * Validate a specific step
 */
export function validateStep(step: number, data: ZoningApplicationData): ValidationErrors {
    switch (step) {
        case 1:
            return validateStep1(data);
        case 2:
            return validateStep2(data);
        case 3:
            return validateStep3(data);
        case 4:
            return validateStep4(data);
        case 5:
            return validateStep5(data);
        case 6:
            return validateStep6(data);
        case 7:
            return validateStep7(data);
        default:
            return {};
    }
}
