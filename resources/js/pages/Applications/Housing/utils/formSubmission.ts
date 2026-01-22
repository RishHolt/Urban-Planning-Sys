import { HousingApplicationFormData, DocumentType } from '../types';

export function prepareFormData(data: HousingApplicationFormData): FormData {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f3985719-de32-427e-9477-49ea0dcf8c68',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'formSubmission.ts:3',message:'prepareFormData entry',data:{hasBeneficiary:!!data.beneficiary,hasApplication:!!data.application},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const formData = new FormData();
    
    // Beneficiary data - convert camelCase to snake_case
    const beneficiaryMap: Record<string, string> = {
        firstName: 'first_name',
        lastName: 'last_name',
        middleName: 'middle_name',
        birthDate: 'birth_date',
        gender: 'gender',
        civilStatus: 'civil_status',
        email: 'email',
        contactNumber: 'contact_number',
        currentAddress: 'current_address',
        barangay: 'barangay',
        yearsOfResidency: 'years_of_residency',
        employmentStatus: 'employment_status',
        employerName: 'employer_name',
        monthlyIncome: 'monthly_income',
        hasExistingProperty: 'has_existing_property',
        priorityStatus: 'priority_status',
        priorityIdNo: 'priority_id_no',
    };
    
    Object.entries(data.beneficiary).forEach(([key, value]) => {
        const snakeKey = beneficiaryMap[key] || key;
        if (value !== null && value !== undefined && value !== '') {
            if (key === 'hasExistingProperty') {
                formData.append(`beneficiary[${snakeKey}]`, value ? '1' : '0');
            } else {
                formData.append(`beneficiary[${snakeKey}]`, value.toString());
            }
        }
    });
    
    // Application data
    formData.append('housing_program', data.application.housingProgram);
    formData.append('application_reason', data.application.applicationReason);
    
    // Household members
    data.householdMembers.forEach((member, index) => {
        formData.append(`household_members[${index}][full_name]`, member.full_name);
        formData.append(`household_members[${index}][relationship]`, member.relationship);
        formData.append(`household_members[${index}][birth_date]`, member.birth_date);
        formData.append(`household_members[${index}][gender]`, member.gender);
        if (member.occupation) {
            formData.append(`household_members[${index}][occupation]`, member.occupation);
        }
        if (member.monthly_income) {
            formData.append(`household_members[${index}][monthly_income]`, member.monthly_income);
        }
        formData.append(`household_members[${index}][is_dependent]`, member.is_dependent ? '1' : '0');
    });
    
    // Documents
    let documentIndex = 0;
    Object.entries(data.documents).forEach(([docType, file]) => {
        if (file) {
            formData.append(`documents[${documentIndex}][document_type]`, docType);
            formData.append(`documents[${documentIndex}][file]`, file);
            documentIndex++;
        }
    });

    // #region agent log
    const entryCount = Array.from(formData.entries()).length;
    fetch('http://127.0.0.1:7242/ingest/f3985719-de32-427e-9477-49ea0dcf8c68',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'formSubmission.ts:67',message:'prepareFormData exit',data:{entryCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    return formData;
}
