# Housing Beneficiary Registry Refactoring - Status

## ✅ Completed

### Database
- ✅ All 17 ERD table migrations created
- ✅ Drop old tables migration created
- ✅ Household members table update migration created

### Models
- ✅ Beneficiary (refactored from HousingBeneficiary)
- ✅ BeneficiaryApplication (refactored from HousingBeneficiaryApplication)
- ✅ BeneficiaryDocument (refactored from HousingBeneficiaryDocument)
- ✅ SiteVisit (new)
- ✅ HousingProject (new)
- ✅ ProjectDocument (new)
- ✅ HousingUnit (new)
- ✅ Waitlist (new)
- ✅ Allocation (new)
- ✅ AllocationHistory (new)
- ✅ PaymentTracking (new)
- ✅ Complaint (new)
- ✅ Blacklist (new)
- ✅ UnitHistory (new)
- ✅ HouseholdMember (new)

### Services
- ✅ HousingBeneficiaryPriorityService (priority scoring algorithm)
- ✅ BlacklistService (blacklist management)
- ✅ WaitlistService (queue management)
- ✅ AllocationService (allocation workflow)
- ✅ SiteVisitService (site visit management)
- ✅ ZoningClearanceService (placeholder)
- ✅ TreasuryPaymentService (placeholder)
- ✅ PriorityStatusService (placeholder)

### Form Requests
- ✅ StoreBeneficiaryApplicationRequest
- ✅ StoreSiteVisitRequest
- ✅ StoreHousingProjectRequest
- ✅ StoreAllocationRequest
- ✅ StoreComplaintRequest
- ✅ StoreBlacklistRequest

### Policies
- ✅ SiteVisitPolicy
- ✅ AllocationPolicy
- ✅ ComplaintPolicy
- ✅ BlacklistPolicy
- ✅ HousingProjectPolicy

### Controllers (New)
- ✅ SiteVisitController (basic implementation)
- ✅ BlacklistController (basic implementation)
- ✅ AllocationController (full CRUD)
- ✅ ComplaintController (full CRUD)
- ✅ WaitlistController (view operations)
- ✅ HousingProjectController (full CRUD)
- ✅ HousingUnitController (full CRUD)

## ⚠️ Remaining Work

### Controllers (Update Existing)
- ⚠️ HousingBeneficiaryController
  - Update to use `Beneficiary` and `BeneficiaryApplication` models
  - Remove `user_id` references (use `beneficiary.citizen_id` instead)
  - Update application creation to use new ERD structure
  - Integrate BlacklistService check on submission
  - Update document handling to use BeneficiaryDocument model

- ⚠️ AdminHousingBeneficiaryController
  - Update to use `BeneficiaryApplication` model
  - Add blacklist check on application review
  - Add site visit scheduling functionality
  - Update status workflow to match ERD (submitted → under_review → site_visit_scheduled → etc.)
  - Add eligibility verification
  - Integrate WaitlistService when marking eligible

### Routes
- ⚠️ Add routes for all new controllers
- ⚠️ Update existing housing routes to use new controllers

### Frontend Refactoring
- ⚠️ Beneficiary Registration Form
  - Update to match ERD fields (priority_status enum, years_of_residency, has_existing_property, etc.)
  - Remove old boolean priority fields (is_pwd, is_senior_citizen, etc.)
  - Add beneficiary_no display (auto-generated)

- ⚠️ Application Form
  - Add housing_program selection (socialized_housing, relocation, rental_subsidy, housing_loan)
  - Add application_reason field
  - Update document types to match ERD
  - Remove application_type (individual/household) - now handled by beneficiary relationship

- ⚠️ Application Details Page
  - Show eligibility_status and eligibility_remarks
  - Display site visit information
  - Show waitlist position if waitlisted
  - Display allocation information if allocated

- ⚠️ New Pages Needed
  - Site Visit Management (schedule, complete, view history)
  - Housing Projects (list, create, edit, view with units)
  - Units Management (list per project, create, update status)
  - Waitlist Queue (view queue with priority scores)
  - Allocations (propose, approve, view, accept/decline)
  - Complaints (submit, view, manage, resolve)
  - Blacklist Management (admin only)

### Database Migration
- ⚠️ Run migrations in correct order:
  1. Drop old tables
  2. Create new ERD tables
  3. Update household_members table

### Testing
- ⚠️ Update existing tests to use new models
- ⚠️ Create tests for new services
- ⚠️ Create tests for new controllers

## Key Changes Summary

### Model Name Changes
- `HousingBeneficiary` → `Beneficiary`
- `HousingBeneficiaryApplication` → `BeneficiaryApplication`
- `HousingBeneficiaryDocument` → `BeneficiaryDocument`

### Field Changes
**Beneficiary:**
- `is_pwd`, `is_senior_citizen`, etc. → `priority_status` enum
- `mobile_number` → `contact_number`
- `address` → `current_address`
- Added: `beneficiary_no`, `years_of_residency`, `has_existing_property`

**Application:**
- `application_number` → `application_no`
- Removed: `application_type`, `user_id`, `household_id`
- Added: `housing_program`, `application_reason`, `eligibility_status`, `eligibility_remarks`
- `status` → `application_status` with new enum values

### Workflow Changes
Old: `draft → submitted → under_review → approved/rejected`

New: `submitted → under_review → site_visit_scheduled → site_visit_completed → eligible → waitlisted → allocated → moved_in`

With rejection paths:
- `submitted` → `not_eligible` (blacklisted)
- `site_visit_completed` → `not_eligible` (site visit failed)
- `waitlisted` → `cancelled` (beneficiary cancels)
