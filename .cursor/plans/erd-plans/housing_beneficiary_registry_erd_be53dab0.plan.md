---
name: Housing Beneficiary Registry ERD
overview: Complete ERD for Housing Beneficiary Registry with 16 tables. Includes site visits, complaints/issues tracking, and blacklist management.
todos:
  - id: create-housing-schema
    content: Create schema_housing.sql with all 17 tables including site visits, complaints, and blacklist
    status: pending
---

# Housing Beneficiary Registry - Complete Plan

## Overview

**Purpose:** Manage government housing programs for qualified beneficiaries

**Key Functions:**

- Register beneficiaries and verify eligibility
- Conduct site visits for verification
- Track housing projects and available units
- Manage waitlist / queue for housing
- Allocate units to beneficiaries
- Track payment status (via Treasury)
- Handle complaints/issues post-allocation
- Maintain blacklist for fraud prevention

**Housing Programs:** Socialized Housing, Relocation, Rental Subsidy, Housing Loan

**Priority Groups:** PWD, Senior Citizens, Solo Parents, Disaster Victims

**Approval:** Housing Committee / Board

---

## ERD Diagram

```mermaid
erDiagram
    USERS ||--o{ BENEFICIARY_APPLICATIONS : processes
    USERS ||--o{ SITE_VISITS : conducts
    USERS ||--o{ ALLOCATIONS : approves
    USERS ||--o{ COMPLAINTS : handles
    USERS ||--o{ NOTIFICATIONS : receives
    
    BENEFICIARIES ||--o{ BENEFICIARY_APPLICATIONS : submits
    BENEFICIARIES ||--o{ BENEFICIARY_DOCUMENTS : uploads
    BENEFICIARIES ||--o{ HOUSEHOLD_MEMBERS : has
    BENEFICIARIES ||--o{ SITE_VISITS : receives
    BENEFICIARIES ||--o{ ALLOCATIONS : receives
    BENEFICIARIES ||--o{ WAITLIST : queued_in
    BENEFICIARIES ||--o| BLACKLIST : may_be_in
    
    HOUSING_PROJECTS ||--o{ HOUSING_UNITS : contains
    HOUSING_PROJECTS ||--o{ PROJECT_DOCUMENTS : has
    
    HOUSING_UNITS ||--o| ALLOCATIONS : assigned_to
    HOUSING_UNITS ||--o{ UNIT_HISTORY : tracks
    
    ALLOCATIONS ||--o{ PAYMENT_TRACKING : has
    ALLOCATIONS ||--o{ ALLOCATION_HISTORY : tracks
    ALLOCATIONS ||--o{ COMPLAINTS : has

    USERS {
        INT id PK
        VARCHAR email UK
        VARCHAR password
        VARCHAR first_name
        VARCHAR middle_name
        VARCHAR last_name
        ENUM role
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    BENEFICIARIES {
        INT id PK
        VARCHAR beneficiary_no UK
        INT citizen_id FK
        VARCHAR first_name
        VARCHAR middle_name
        VARCHAR last_name
        DATE birth_date
        ENUM gender
        ENUM civil_status
        VARCHAR contact_number
        VARCHAR email
        VARCHAR current_address
        VARCHAR barangay
        INT years_of_residency
        ENUM employment_status
        VARCHAR employer_name
        DECIMAL monthly_income
        BOOLEAN has_existing_property
        ENUM priority_status
        VARCHAR priority_id_no
        BOOLEAN is_active
        DATETIME registered_at
        DATETIME updated_at
    }

    HOUSEHOLD_MEMBERS {
        INT id PK
        INT beneficiary_id FK
        VARCHAR full_name
        ENUM relationship
        DATE birth_date
        ENUM gender
        VARCHAR occupation
        DECIMAL monthly_income
        BOOLEAN is_dependent
    }

    BENEFICIARY_APPLICATIONS {
        INT id PK
        VARCHAR application_no UK
        INT beneficiary_id FK
        ENUM housing_program
        TEXT application_reason
        ENUM eligibility_status
        TEXT eligibility_remarks
        ENUM application_status
        TEXT denial_reason
        INT reviewed_by FK
        DATETIME reviewed_at
        INT approved_by FK
        DATETIME approved_at
        DATETIME submitted_at
        DATETIME updated_at
    }

    BENEFICIARY_DOCUMENTS {
        INT id PK
        INT beneficiary_id FK
        INT application_id FK
        ENUM document_type
        VARCHAR file_name
        VARCHAR file_path
        ENUM verification_status
        INT verified_by FK
        DATETIME verified_at
        DATETIME uploaded_at
    }

    SITE_VISITS {
        INT id PK
        INT beneficiary_id FK
        INT application_id FK
        INT visited_by FK
        DATE scheduled_date
        DATE visit_date
        VARCHAR address_visited
        TEXT living_conditions
        TEXT findings
        ENUM recommendation
        TEXT remarks
        ENUM status
        DATETIME created_at
        DATETIME updated_at
    }

    HOUSING_PROJECTS {
        INT id PK
        VARCHAR project_code UK
        VARCHAR project_name
        VARCHAR location
        VARCHAR barangay
        DECIMAL pin_lat
        DECIMAL pin_lng
        VARCHAR zoning_clearance_no
        ENUM project_source
        VARCHAR source_reference
        ENUM housing_program
        INT total_units
        INT available_units
        INT allocated_units
        INT occupied_units
        DECIMAL lot_area_sqm
        DECIMAL unit_floor_area_sqm
        DECIMAL unit_price
        DECIMAL monthly_amortization
        ENUM project_status
        DATE completion_date
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    PROJECT_DOCUMENTS {
        INT id PK
        INT project_id FK
        ENUM document_type
        VARCHAR file_name
        VARCHAR file_path
        DATETIME uploaded_at
    }

    HOUSING_UNITS {
        INT id PK
        INT project_id FK
        VARCHAR unit_no UK
        VARCHAR block_no
        VARCHAR lot_no
        INT floor_number
        ENUM unit_type
        DECIMAL floor_area_sqm
        ENUM status
        DATETIME created_at
        DATETIME updated_at
    }

    WAITLIST {
        INT id PK
        INT beneficiary_id FK
        INT application_id FK
        ENUM housing_program
        INT priority_score
        INT queue_position
        DATE waitlist_date
        ENUM status
        DATETIME updated_at
    }

    ALLOCATIONS {
        INT id PK
        VARCHAR allocation_no UK
        INT beneficiary_id FK
        INT application_id FK
        INT unit_id FK
        DATE allocation_date
        DATE acceptance_deadline
        DATE accepted_date
        DATE move_in_date
        ENUM allocation_status
        DECIMAL total_contract_price
        DECIMAL monthly_amortization
        INT amortization_months
        TEXT special_conditions
        VARCHAR contract_file_path
        DATE contract_signed_date
        INT allocated_by FK
        INT approved_by FK
        DATETIME created_at
        DATETIME updated_at
    }

    ALLOCATION_HISTORY {
        INT id PK
        INT allocation_id FK
        ENUM status
        TEXT remarks
        INT updated_by FK
        DATETIME updated_at
    }

    PAYMENT_TRACKING {
        INT id PK
        INT allocation_id FK
        VARCHAR treasury_reference
        INT payment_month
        INT payment_year
        DECIMAL amount_due
        DECIMAL amount_paid
        DATE due_date
        DATE payment_date
        ENUM payment_status
        VARCHAR or_number
        DATETIME synced_at
        DATETIME created_at
    }

    COMPLAINTS {
        INT id PK
        VARCHAR complaint_no UK
        INT allocation_id FK
        INT beneficiary_id FK
        INT unit_id FK
        ENUM complaint_type
        TEXT description
        ENUM priority
        ENUM status
        TEXT resolution
        INT assigned_to FK
        INT resolved_by FK
        DATETIME resolved_at
        DATETIME submitted_at
        DATETIME updated_at
    }

    BLACKLIST {
        INT id PK
        INT beneficiary_id FK
        ENUM reason
        TEXT details
        DATE blacklisted_date
        DATE lifted_date
        ENUM status
        INT blacklisted_by FK
        INT lifted_by FK
        TEXT lift_remarks
        DATETIME created_at
        DATETIME updated_at
    }

    UNIT_HISTORY {
        INT id PK
        INT unit_id FK
        ENUM status
        INT beneficiary_id FK
        TEXT remarks
        DATETIME recorded_at
    }

    NOTIFICATIONS {
        INT id PK
        INT user_id FK
        INT beneficiary_id FK
        VARCHAR title
        TEXT message
        VARCHAR link
        BOOLEAN is_read
        DATETIME created_at
    }
```

---

## Workflow Diagram

```mermaid
flowchart TD
    subgraph registration [Phase 1: Beneficiary Registration]
        A1[Beneficiary Registers]
        A1 --> A2[Enter Personal Info]
        A2 --> A3[Enter Household Members]
        A3 --> A4[Select Housing Program]
        A4 --> A5[Upload Documents]
        A5 --> A6[Submit Application]
    end

    subgraph verification [Phase 2: Eligibility Verification]
        B1[Staff Reviews Application]
        B1 --> B2[Verify Documents]
        B2 --> B3[Check Blacklist]
        B3 --> B4{In Blacklist?}
        B4 -->|Yes| B5[Auto-Reject]
        B4 -->|No| B6[Schedule Site Visit]
        B6 --> B7[Conduct Site Visit]
        B7 --> B8[Record Findings]
        B8 --> B9{Site Visit Passed?}
        B9 -->|No| B10[Mark Not Eligible]
        B9 -->|Yes| B11[Mark Eligible]
        B11 --> B12[Add to Waitlist]
    end

    subgraph waitlist [Phase 3: Waitlist Management]
        C1[Calculate Priority Score]
        C1 --> C2[Assign Queue Position]
        C2 --> C3[Wait for Unit]
        C3 --> C4{Unit Available?}
        C4 -->|No| C3
        C4 -->|Yes| C5[Notify for Allocation]
    end

    subgraph allocation [Phase 4: Unit Allocation]
        D1[Staff Proposes Allocation]
        D1 --> D2[Committee Reviews]
        D2 --> D3{Approved?}
        D3 -->|No| D4[Return to Waitlist]
        D3 -->|Yes| D5[Send Allocation Notice]
        D5 --> D6{Beneficiary Accepts?}
        D6 -->|No| D7[Release Unit]
        D7 --> D4
        D6 -->|Yes| D8[Sign Contract]
        D8 --> D9[Finalize Allocation]
    end

    subgraph occupancy [Phase 5: Move-In & Monitoring]
        E1[Schedule Move-In]
        E1 --> E2[Update Unit Status]
        E2 --> E3[Generate Payment Schedule]
        E3 --> E4[Track Monthly Payments]
        E4 --> E5[Handle Complaints if Any]
    end

    A6 --> B1
    B5 --> Z1[Notify: Rejected - Blacklisted]
    B10 --> Z2[Notify: Not Eligible]
    B12 --> C1
    C5 --> D1
    D9 --> E1
```

---

## New Tables Explained

### SITE_VISITS

Home verification visits before final eligibility.

| Field | Type | Description |

|-------|------|-------------|

| id | INT | PK |

| beneficiary_id | INT FK | Who is being visited |

| application_id | INT FK | Related application |

| visited_by | INT FK | Staff who visited |

| scheduled_date | DATE | When scheduled |

| visit_date | DATE | Actual visit date |

| address_visited | VARCHAR | Address verified |

| living_conditions | TEXT | Description of current housing |

| findings | TEXT | What was observed |

| recommendation | ENUM | eligible, not_eligible, needs_followup |

| remarks | TEXT | Additional notes |

| status | ENUM | scheduled, completed, cancelled, no_show |

**Example:**

```
Visit Date: 2026-01-20
Address: 123 Squatter Area, Brgy. Centro
Living Conditions: "Family of 5 living in 15sqm makeshift structure"
Findings: "Genuine informal settler, no running water, shared toilet"
Recommendation: eligible
```

---

### COMPLAINTS

Post-allocation issue tracking.

| Field | Type | Description |

|-------|------|-------------|

| id | INT | PK |

| complaint_no | VARCHAR | "CMP-2026-00001" |

| allocation_id | INT FK | Related allocation |

| beneficiary_id | INT FK | Who complained |

| unit_id | INT FK | Which unit |

| complaint_type | ENUM | Type of issue |

| description | TEXT | Details |

| priority | ENUM | low, medium, high, urgent |

| status | ENUM | open, in_progress, resolved, closed |

| resolution | TEXT | How it was resolved |

| assigned_to | INT FK | Staff handling |

| resolved_by | INT FK | Staff who resolved |

**Complaint Types:**

```sql
'maintenance'        -- Unit repair needed
'neighbor_dispute'   -- Conflict with neighbors
'payment_issue'      -- Payment problems
'violation'          -- Rule violation by beneficiary
'documentation'      -- Missing/wrong documents
'relocation_request' -- Want to transfer unit
'other'
```

**Example:**

```
Complaint No: CMP-2026-00001
Type: maintenance
Description: "Roof leaking during heavy rain"
Priority: high
Status: in_progress
Assigned To: Maintenance Staff
```

---

### BLACKLIST

Fraud prevention and disqualification tracking.

| Field | Type | Description |

|-------|------|-------------|

| id | INT | PK |

| beneficiary_id | INT FK | Who is blacklisted |

| reason | ENUM | Why blacklisted |

| details | TEXT | Full explanation |

| blacklisted_date | DATE | When added |

| lifted_date | DATE | If reinstated |

| status | ENUM | active, lifted |

| blacklisted_by | INT FK | Staff who added |

| lifted_by | INT FK | Staff who removed |

| lift_remarks | TEXT | Why reinstated |

**Blacklist Reasons:**

```sql
'fraud'              -- False documents/information
'abandoned_unit'     -- Left unit without notice
'non_payment'        -- Chronic non-payment (after due process)
'subletting'         -- Illegally renting out unit
'criminal_activity'  -- Illegal activities in unit
'property_damage'    -- Intentional damage to unit
'duplicate_benefit'  -- Already has housing from another program
'other'
```

**Workflow:**

```
Blacklist Check:
1. On application submission → Check if beneficiary is blacklisted
2. If active blacklist → Auto-reject application
3. If lifted → Allow but flag for review
```

---

## Updated Verification Flow

```mermaid
flowchart TD
    A[Application Submitted] --> B{Check Blacklist}
    B -->|Blacklisted| C[Auto-Reject]
    B -->|Clear| D[Review Documents]
    D --> E{Docs Valid?}
    E -->|No| F[Request Re-submission]
    E -->|Yes| G[Schedule Site Visit]
    G --> H[Conduct Visit]
    H --> I{Recommendation?}
    I -->|Not Eligible| J[Reject - Site Visit Failed]
    I -->|Needs Follow-up| K[Schedule Another Visit]
    K --> H
    I -->|Eligible| L[Approve Eligibility]
    L --> M[Add to Waitlist]
```

---

## All ENUM Values

```sql
-- role (users)
'staff', 'committee_member', 'admin'

-- gender
'male', 'female'

-- civil_status
'single', 'married', 'widowed', 'separated', 'live_in'

-- employment_status
'employed', 'self_employed', 'unemployed', 'retired', 'student'

-- priority_status
'none', 'pwd', 'senior_citizen', 'solo_parent', 'disaster_victim', 'indigenous'

-- housing_program
'socialized_housing', 'relocation', 'rental_subsidy', 'housing_loan'

-- eligibility_status
'pending', 'eligible', 'not_eligible'

-- application_status
'submitted', 'under_review', 'site_visit_scheduled', 'site_visit_completed', 'eligible', 'not_eligible', 'waitlisted', 'allocated', 'cancelled'

-- document_type
'valid_id', 'birth_certificate', 'marriage_certificate', 'income_proof', 'barangay_certificate', 'tax_declaration', 'dswd_certification', 'pwd_id', 'senior_citizen_id', 'solo_parent_id', 'disaster_certificate'

-- verification_status
'pending', 'verified', 'invalid'

-- site_visit_status
'scheduled', 'completed', 'cancelled', 'no_show'

-- site_visit_recommendation
'eligible', 'not_eligible', 'needs_followup'

-- project_source
'lgu_built', 'nha', 'shfc', 'private_developer'

-- project_status
'planning', 'under_construction', 'completed', 'fully_allocated'

-- unit_type
'single_detached', 'duplex', 'rowhouse', 'apartment', 'condominium'

-- unit_status
'available', 'reserved', 'allocated', 'occupied', 'maintenance'

-- waitlist_status
'active', 'allocated', 'removed', 'expired'

-- allocation_status
'proposed', 'committee_review', 'approved', 'rejected', 'accepted', 'declined', 'cancelled', 'moved_in'

-- payment_status
'pending', 'paid', 'overdue', 'waived'

-- complaint_type
'maintenance', 'neighbor_dispute', 'payment_issue', 'violation', 'documentation', 'relocation_request', 'other'

-- complaint_priority
'low', 'medium', 'high', 'urgent'

-- complaint_status
'open', 'in_progress', 'resolved', 'closed'

-- blacklist_reason
'fraud', 'abandoned_unit', 'non_payment', 'subletting', 'criminal_activity', 'property_damage', 'duplicate_benefit', 'other'

-- blacklist_status
'active', 'lifted'
```

---

## 16 Tables Summary

| # | Table | Purpose |

|---|-------|---------|

| 1 | USERS | Staff, committee, admin |

| 2 | BENEFICIARIES | Housing applicants |

| 3 | HOUSEHOLD_MEMBERS | Family/dependents |

| 4 | BENEFICIARY_APPLICATIONS | Housing applications |

| 5 | BENEFICIARY_DOCUMENTS | Uploaded documents |

| 6 | **SITE_VISITS** | Home verification visits (NEW) |

| 7 | HOUSING_PROJECTS | Housing developments (linked to Zoning Clearance) |

| 8 | PROJECT_DOCUMENTS | Project files |

| 9 | HOUSING_UNITS | Individual units |

| 10 | WAITLIST | Queue management |

| 11 | ALLOCATIONS | Unit assignments |

| 12 | ALLOCATION_HISTORY | Allocation audit trail |

| 13 | PAYMENT_TRACKING | Payment status from Treasury |

| 14 | **COMPLAINTS** | Post-allocation issues (NEW) |

| 15 | **BLACKLIST** | Disqualified beneficiaries (NEW) |

| 16 | UNIT_HISTORY | Unit status changes |

| 17 | NOTIFICATIONS | User alerts |

---

## Cross-System References

| Field | References | Type | Validation |

|-------|-----------|------|------------|

| `zoning_clearance_no` | Zoning Clearance System (ISSUED_CLEARANCES) | VARCHAR(30) | API verification on project creation |

**Note:** `zoning_clearance_no` is a reference string (not a foreign key) because it links to a different system. When a housing project is created, this field stores the zoning clearance number to verify the project has proper zoning approval.

---

## Data Synchronization

| Event | Trigger | Action |

|-------|---------|--------|

| **Zoning Clearance Issued** | Zoning clearance approved for socialized housing | FETCH clearance data, verify before creating housing project |

| **Unit Allocation** | Unit allocated to beneficiary | POST allocation data to Occupancy Monitoring |

| **Unit Vacancy** | Beneficiary moves out | POST vacancy status to Occupancy Monitoring |

| **Payment Status** | Monthly payment updates | FETCH payment status from Treasury |

| **AICS Referral** | Crisis housing referral | FETCH referral data from AICS system |

| **Priority Status** | PWD/Senior verification | FETCH priority status from PWD & Senior Services |

**Synchronization Type:** Event-driven (real-time on allocation/vacancy) and scheduled (monthly for payments)

---

## Recommended Indexes

For optimal query performance, create indexes on:

```sql
-- Beneficiary lookups
CREATE INDEX idx_beneficiary_no ON BENEFICIARIES(beneficiary_no);
CREATE INDEX idx_beneficiary_status ON BENEFICIARIES(is_active);
CREATE INDEX idx_priority_status ON BENEFICIARIES(priority_status);

-- Application tracking
CREATE INDEX idx_application_no ON BENEFICIARY_APPLICATIONS(application_no);
CREATE INDEX idx_application_status ON BENEFICIARY_APPLICATIONS(application_status);
CREATE INDEX idx_application_program ON BENEFICIARY_APPLICATIONS(housing_program);
CREATE INDEX idx_eligibility_status ON BENEFICIARY_APPLICATIONS(eligibility_status);

-- Project tracking
CREATE INDEX idx_project_code ON HOUSING_PROJECTS(project_code);
CREATE INDEX idx_zoning_clearance ON HOUSING_PROJECTS(zoning_clearance_no);
CREATE INDEX idx_project_status ON HOUSING_PROJECTS(project_status);

-- Unit management
CREATE INDEX idx_unit_project ON HOUSING_UNITS(project_id);
CREATE INDEX idx_unit_no ON HOUSING_UNITS(unit_no);
CREATE INDEX idx_unit_status ON HOUSING_UNITS(status);

-- Waitlist management
CREATE INDEX idx_waitlist_beneficiary ON WAITLIST(beneficiary_id);
CREATE INDEX idx_waitlist_program ON WAITLIST(housing_program);
CREATE INDEX idx_waitlist_priority ON WAITLIST(priority_score);
CREATE INDEX idx_waitlist_position ON WAITLIST(queue_position);

-- Allocation tracking
CREATE INDEX idx_allocation_no ON ALLOCATIONS(allocation_no);
CREATE INDEX idx_allocation_beneficiary ON ALLOCATIONS(beneficiary_id);
CREATE INDEX idx_allocation_unit ON ALLOCATIONS(unit_id);
CREATE INDEX idx_allocation_status ON ALLOCATIONS(allocation_status);

-- Payment tracking
CREATE INDEX idx_payment_allocation ON PAYMENT_TRACKING(allocation_id);
CREATE INDEX idx_payment_status ON PAYMENT_TRACKING(payment_status);
CREATE INDEX idx_payment_date ON PAYMENT_TRACKING(payment_year, payment_month);

-- Complaint tracking
CREATE INDEX idx_complaint_no ON COMPLAINTS(complaint_no);
CREATE INDEX idx_complaint_allocation ON COMPLAINTS(allocation_id);
CREATE INDEX idx_complaint_status ON COMPLAINTS(status);

-- Blacklist checking
CREATE INDEX idx_blacklist_beneficiary ON BLACKLIST(beneficiary_id);
CREATE INDEX idx_blacklist_status ON BLACKLIST(status);
```

---

## Standardized Components

### Integration with Zoning Clearance

HOUSING_PROJECTS table includes `zoning_clearance_no` field to link housing projects to their zoning clearance. This allows:

- Verification that housing project has proper zoning clearance
- Tracking which zoning clearances led to housing projects
- Cross-system reporting and compliance checking

### History Tables

This system uses ALLOCATION_HISTORY (specific to allocations) rather than APPLICATION_HISTORY. Structure follows same pattern:

- `id` (PK)
- `allocation_id` (FK)
- `status` (ENUM)
- `remarks` (TEXT)
- `updated_by` (FK to USERS)
- `updated_at` (DATETIME)

---

## Implementation

**File to create:** `schema_housing.sql`

- 17 tables
- Foreign key constraints
- Indexes on frequently queried columns
- ENUM definitions
- See Unified Role System document for role definitions