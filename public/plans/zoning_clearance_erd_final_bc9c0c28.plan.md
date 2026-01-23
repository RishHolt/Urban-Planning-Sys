---
name: Zoning Clearance ERD Final
overview: Complete ERD with 10 tables. Supports individual lot applications AND new subdivision development applications. Uses pin location instead of parcel selection.
todos:
  - id: create-schema
    content: Create schema.sql with all 10 tables supporting both individual lot and subdivision development applications
    status: pending
---

# Zoning Clearance System - Complete Plan

## Overview

- 10 database tables (removed PARCELS, using pin location)
- 4 user roles: citizen, staff, inspector, admin
- GIS integration with Leaflet (zone polygons + pin location)
- **Two application categories:**
  - Individual lot (regular or within subdivision)
  - Subdivision development (new subdivision projects)
- External API integrations (Treasury, Permit & Licensing)

---

## ERD Diagram

```mermaid
erDiagram
    USERS ||--o{ CLEARANCE_APPLICATIONS : submits
    USERS ||--o{ APPLICATION_HISTORY : updates
    USERS ||--o{ INSPECTIONS : conducts
    USERS ||--o{ ISSUED_CLEARANCES : issues
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ PAYMENT_RECORDS : records
    
    ZONES ||--o{ CLEARANCE_APPLICATIONS : contains
    
    CLEARANCE_APPLICATIONS ||--o{ APPLICATION_HISTORY : tracks
    CLEARANCE_APPLICATIONS ||--o{ DOCUMENTS : has
    CLEARANCE_APPLICATIONS ||--o{ EXTERNAL_VERIFICATIONS : verifies
    CLEARANCE_APPLICATIONS ||--o| INSPECTIONS : requires
    CLEARANCE_APPLICATIONS ||--o| ISSUED_CLEARANCES : generates
    CLEARANCE_APPLICATIONS ||--o| PAYMENT_RECORDS : requires

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

    ZONES {
        INT id PK
        VARCHAR code UK
        VARCHAR name
        TEXT description
        TEXT allowed_uses
        TEXT geometry
        VARCHAR color
        BOOLEAN is_active
    }

    CLEARANCE_APPLICATIONS {
        INT id PK
        VARCHAR reference_no UK
        INT user_id FK
        INT zone_id FK
        ENUM application_category
        ENUM applicant_type
        VARCHAR contact_number
        VARCHAR contact_email
        VARCHAR tax_dec_ref_no
        VARCHAR barangay_permit_ref_no
        DECIMAL pin_lat
        DECIMAL pin_lng
        VARCHAR lot_address
        VARCHAR lot_owner
        DECIMAL lot_area_total
        BOOLEAN is_subdivision
        VARCHAR subdivision_name
        VARCHAR block_no
        VARCHAR lot_no
        INT total_lots_planned
        BOOLEAN has_subdivision_plan
        ENUM land_use_type
        ENUM project_type
        VARCHAR building_type
        TEXT project_description
        ENUM existing_structure
        INT number_of_storeys
        DECIMAL floor_area_sqm
        DECIMAL estimated_cost
        TEXT purpose
        DECIMAL assessed_fee
        ENUM status
        TEXT denial_reason
        BOOLEAN is_active
        DATETIME submitted_at
        DATETIME processed_at
        DATETIME updated_at
    }

    EXTERNAL_VERIFICATIONS {
        INT id PK
        INT application_id FK
        ENUM verification_type
        VARCHAR reference_no
        ENUM status
        TEXT response_data
        VARCHAR external_system
        DATETIME verified_at
        DATETIME created_at
    }

    APPLICATION_HISTORY {
        INT id PK
        INT application_id FK
        ENUM status
        TEXT remarks
        INT updated_by FK
        DATETIME updated_at
    }

    DOCUMENTS {
        INT id PK
        INT application_id FK
        VARCHAR file_name
        VARCHAR file_path
        VARCHAR file_type
        BIGINT file_size
        DATETIME uploaded_at
    }

    PAYMENT_RECORDS {
        INT id PK
        INT application_id FK
        VARCHAR or_number UK
        DECIMAL amount
        DATE payment_date
        VARCHAR treasury_ref
        INT recorded_by FK
        DATETIME created_at
    }

    INSPECTIONS {
        INT id PK
        INT application_id FK
        INT inspector_id FK
        DATE scheduled_date
        TEXT findings
        ENUM result
        DATETIME inspected_at
    }

    ISSUED_CLEARANCES {
        INT id PK
        VARCHAR clearance_no UK
        INT application_id FK
        INT issued_by FK
        DATE issue_date
        DATE valid_until
        TEXT conditions
        ENUM status
        DATETIME created_at
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

## Application Categories

### Category 1: Individual Lot (`individual_lot`)

For citizens applying for a single lot (regular or within subdivision).

**Required fields:**

- pin_lat, pin_lng (exact location)
- lot_address, lot_owner, lot_area_total
- is_subdivision (true/false)
- If subdivision: subdivision_name, block_no, lot_no
- land_use_type, project_type, building_type, etc.

**Example: Regular Lot**

```
application_category: individual_lot
pin_lat: 14.5995
pin_lng: 120.9842
lot_address: "123 Rizal Street, Brgy. Centro"
lot_owner: "Juan Dela Cruz"
lot_area_total: 200 sqm
is_subdivision: FALSE
land_use_type: residential
project_type: new_construction
building_type: "Single Family House"
```

**Example: Lot in Existing Subdivision**

```
application_category: individual_lot
pin_lat: 14.6012
pin_lng: 120.9856
lot_address: "Golden Acres Subdivision, Brgy. Poblacion"
lot_owner: "Maria Santos"
lot_area_total: 150 sqm
is_subdivision: TRUE
subdivision_name: "Golden Acres Subdivision"
block_no: "Block 5"
lot_no: "Lot 12"
land_use_type: residential
project_type: new_construction
building_type: "Townhouse"
```

---

### Category 2: Subdivision Development (`subdivision_development`)

For developers applying to create a new subdivision.

**Required fields:**

- pin_lat, pin_lng (center of development)
- lot_address (location of land)
- lot_owner (developer/company name)
- lot_area_total (entire land area)
- subdivision_name (proposed name)
- total_lots_planned (how many lots)
- has_subdivision_plan (must be TRUE)

**Example: New Subdivision**

```
application_category: subdivision_development
pin_lat: 14.6100
pin_lng: 120.9900
lot_address: "Brgy. San Isidro, along National Highway"
lot_owner: "ABC Development Corp."
lot_area_total: 50000 sqm (5 hectares)
is_subdivision: TRUE
subdivision_name: "Sunrise Village" (proposed)
total_lots_planned: 75
has_subdivision_plan: TRUE
land_use_type: residential
project_type: new_construction
project_description: "75-lot residential subdivision with main road, drainage system, and open space"
```

---

## CLEARANCE_APPLICATIONS Table (Complete)

### Basic Info

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| id | INT | Auto | PK |

| reference_no | VARCHAR(20) | Auto | "ZC-2026-00001" |

| user_id | INT | Yes | FK - who applied |

| zone_id | INT | Auto | FK - detected from pin |

| application_category | ENUM | Yes | 'individual_lot', 'subdivision_development' |

### Applicant Info

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| applicant_type | ENUM | Yes | 'owner', 'authorized_rep', 'contractor' |

| contact_number | VARCHAR(20) | Yes | Phone |

| contact_email | VARCHAR(100) | No | Email |

### Prerequisites (API Verified)

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| tax_dec_ref_no | VARCHAR(50) | Yes | Tax Declaration ref |

| barangay_permit_ref_no | VARCHAR(50) | Yes | Barangay Permit ref |

### Location (Pin)

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| pin_lat | DECIMAL(10,8) | Yes | Latitude |

| pin_lng | DECIMAL(11,8) | Yes | Longitude |

### Property Info

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| lot_address | VARCHAR(255) | Yes | Full address |

| lot_owner | VARCHAR(150) | Yes | Owner/Developer name |

| lot_area_total | DECIMAL(12,2) | Yes | Total area sqm |

### Subdivision Info

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| is_subdivision | BOOLEAN | Yes | TRUE/FALSE |

| subdivision_name | VARCHAR(100) | If subdiv | Name |

| block_no | VARCHAR(20) | Individual lot in subdiv | Block |

| lot_no | VARCHAR(20) | Individual lot in subdiv | Lot |

| total_lots_planned | INT | Subdiv development | Number of lots |

| has_subdivision_plan | BOOLEAN | Subdiv development | Has plan uploaded |

### Project Details

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| land_use_type | ENUM | Yes | residential, commercial, etc. |

| project_type | ENUM | Yes | new_construction, etc. |

| building_type | VARCHAR(100) | Individual lot | "House", "Store" |

| project_description | TEXT | Yes | Full details |

| existing_structure | ENUM | Yes | none, existing_to_retain, etc. |

| number_of_storeys | INT | Individual lot | Floors |

| floor_area_sqm | DECIMAL(10,2) | Individual lot | Built area |

| estimated_cost | DECIMAL(15,2) | No | Budget |

| purpose | TEXT | Yes | Why |

### Fees & Status

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| assessed_fee | DECIMAL(10,2) | Staff sets | Fee amount |

| status | ENUM | Auto | pending, under_review, etc. |

| denial_reason | TEXT | If denied | Why denied |

### System

| Field | Type | Required | Description |

|-------|------|----------|-------------|

| is_active | BOOLEAN | Default TRUE | Soft delete |

| submitted_at | DATETIME | Auto | When submitted |

| processed_at | DATETIME | When done | When finalized |

| updated_at | DATETIME | Auto | Last update |

---

## Workflow Diagram

```mermaid
flowchart TD
    subgraph prereq [Phase 0: Prerequisites]
        A1[Verify Tax Declaration - Treasury API]
        A1 --> A2[Verify Barangay Permit - P&L API]
        A2 --> A3{Both Verified?}
        A3 -->|No| A4[Cannot Proceed]
        A3 -->|Yes| A5[Proceed to Application]
    end

    subgraph apply [Phase 1: Application]
        B1[Select Category]
        B1 --> B2{Individual or Subdivision Dev?}
        B2 -->|Individual| B3[Pin Location on Map]
        B2 -->|Subdiv Dev| B4[Pin Center of Land]
        B3 --> B5[Fill Individual Lot Form]
        B4 --> B6[Fill Subdivision Dev Form]
        B5 --> B7[Upload Documents]
        B6 --> B7
        B7 --> B8[Submit]
    end

    subgraph payment [Phase 2: Payment]
        C1[Pay at Treasury]
        C1 --> C2[Get OR]
        C2 --> C3[Staff Records OR]
    end

    subgraph review [Phase 3-4: Review]
        D1[Staff Reviews]
        D1 --> D2{Documents OK?}
        D2 -->|No| D3[Request More]
        D3 --> B7
        D2 -->|Yes| D4{Zoning Compliant?}
        D4 -->|No| D5[DENIED]
        D4 -->|Yes| D6[Forward to Inspection]
    end

    subgraph inspect [Phase 5: Inspection]
        E1[Inspector Visits]
        E1 --> E2{Pass?}
        E2 -->|No| D5
        E2 -->|Yes| E3[Recommend Approval]
    end

    subgraph approve [Phase 6: Approval]
        F1[Admin Reviews]
        F1 --> F2{Approve?}
        F2 -->|No| D5
        F2 -->|Yes| F3[Issue Clearance]
        F3 --> F4[APPROVED]
    end

    A5 --> B1
    B8 --> D1
    B8 -.-> C1
    C3 -.-> D1
    D6 --> E1
    E3 --> F1
    D5 --> G1[Notify: Denied]
    F4 --> G2[Notify: Approved]
```

---

## 10 Tables Summary

| # | Table | Purpose |

|---|-------|---------|

| 1 | USERS | All system users (4 roles) |

| 2 | ZONES | Map zone polygons with rules |

| 3 | CLEARANCE_APPLICATIONS | Main application (28 fields) |

| 4 | EXTERNAL_VERIFICATIONS | API verification logs |

| 5 | APPLICATION_HISTORY | Audit trail |

| 6 | DOCUMENTS | File attachments |

| 7 | PAYMENT_RECORDS | Treasury OR reference |

| 8 | INSPECTIONS | Site visit records |

| 9 | ISSUED_CLEARANCES | Final certificates |

| 10 | NOTIFICATIONS | User alerts |

---

## All ENUM Values

```sql
- role (users)
'citizen', 'staff', 'inspector', 'admin'

-- application_category
'individual_lot', 'subdivision_development'

-- applicant_type
'owner', 'authorized_rep', 'contractor'

-- land_use_type
'residential', 'commercial', 'industrial', 'agricultural', 'institutional', 'mixed_use'

-- project_type
'new_construction', 'renovation', 'addition', 'change_of_use'

-- existing_structure
'none', 'existing_to_retain', 'existing_to_demolish', 'existing_to_renovate'

-- status (applications)
'pending', 'under_review', 'for_inspection', 'approved', 'denied'

-- verification_type
'tax_declaration', 'barangay_permit'

-- verification status
'pending', 'verified', 'failed', 'expired'

-- result (inspections)
'pending', 'passed', 'failed'

-- status (issued_clearances)
'active', 'revoked', 'expired'
```

---

## Cross-System References

| Field | References | Type | Validation |

|-------|-----------|------|------------|

| `tax_dec_ref_no` | Treasury System (Tax Declarations) | VARCHAR(50) | API verification before application submission |

| `barangay_permit_ref_no` | Permit & Licensing (Barangay Permits) | VARCHAR(50) | API verification before application submission |

**Note:** These are prerequisite references that must be verified before an application can be submitted. They are stored as reference strings for audit purposes.

**Clearance Number Usage:**

- `clearance_no` (from ISSUED_CLEARANCES) is referenced by:
  - Subdivision & Building Review (as prerequisite)
  - Housing Beneficiary Registry (for housing projects)

---

## Data Synchronization

| Event | Trigger | Action |

|-------|---------|--------|

| **Application Submission** | Citizen submits application | FETCH Tax Declaration from Treasury API, FETCH Barangay Permit from P&L API |

| **Payment Recorded** | Staff records OR number | FETCH payment verification from Treasury |

| **Clearance Issued** | Clearance approved and issued | Available for FETCH by S&B Review and Housing Registry systems |

**Synchronization Type:** Event-driven (real-time on submission) and on-demand (when other systems need to verify clearance)

---

## Recommended Indexes

For optimal query performance, create indexes on:

```sql
-- Application tracking
CREATE INDEX idx_application_ref ON CLEARANCE_APPLICATIONS(reference_no);
CREATE INDEX idx_application_user ON CLEARANCE_APPLICATIONS(user_id);
CREATE INDEX idx_application_zone ON CLEARANCE_APPLICATIONS(zone_id);
CREATE INDEX idx_application_category ON CLEARANCE_APPLICATIONS(application_category);
CREATE INDEX idx_application_status ON CLEARANCE_APPLICATIONS(status);
CREATE INDEX idx_application_subdivision ON CLEARANCE_APPLICATIONS(is_subdivision);

-- Location queries
CREATE INDEX idx_application_location ON CLEARANCE_APPLICATIONS(pin_lat, pin_lng);

-- Prerequisite tracking
CREATE INDEX idx_tax_dec_ref ON CLEARANCE_APPLICATIONS(tax_dec_ref_no);
CREATE INDEX idx_barangay_permit ON CLEARANCE_APPLICATIONS(barangay_permit_ref_no);

-- Clearance tracking
CREATE INDEX idx_clearance_no ON ISSUED_CLEARANCES(clearance_no);
CREATE INDEX idx_clearance_application ON ISSUED_CLEARANCES(application_id);
CREATE INDEX idx_clearance_status ON ISSUED_CLEARANCES(status);
CREATE INDEX idx_clearance_validity ON ISSUED_CLEARANCES(valid_until);

-- Inspection scheduling
CREATE INDEX idx_inspection_application ON INSPECTIONS(application_id);
CREATE INDEX idx_inspection_inspector ON INSPECTIONS(inspector_id);
CREATE INDEX idx_inspection_date ON INSPECTIONS(scheduled_date);
CREATE INDEX idx_inspection_result ON INSPECTIONS(result);

-- Payment tracking
CREATE INDEX idx_payment_application ON PAYMENT_RECORDS(application_id);
CREATE INDEX idx_payment_or ON PAYMENT_RECORDS(or_number);
CREATE INDEX idx_payment_date ON PAYMENT_RECORDS(payment_date);

-- Zone lookups
CREATE INDEX idx_zone_code ON ZONES(code);
CREATE INDEX idx_zone_active ON ZONES(is_active);

-- Application history
CREATE INDEX idx_history_application ON APPLICATION_HISTORY(application_id);
CREATE INDEX idx_history_status ON APPLICATION_HISTORY(status);
CREATE INDEX idx_history_updated_by ON APPLICATION_HISTORY(updated_by);
```

---

## Standardized Components

### APPLICATION_HISTORY Structure

Standardized across all systems:

- `id` (PK)
- `application_id` (FK)
- `status` (ENUM)
- `remarks` (TEXT)
- `updated_by` (FK to USERS)
- `updated_at` (DATETIME)

This ensures consistent audit trail tracking across all EIS modules.

---

## Implementation

**File to create:** `schema.sql`

- All 10 tables
- Foreign key constraints
- Indexes
- ENUM definitions
- See Unified Role System document for role definitions