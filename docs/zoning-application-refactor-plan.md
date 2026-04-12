# Zoning Clearance Application — Refactor Plan

## Status: In Progress

---

## Completed

### Step 1 — Applicant Information
- [x] Generalized applicant types to: **Individual**, **Representative**, **Corporation / Company**
  - Removed old types: `business`, `developer`, `institution`
  - When `representative` is selected, `is_representative` is automatically set to `true` and representative + lot owner fields appear
  - When `corporation` is selected, the name label changes to "Company / Organization Name"
- [x] Removed **Tax Declaration Reference No.** field and its auto-verification logic
- [x] Removed **Barangay Permit Reference No.** field and its auto-verification logic
- [x] Updated step 1 validation — no longer requires `is_td_verified` / `is_bp_verified`

---

## Pending

### Step 1 — Applicant Information
- [ ] Decide what replaces TD / BP verification as proof of ownership (e.g. upload document in Step 4)
- [ ] Validate corporation fields (e.g. SEC registration, TIN) if required

### Step 2 — Location & Project Info
- [ ] Review required fields and simplify if needed

### Step 3 — Project Details
- [ ] Review field requirements per applicant type (individual vs. corporation may need different fields)

### Step 4 — Document Details
- [ ] Define required documents per applicant type
- [ ] Determine if TD / BP documents should be uploaded here instead of verified inline

### Step 5 — Fee Assessment
- [ ] Confirm fee calculation is still accurate after removing applicant type changes

### Step 6 — Review & Submit
- [ ] Ensure review step reflects new applicant type labels correctly

### Backend
- [ ] Update `StoreZoningApplicationRequest` validation rules to match new form fields
- [ ] Remove `tax_dec_ref_no` and `barangay_permit_ref_no` from validation and DB if unused
- [ ] Update `/api/verify-prerequisites` endpoint usage (no longer called from Step 1)

---

## Notes
- The `is_representative` flag is now derived from `applicant_type === 'representative'` rather than a standalone checkbox
- TD / BP reference numbers may still be needed as uploaded documents in Step 4 — to be confirmed
