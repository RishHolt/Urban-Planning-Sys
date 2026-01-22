---
name: Subdivision Building Review ERD
overview: Complete ERD for Subdivision & Building Review system. Subdivision Review has 4 stages (direct submission), Building Review fetches from Permit & Licensing. Issues Subdivision Certificate and Building Plan Approval.
todos:
  - id: create-sbr-schema
    content: Create schema_sbr.sql with all 9 tables for Subdivision & Building Review system
    status: pending
---

# Subdivision & Building Review System - Final Plan

## Overview

**Two Types of Reviews:**

| Type | Source | Stages | Output |

|------|--------|--------|--------|

| Subdivision Review | Direct submission by developer | 4 stages | Subdivision Certificate |

| Building Review | FETCH from Permit & Licensing | 3 reviews | POST approval back to P&L |

**Prerequisites:**

- Subdivision: Zoning Clearance (from our Zoning Clearance system)
- Building: Building Permit Application (from P&L)

---

## ERD Diagram

```mermaid
erDiagram
    USERS ||--o{ SUBDIVISION_APPLICATIONS : submits
    USERS ||--o{ BUILDING_REVIEWS : reviews
    USERS ||--o{ SUBDIVISION_STAGE_REVIEWS : conducts
    USERS ||--o{ NOTIFICATIONS : receives
    
    SUBDIVISION_APPLICATIONS ||--o{ SUBDIVISION_DOCUMENTS : has
    SUBDIVISION_APPLICATIONS ||--o{ SUBDIVISION_STAGE_REVIEWS : undergoes
    SUBDIVISION_APPLICATIONS ||--o| ISSUED_CERTIFICATES : generates
    SUBDIVISION_APPLICATIONS ||--o{ APPLICATION_HISTORY : tracks
    
    BUILDING_REVIEWS ||--o{ BUILDING_PLAN_CHECKS : has
    BUILDING_REVIEWS ||--o{ APPLICATION_HISTORY : tracks

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

    SUBDIVISION_APPLICATIONS {
        INT id PK
        VARCHAR reference_no UK
        INT user_id FK
        VARCHAR zoning_clearance_no
        ENUM applicant_type
        VARCHAR contact_number
        VARCHAR contact_email
        DECIMAL pin_lat
        DECIMAL pin_lng
        VARCHAR project_address
        VARCHAR developer_name
        VARCHAR subdivision_name
        TEXT project_description
        DECIMAL total_area_sqm
        INT total_lots_planned
        DECIMAL open_space_percentage
        ENUM current_stage
        ENUM status
        TEXT denial_reason
        BOOLEAN is_active
        DATETIME submitted_at
        DATETIME approved_at
        DATETIME updated_at
    }

    SUBDIVISION_DOCUMENTS {
        INT id PK
        INT application_id FK
        ENUM document_type
        ENUM stage
        VARCHAR file_name
        VARCHAR file_path
        VARCHAR file_type
        BIGINT file_size
        DATETIME uploaded_at
    }

    SUBDIVISION_STAGE_REVIEWS {
        INT id PK
        INT application_id FK
        ENUM stage
        INT reviewer_id FK
        TEXT findings
        TEXT recommendations
        ENUM result
        DATETIME reviewed_at
        DATETIME created_at
    }

    ISSUED_CERTIFICATES {
        INT id PK
        VARCHAR certificate_no UK
        INT application_id FK
        INT issued_by FK
        DATE issue_date
        DATE valid_until
        TEXT conditions
        VARCHAR final_plat_reference
        ENUM status
        DATETIME created_at
        DATETIME updated_at
    }

    BUILDING_REVIEWS {
        INT id PK
        VARCHAR pl_reference_no UK
        VARCHAR zoning_clearance_no
        VARCHAR building_permit_no
        VARCHAR applicant_name
        VARCHAR contact_number
        VARCHAR project_address
        TEXT project_description
        INT number_of_storeys
        DECIMAL floor_area_sqm
        ENUM status
        TEXT denial_reason
        DATETIME fetched_at
        DATETIME reviewed_at
        DATETIME posted_at
        DATETIME updated_at
    }

    BUILDING_PLAN_CHECKS {
        INT id PK
        INT building_review_id FK
        ENUM check_type
        INT reviewer_id FK
        TEXT findings
        TEXT recommendations
        ENUM result
        DATETIME reviewed_at
    }

    APPLICATION_HISTORY {
        INT id PK
        ENUM application_type
        INT application_id FK
        ENUM status
        TEXT remarks
        INT updated_by FK
        DATETIME updated_at
    }

    NOTIFICATIONS {
        INT id PK
        INT user_id FK
        VARCHAR title
        TEXT message
        VARCHAR link
        BOOLEAN is_read
        DATETIME created_at
    }
```

---

## Subdivision Review Workflow

### Flow Diagram

```mermaid
flowchart TD
    subgraph prereq [Prerequisites]
        A1[Developer has Zoning Clearance]
        A1 --> A2{Verify Zoning Clearance via API}
        A2 -->|Invalid| A3[Cannot Proceed]
        A2 -->|Valid| A4[Proceed to Application]
    end

    subgraph apply [Application Submission]
        B1[Developer Submits Application]
        B1 --> B2[Enter Project Details]
        B2 --> B3[Upload Concept Plan]
        B3 --> B4[Submit]
    end

    subgraph stage1 [Stage 1: Concept Plan Review]
        C1[Staff Reviews Concept Plan]
        C1 --> C2{Layout Acceptable?}
        C2 -->|Revision| C3[Return for Revision]
        C3 --> B3
        C2 -->|Approved| C4[Proceed to Stage 2]
    end

    subgraph stage2 [Stage 2: Preliminary Plat Review]
        D1[Developer Uploads Preliminary Plat]
        D1 --> D2[Review Lot Sizes & Dimensions]
        D2 --> D3[Review Infrastructure Plan]
        D3 --> D4[Review Environmental Factors]
        D4 --> D5{Compliant?}
        D5 -->|Revision| D6[Return for Revision]
        D6 --> D1
        D5 -->|Approved| D7[Proceed to Stage 3]
    end

    subgraph stage3 [Stage 3: Improvement Plan Review]
        E1[Developer Uploads Engineering Plans]
        E1 --> E2[Review Water System]
        E2 --> E3[Review Sewer System]
        E3 --> E4[Review Drainage System]
        E4 --> E5[Review Street Construction]
        E5 --> E6{Engineering Approved?}
        E6 -->|Revision| E7[Return for Revision]
        E7 --> E1
        E6 -->|Approved| E8[Proceed to Stage 4]
    end

    subgraph stage4 [Stage 4: Final Plat Review]
        F1[Developer Uploads Final Plat Map]
        F1 --> F2[Verify All Conditions Met]
        F2 --> F3[Verify 30% Open Space]
        F3 --> F4{Final Approval?}
        F4 -->|Denied| F5[DENIED]
        F4 -->|Approved| F6[Issue Subdivision Certificate]
        F6 --> F7[APPROVED]
    end

    A4 --> B1
    B4 --> C1
    C4 --> D1
    D7 --> E1
    E8 --> F1
    F5 --> G1[Notify: Denied]
    F7 --> G2[Notify: Subdivision Certificate Issued]
```

### Stage Details

| Stage | What's Reviewed | Documents Required | Result |

|-------|-----------------|-------------------|--------|

| **1. Concept Plan** | Initial layout feasibility | Concept plan drawing, vicinity map | approved / revision_required |

| **2. Preliminary Plat** | Lot sizes, infrastructure, environment | Preliminary plat, site analysis, environmental assessment | approved / revision_required |

| **3. Improvement Plan** | Water, sewer, drainage, streets | Engineering plans for all utilities | approved / revision_required |

| **4. Final Plat** | All conditions, 30% open space | Final plat map, compliance documents | approved / denied |

### Status Flow

```
SUBMITTED → CONCEPT_REVIEW → PRELIMINARY_REVIEW → IMPROVEMENT_REVIEW → FINAL_REVIEW → APPROVED
                 ↓                  ↓                   ↓                  ↓
              REVISION           REVISION            REVISION           DENIED
```

---

## Building Review Workflow

### Flow Diagram

```mermaid
flowchart TD
    subgraph fetch [FETCH from Permit & Licensing]
        A1[P&L Submits Building Permit for Review]
        A1 --> A2[System FETCHES Application Data]
        A2 --> A3[System FETCHES Building Plans]
        A3 --> A4[Create Building Review Record]
    end

    subgraph review [Building Plan Reviews]
        B1[Staff Receives Review Request]
        B1 --> B2[Safety & Sanitation Check]
        B2 --> B3{Pass?}
        B3 -->|Fail| B4[Record Findings]
        B3 -->|Pass| B5[Structural Integrity Check]
        B5 --> B6{Pass?}
        B6 -->|Fail| B4
        B6 -->|Pass| B7[Deed Restrictions Check]
        B7 --> B8{Pass?}
        B8 -->|Fail| B4
        B8 -->|Pass| B9[All Checks Passed]
    end

    subgraph decide [Decision]
        C1{All Checks Passed?}
        C1 -->|No| C2[DENIED / REVISION NEEDED]
        C1 -->|Yes| C3[APPROVED]
    end

    subgraph post [POST Back to P&L]
        D1[Prepare Review Result]
        D1 --> D2[POST to P&L API]
        D2 --> D3[P&L Continues Their Process]
    end

    A4 --> B1
    B4 --> C1
    B9 --> C1
    C2 --> D1
    C3 --> D1
```

### Check Types

| Check Type | What's Verified |

|------------|-----------------|

| **Safety & Sanitation** | Building code compliance, fire safety, ventilation |

| **Structural Integrity** | Foundation, materials, construction methods |

| **Deed Restrictions** | HOA rules, aesthetic guidelines, setbacks |

### Status Flow

```
FETCHED → UNDER_REVIEW → APPROVED / DENIED → POSTED_TO_PL
```

---

## Tables Explained

### SUBDIVISION_APPLICATIONS

| Field | Type | Description |

|-------|------|-------------|

| reference_no | VARCHAR(20) | "SUB-2026-00001" |

| zoning_clearance_no | VARCHAR(30) | Prerequisite from Zoning system |

| developer_name | VARCHAR(150) | Developer/Company name |

| subdivision_name | VARCHAR(150) | Proposed subdivision name |

| total_area_sqm | DECIMAL(12,2) | Total land area |

| total_lots_planned | INT | Number of lots |

| open_space_percentage | DECIMAL(5,2) | Must be >= 30% |

| current_stage | ENUM | concept, preliminary, improvement, final |

| status | ENUM | submitted, concept_review, preliminary_review, improvement_review, final_review, approved, denied, revision |

### SUBDIVISION_STAGE_REVIEWS

| Field | Type | Description |

|-------|------|-------------|

| stage | ENUM | concept, preliminary, improvement, final |

| reviewer_id | INT FK | Staff who reviewed |

| findings | TEXT | What was found |

| recommendations | TEXT | Changes needed |

| result | ENUM | approved, revision_required, denied |

### BUILDING_REVIEWS

| Field | Type | Description |

|-------|------|-------------|

| pl_reference_no | VARCHAR(30) | Reference from Permit & Licensing |

| zoning_clearance_no | VARCHAR(30) | Fetched from P&L |

| building_permit_no | VARCHAR(30) | Fetched from P&L |

| status | ENUM | fetched, under_review, approved, denied, posted |

| fetched_at | DATETIME | When received from P&L |

| posted_at | DATETIME | When result sent back to P&L |

### BUILDING_PLAN_CHECKS

| Field | Type | Description |

|-------|------|-------------|

| check_type | ENUM | safety_sanitation, structural, deed_restrictions |

| result | ENUM | passed, failed, conditional |

### ISSUED_CERTIFICATES

| Field | Type | Description |

|-------|------|-------------|

| certificate_no | VARCHAR(30) | "SC-2026-00001" |

| final_plat_reference | VARCHAR(50) | Reference to final plat map |

| valid_until | DATE | Certificate validity |

| conditions | TEXT | Special conditions |

---

## User Roles

| Role | Subdivision Review | Building Review |

|------|-------------------|-----------------|

| **citizen** | N/A (developers submit) | N/A (from P&L) |

| **developer** | Submit applications, upload documents, track status | N/A |

| **staff** | Review all stages, record findings | Review building plans |

| **admin** | All above + issue certificates, manage system | All above + POST to P&L |

---

## 8 Tables Summary

| # | Table | Purpose |

|---|-------|---------|

| 1 | USERS | Staff, developers, admin |

| 2 | SUBDIVISION_APPLICATIONS | Developer subdivision applications |

| 3 | SUBDIVISION_DOCUMENTS | Uploaded plans per stage |

| 4 | SUBDIVISION_STAGE_REVIEWS | Review records per stage |

| 5 | ISSUED_CERTIFICATES | Subdivision certificates |

| 6 | BUILDING_REVIEWS | Building reviews from P&L |

| 7 | BUILDING_PLAN_CHECKS | Safety, structural, deed checks |

| 8 | APPLICATION_HISTORY | Audit trail for both |

| 9 | NOTIFICATIONS | User alerts |

---

## All ENUM Values

```sql
-- role (users)
'staff', 'developer', 'admin'

-- applicant_type
'developer', 'authorized_rep'

-- subdivision document_type
'concept_plan', 'vicinity_map', 'preliminary_plat', 'site_analysis', 'environmental_assessment', 'engineering_water', 'engineering_sewer', 'engineering_drainage', 'engineering_streets', 'final_plat', 'compliance_docs'

-- subdivision stage
'concept', 'preliminary', 'improvement', 'final'

-- subdivision status
'submitted', 'concept_review', 'preliminary_review', 'improvement_review', 'final_review', 'approved', 'denied', 'revision'

-- stage review result
'approved', 'revision_required', 'denied'

-- building check_type
'safety_sanitation', 'structural', 'deed_restrictions'

-- building check result
'passed', 'failed', 'conditional'

-- building review status
'fetched', 'under_review', 'approved', 'denied', 'posted'

-- certificate status
'active', 'revoked', 'expired'
```

---

## External Integrations

| Integration | Direction | Purpose |

|-------------|-----------|---------|

| Zoning Clearance System | FETCH | Verify zoning clearance for subdivision |

| Permit & Licensing | FETCH | Receive building permit applications |

| Permit & Licensing | POST | Send building review results |

---

## Cross-System References

| Field | References | Type | Validation |
|-------|-----------|------|------------|
| `zoning_clearance_no` (SUBDIVISION_APPLICATIONS) | Zoning Clearance System (ISSUED_CLEARANCES) | VARCHAR(30) | API verification on application submission |
| `zoning_clearance_no` (BUILDING_REVIEWS) | Zoning Clearance System (ISSUED_CLEARANCES) | VARCHAR(30) | Fetched from P&L, verified via API |
| `building_permit_no` (BUILDING_REVIEWS) | Permit & Licensing (Building Permits) | VARCHAR(30) | Fetched from P&L system |

**Note:** These fields are reference strings (not foreign keys) because they link to different systems. They enable traceability and verification across systems.

---

## Data Synchronization

| Event | Trigger | Action |
|-------|---------|--------|
| **Subdivision Application** | Developer submits application | FETCH zoning clearance from Zoning Clearance System to verify prerequisite |
| **Subdivision Certificate Issued** | Final plat approved | POST improvement plan data to Infrastructure Project Coordination |
| **Building Permit Submitted** | P&L submits building permit for review | FETCH building permit application and plans from P&L |
| **Building Review Complete** | Building review approved/denied | POST review result back to P&L system |

**Synchronization Type:** Event-driven (real-time on submission/approval)

---

## Recommended Indexes

For optimal query performance, create indexes on:

```sql
-- Subdivision application tracking
CREATE INDEX idx_subdivision_ref ON SUBDIVISION_APPLICATIONS(reference_no);
CREATE INDEX idx_subdivision_zoning ON SUBDIVISION_APPLICATIONS(zoning_clearance_no);
CREATE INDEX idx_subdivision_stage ON SUBDIVISION_APPLICATIONS(current_stage);
CREATE INDEX idx_subdivision_status ON SUBDIVISION_APPLICATIONS(status);
CREATE INDEX idx_subdivision_user ON SUBDIVISION_APPLICATIONS(user_id);

-- Building review tracking
CREATE INDEX idx_building_pl_ref ON BUILDING_REVIEWS(pl_reference_no);
CREATE INDEX idx_building_permit ON BUILDING_REVIEWS(building_permit_no);
CREATE INDEX idx_building_zoning ON BUILDING_REVIEWS(zoning_clearance_no);
CREATE INDEX idx_building_status ON BUILDING_REVIEWS(status);

-- Certificate tracking
CREATE INDEX idx_certificate_no ON ISSUED_CERTIFICATES(certificate_no);
CREATE INDEX idx_certificate_application ON ISSUED_CERTIFICATES(application_id);
CREATE INDEX idx_certificate_status ON ISSUED_CERTIFICATES(status);

-- Stage review tracking
CREATE INDEX idx_stage_application ON SUBDIVISION_STAGE_REVIEWS(application_id);
CREATE INDEX idx_stage_type ON SUBDIVISION_STAGE_REVIEWS(stage);
CREATE INDEX idx_stage_result ON SUBDIVISION_STAGE_REVIEWS(result);

-- Building plan checks
CREATE INDEX idx_check_building ON BUILDING_PLAN_CHECKS(building_review_id);
CREATE INDEX idx_check_type ON BUILDING_PLAN_CHECKS(check_type);
CREATE INDEX idx_check_result ON BUILDING_PLAN_CHECKS(result);

-- Application history
CREATE INDEX idx_history_application ON APPLICATION_HISTORY(application_id);
CREATE INDEX idx_history_type ON APPLICATION_HISTORY(application_type);
CREATE INDEX idx_history_status ON APPLICATION_HISTORY(status);
```

---

## Standardized Components

### APPLICATION_HISTORY Structure

Standardized across all systems with one addition:

- `id` (PK)
- `application_type` (ENUM) - distinguishes 'subdivision' vs 'building'
- `application_id` (FK)
- `status` (ENUM)
- `remarks` (TEXT)
- `updated_by` (FK to USERS)
- `updated_at` (DATETIME)

The `application_type` field is unique to this system to handle both subdivision and building reviews.

---

## Implementation

**File to create:** `schema_sbr.sql`

- All 9 tables
- Foreign key constraints
- Indexes
- ENUM definitions
- See Unified Role System document for role definitions