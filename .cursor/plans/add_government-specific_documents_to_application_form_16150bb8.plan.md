---
name: Add Government-specific documents to application form
overview: "Add four Government-specific document upload fields to Step 6 (Documents step) that only appear when applicant type is 'Government': Letter of Intent, Proof of Legal Authority, Endorsements/Approvals, and Environmental Compliance Certificate."
todos:
  - id: update-documents-step
    content: Update DocumentsStep component to accept applicantType and show Government-specific documents
    status: in_progress
  - id: update-form-data
    content: Add new document fields to form data structure in ZoningApplication.tsx
    status: pending
  - id: update-typescript
    content: Update ZoningApplicationData interface with new document fields
    status: pending
  - id: update-backend-validation
    content: Add validation rules for Government documents in StoreZoningApplicationRequest
    status: pending
  - id: update-controller
    content: Update controller to save Government documents with correct document_type
    status: pending
  - id: update-frontend-validation
    content: Add validation for Government documents in formValidation.ts
    status: pending
---

# Add Government-Specific Documents to Application Form

## Overview

Add four Government-specific document upload fields to the Documents step (Step 6) that only appear when the applicant type is 'Government'.

## Documents to Add

1. **Letter of Intent / Application** (required) - From government agency requesting zoning clearance, signed by authorized official
2. **Proof of Legal Authority** (required) - Government charter, enabling law, executive order, or agency mandate
3. **Endorsements / Approvals** (required) - Endorsement from municipal/city planning office and other regulatory approvals
4. **Environmental Compliance Certificate (ECC)** (optional) - From DENR if project falls under environmental regulation

## Changes Required

### 1. Update DocumentsStep Component

- **File**: `resources/js/components/Applications/DocumentsStep.tsx`
- Add `applicantType` to the `DocumentsStepProps` interface
- Hide Barangay Clearance section when `applicantType === 'Government'`
- Add conditional rendering for Government-specific documents
- Add new document fields that only show when `applicantType === 'Government'`

### 2. Update Main Application Form

- **File**: `resources/js/pages/Applications/ZoningApplication.tsx`
- Pass `applicantType` to `DocumentsStep` component
- Add new document fields to the form data structure:
- `letterOfIntent?: File | null`
- `proofOfLegalAuthority?: File | null`
- `endorsementsApprovals?: File | null`
- `environmentalCompliance?: File | null`

### 3. Update TypeScript Interface

- **File**: `resources/js/pages/Applications/ZoningApplication.tsx`
- Add new document fields to `ZoningApplicationData` interface

### 4. Update Backend Validation

- **File**: `app/Http/Requests/StoreZoningApplicationRequest.php`
- Make Barangay Clearance not required for Government applicants
- Add validation rules for new Government documents (required for Government, optional for others)

### 5. Update Backend Controller

- **File**: `app/Http/Controllers/ZoningApplicationController.php`
- Handle saving the new Government-specific documents to the `zoning_application_documents` table with appropriate `document_type` values

### 6. Update Frontend Validation

- **File**: `resources/js/lib/formValidation.ts`
- Add validation for Government-specific documents in `validateStep6`

### 7. Update Required Documents Status Check

- **File**: `resources/js/components/Applications/DocumentsStep.tsx`
- Update `requiredDocuments` array and `allRequiredDocumentsUploaded` check to account for Government-specific documents
- For Government: Location Map, Vicinity Map, Letter of Intent, Proof of Legal Authority, Endorsements/Approvals (ECC is optional)
- For others: Location Map, Vicinity Map, Barangay Clearance

### 8. Update Document Requirements Info Box

- **File**: `resources/js/components/Applications/DocumentsStep.tsx`
- Show different requirements text for Government applicants vs. other applicant types

### 9. Update Application Details View

- **File**: `resources/js/pages/Applications/ApplicationDetails.tsx`
- Display Government-specific documents when viewing a Government application
- Show appropriate labels and document types

### 10. Add Help Text for Government Documents

- **File**: `resources/js/components/Applications/DocumentsStep.tsx`
- Add descriptive help text under each Government document field explaining what should be included

## Document Type Values

When saving to database, use these document_type values:

- `letter_of_intent` - Letter of Intent / Application
- `proof_of_legal_authority` - Proof of Legal Authority
- `endorsements_approvals` - Endorsements / Approvals
- `environmental_compliance` - Environmental Compliance Certificate