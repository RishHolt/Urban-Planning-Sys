---
name: Housing Form Backend-Frontend Alignment
overview: Fix backend mismatches first, then align frontend. Address document handling bug, conditional validation, household members, and form validation.
todos:
  - id: fix-document-handling
    content: Fix document handling bug in controller - use validated array instead of hasFile
    status: pending
  - id: fix-boolean-conversion
    content: Fix has_existing_property boolean conversion from string
    status: pending
  - id: add-conditional-validation
    content: Add conditional validation rules (employer_name, priority_id_no, priority documents)
    status: pending
  - id: add-household-members-backend
    content: Add household members handling in controller and validation
    status: pending
  - id: fix-frontend-form-data
    content: Align frontend form data structure with backend expectations
    status: pending
  - id: add-household-members-frontend
    content: Add household members section to frontend form
    status: pending
  - id: implement-form-validation
    content: Implement proper step-by-step validation with on-blur validation
    status: pending
  - id: conditional-employer-field
    content: Make Employer Name conditional - only show when employed
    status: pending
  - id: conditional-documents-frontend
    content: Make document uploads conditional based on priority status
    status: pending
---

# Housing Form Backend-Frontend Alignment Plan

## Overview

Fix backend issues first, then align frontend. This ensures the backend can properly handle the data before updating the frontend.

## Phase 1: Fix Backend Issues

### 1. Fix Document Handling Bug

**File**: `app/Http/Controllers/HousingBeneficiaryController.php`

**Current Issue**:
```php
// Line 294 - WRONG: Trying to access files by document_type key
if ($request->hasFile("documents.{$documentType}")) {
    $file = $request->file("documents.{$documentType}");
```

**Frontend sends**: `documents[0][document_type]` and `documents[0][file]`

**Fix**: Use the validated array structure:
```php
foreach ($validated['documents'] as $documentData) {
    if (isset($documentData['file']) && $documentData['file']->isValid()) {
        $file = $documentData['file'];
        $documentType = $documentData['document_type'];
        // ... rest of logic
    }
}
```

### 2. Fix Boolean Conversion

**File**: `app/Http/Requests/StoreBeneficiaryApplicationRequest.php`

**Current Issue**: Frontend sends `'1'` or `'0'` as string, but validation expects boolean

**Fix Options**:
- Option A: Add custom prepareForValidation() to convert string to boolean
- Option B: Change validation to accept string and convert in controller

**Recommended**: Option A - Add to FormRequest:
```php
protected function prepareForValidation(): void
{
    if ($this->has('beneficiary.has_existing_property')) {
        $this->merge([
            'beneficiary' => array_merge(
                $this->input('beneficiary', []),
                [
                    'has_existing_property' => filter_var(
                        $this->input('beneficiary.has_existing_property'),
                        FILTER_VALIDATE_BOOLEAN
                    )
                ]
            )
        ]);
    }
}
```

### 3. Add Conditional Validation Rules

**File**: `app/Http/Requests/StoreBeneficiaryApplicationRequest.php`

**Add Rules**:
- `employer_name`: Required when `employment_status === 'employed'`
- `priority_id_no`: Required when `priority_status !== 'none'`
- Priority documents: Conditionally required based on priority_status

**Implementation**:
```php
public function rules(): array
{
    $employmentStatus = $this->input('beneficiary.employment_status');
    $priorityStatus = $this->input('beneficiary.priority_status');
    
    return [
        // ... existing rules ...
        
        'beneficiary.employer_name' => [
            'nullable',
            Rule::requiredIf($employmentStatus === 'employed'),
            'string',
            'max:255',
        ],
        
        'beneficiary.priority_id_no' => [
            'nullable',
            Rule::requiredIf($priorityStatus !== 'none'),
            'string',
            'max:100',
        ],
        
        // Conditional document validation
        'documents' => ['required', 'array', 'min:1'],
        'documents.*.document_type' => ['required', 'in:valid_id,birth_certificate,...'],
        'documents.*.file' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
    ];
}

// Add custom validation method
public function withValidator($validator): void
{
    $validator->after(function ($validator) {
        $priorityStatus = $this->input('beneficiary.priority_status');
        $documents = $this->input('documents', []);
        $documentTypes = array_column($documents, 'document_type');
        
        // Check required documents
        $requiredDocs = ['valid_id', 'income_proof', 'barangay_certificate'];
        foreach ($requiredDocs as $doc) {
            if (!in_array($doc, $documentTypes)) {
                $validator->errors()->add(
                    'documents',
                    "Required document missing: {$doc}"
                );
            }
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
            if (!in_array($requiredDoc, $documentTypes)) {
                $validator->errors()->add(
                    'documents',
                    "Priority document required: {$requiredDoc}"
                );
            }
        }
    });
}
```

### 4. Add Household Members Handling

**Files**:
- `app/Http/Requests/StoreBeneficiaryApplicationRequest.php` - Add validation
- `app/Http/Controllers/HousingBeneficiaryController.php` - Add storage logic

**Validation Rules**:
```php
'household_members' => ['nullable', 'array'],
'household_members.*.full_name' => ['required', 'string', 'max:255'],
'household_members.*.relationship' => ['required', 'in:spouse,child,parent,sibling,other'],
'household_members.*.birth_date' => ['required', 'date', 'before:today'],
'household_members.*.gender' => ['required', 'in:male,female'],
'household_members.*.occupation' => ['nullable', 'string', 'max:255'],
'household_members.*.monthly_income' => ['nullable', 'numeric', 'min:0'],
'household_members.*.is_dependent' => ['boolean'],
```

**Controller Logic**:
```php
// After creating beneficiary
if (isset($validated['household_members']) && is_array($validated['household_members'])) {
    foreach ($validated['household_members'] as $memberData) {
        HouseholdMember::create([
            'beneficiary_id' => $beneficiary->id,
            'full_name' => $memberData['full_name'],
            'relationship' => $memberData['relationship'],
            'birth_date' => $memberData['birth_date'],
            'gender' => $memberData['gender'],
            'occupation' => $memberData['occupation'] ?? null,
            'monthly_income' => $memberData['monthly_income'] ?? 0,
            'is_dependent' => $memberData['is_dependent'] ?? false,
        ]);
    }
}
```

## Phase 2: Align Frontend with Backend

### 5. Fix Frontend Form Data Structure

**File**: `resources/js/pages/Applications/Housing/ApplicationForm.tsx`

**Issues to Fix**:
1. `has_existing_property`: Send as boolean, not string
2. Ensure document structure matches backend expectations
3. Add household_members array to form data

**Changes**:
```typescript
// In handleSubmit()
if (key === 'hasExistingProperty') {
    formData.append(`beneficiary[${snakeKey}]`, value ? '1' : '0');
    // OR better: send as proper boolean in JSON
}
```

**Better Approach**: Use Inertia's form data handling which handles booleans properly, or ensure proper conversion.

### 6. Add Household Members Section

**File**: `resources/js/pages/Applications/Housing/ApplicationForm.tsx`

**Add**:
- New step for household members (after Priority Status or before Application Details)
- State for household members array
- Add/remove functionality
- Form fields per member

**Structure**:
```typescript
interface HouseholdMember {
    full_name: string;
    relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
    birth_date: string;
    gender: 'male' | 'female';
    occupation: string;
    monthly_income: string;
    is_dependent: boolean;
}

// Add to form data
const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
```

### 7. Implement Form Validation

**File**: `resources/js/pages/Applications/Housing/ApplicationForm.tsx`

**Replace** `validateCurrentStep()` with proper validation:

```typescript
const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
        case 1: // Personal Info
            if (!data.beneficiary.firstName) newErrors['beneficiary.firstName'] = 'First name is required';
            if (!data.beneficiary.lastName) newErrors['beneficiary.lastName'] = 'Last name is required';
            if (!data.beneficiary.birthDate) newErrors['beneficiary.birthDate'] = 'Birth date is required';
            if (!data.beneficiary.gender) newErrors['beneficiary.gender'] = 'Gender is required';
            if (!data.beneficiary.civilStatus) newErrors['beneficiary.civilStatus'] = 'Civil status is required';
            break;
        case 2: // Contact & Address
            if (!data.beneficiary.contactNumber) newErrors['beneficiary.contactNumber'] = 'Contact number is required';
            if (!data.beneficiary.email) newErrors['beneficiary.email'] = 'Email is required';
            if (!data.beneficiary.currentAddress) newErrors['beneficiary.currentAddress'] = 'Current address is required';
            if (!data.beneficiary.barangay) newErrors['beneficiary.barangay'] = 'Barangay is required';
            if (!data.beneficiary.yearsOfResidency) newErrors['beneficiary.yearsOfResidency'] = 'Years of residency is required';
            break;
        case 3: // Employment
            if (!data.beneficiary.employmentStatus) newErrors['beneficiary.employmentStatus'] = 'Employment status is required';
            if (data.beneficiary.employmentStatus === 'employed' && !data.beneficiary.employerName) {
                newErrors['beneficiary.employerName'] = 'Employer name is required when employed';
            }
            if (!data.beneficiary.monthlyIncome) newErrors['beneficiary.monthlyIncome'] = 'Monthly income is required';
            break;
        case 4: // Priority Status
            if (!data.beneficiary.priorityStatus) newErrors['beneficiary.priorityStatus'] = 'Priority status is required';
            if (data.beneficiary.priorityStatus !== 'none' && !data.beneficiary.priorityIdNo) {
                newErrors['beneficiary.priorityIdNo'] = 'Priority ID number is required';
            }
            break;
        case 5: // Application Details
            if (!data.application.housingProgram) newErrors['housing_program'] = 'Housing program is required';
            if (!data.application.applicationReason) newErrors['application_reason'] = 'Application reason is required';
            break;
        case 6: // Documents
            const requiredDocs = ['valid_id', 'income_proof', 'barangay_certificate'];
            const priorityDocs: Record<string, string> = {
                'pwd': 'pwd_id',
                'senior_citizen': 'senior_citizen_id',
                'solo_parent': 'solo_parent_id',
                'disaster_victim': 'disaster_certificate',
            };
            
            requiredDocs.forEach(doc => {
                if (!data.documents[doc as DocumentType]) {
                    newErrors[`documents.${doc}`] = `${documentLabels[doc as DocumentType]} is required`;
                }
            });
            
            if (data.beneficiary.priorityStatus !== 'none') {
                const requiredPriorityDoc = priorityDocs[data.beneficiary.priorityStatus];
                if (requiredPriorityDoc && !data.documents[requiredPriorityDoc as DocumentType]) {
                    newErrors[`documents.${requiredPriorityDoc}`] = `${documentLabels[requiredPriorityDoc as DocumentType]} is required for your priority status`;
                }
            }
            break;
    }
    
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

// Add onBlur validation
const handleBlur = (field: string, step: number) => {
    if (currentStep === step) {
        validateStep(step);
    }
};
```

### 8. Conditional Employer Name Field

**File**: `resources/js/pages/Applications/Housing/ApplicationForm.tsx`

**Change**: Wrap employer name input in conditional:
```typescript
{data.beneficiary.employmentStatus === 'employed' && (
    <Input
        label="Employer Name"
        value={data.beneficiary.employerName}
        onChange={(e) => setBeneficiaryField('employerName', e.target.value)}
        error={getError('beneficiary.employerName')}
        required
    />
)}
```

### 9. Conditional Document Uploads

**File**: `resources/js/pages/Applications/Housing/ApplicationForm.tsx`

**Change**: Filter documents based on priority status:
```typescript
const getDocumentsToShow = (): DocumentType[] => {
    const alwaysRequired: DocumentType[] = ['valid_id', 'income_proof', 'barangay_certificate'];
    const optional: DocumentType[] = ['birth_certificate', 'marriage_certificate', 'tax_declaration', 'dswd_certification'];
    
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
        ...optional,
    ];
};

// In Step 6 render:
{getDocumentsToShow().map((docType) => {
    const label = documentLabels[docType];
    const isRequired = ['valid_id', 'income_proof', 'barangay_certificate'].includes(docType) ||
        (data.beneficiary.priorityStatus !== 'none' && 
         ['pwd_id', 'senior_citizen_id', 'solo_parent_id', 'disaster_certificate'].includes(docType));
    
    return (
        <FileUpload
            key={docType}
            label={`${label}${isRequired ? ' *' : ''}`}
            // ... rest of props
        />
    );
})}
```

## Implementation Order

1. ✅ Fix document handling bug (backend)
2. ✅ Fix boolean conversion (backend)
3. ✅ Add conditional validation (backend)
4. ✅ Add household members backend handling
5. ✅ Test backend with Postman/curl
6. ✅ Fix frontend form data structure
7. ✅ Add household members frontend
8. ✅ Implement form validation
9. ✅ Add conditional employer field
10. ✅ Add conditional documents

## Testing Checklist

- [ ] Documents upload correctly with new structure
- [ ] Boolean conversion works for has_existing_property
- [ ] Conditional validation works (employer_name, priority_id_no)
- [ ] Priority documents are required when priority status selected
- [ ] Household members are saved correctly
- [ ] Frontend validation matches backend validation
- [ ] All form steps validate properly
- [ ] Conditional fields show/hide correctly
- [ ] Form submission works end-to-end
