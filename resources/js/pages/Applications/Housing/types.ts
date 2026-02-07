export type Gender = 'male' | 'female' | '';
export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student' | '';
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated' | 'live_in' | '';
export type PriorityStatus = 'none' | 'pwd' | 'senior_citizen' | 'solo_parent' | 'disaster_victim' | 'indigenous' | '';
export type HousingProgram = 'socialized_housing' | 'relocation' | 'rental_subsidy' | 'housing_loan' | '';
export type DocumentType = 'valid_id' | 'birth_certificate' | 'marriage_certificate' | 'income_proof' | 'barangay_certificate' | 'tax_declaration' | 'dswd_certification' | 'pwd_id' | 'senior_citizen_id' | 'solo_parent_id' | 'disaster_certificate';
export type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

export interface HouseholdMember {
    full_name: string;
    relationship: Relationship;
    birth_date: string;
    gender: Gender;
    occupation: string;
    monthly_income: string;
    is_dependent: boolean;
}

export interface HousingApplicationFormData {
    beneficiary: {
        firstName: string;
        lastName: string;
        middleName: string;
        birthDate: string;
        gender: Gender;
        civilStatus: CivilStatus;
        email: string;
        contactNumber: string;
        currentAddress: string;
        barangay: string;
        yearsOfResidency: string;
        employmentStatus: EmploymentStatus;
        monthlyIncome: string;
        hasExistingProperty: boolean;
        priorityStatus: PriorityStatus;
        priorityIdNo: string;
    };
    application: {
        housingProgram: HousingProgram;
        applicationReason: string;
    };
    householdMembers: HouseholdMember[];
    documents: Record<DocumentType, File | null>;
}

export type ValidationErrors = Record<string, string>;
