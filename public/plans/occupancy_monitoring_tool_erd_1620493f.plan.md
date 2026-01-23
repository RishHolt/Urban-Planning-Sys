---
name: Occupancy Monitoring Tool ERD
overview: Complete ERD for Occupancy Monitoring Tool with 12 tables. Includes inspection photos, complaints tracking, and occupancy capacity fields for overcrowding detection.
todos:
  - id: create-occupancy-schema
    content: Create schema_occupancy.sql with all 12 tables including inspection photos, complaints, and occupancy capacity tracking
    status: pending
---

# Occupancy Monitoring Tool - Complete Plan

## Overview

**Purpose:** Monitor occupancy status of all structures (buildings, housing units, commercial spaces) for compliance, tax collection, and safety

**Key Functions:**

- Register buildings/units from various sources
- Track occupancy status (vacant/occupied)
- Conduct regular and on-demand inspections
- Record occupant information
- Monitor compliance with approved use
- Track violations and issues
- Handle complaints
- Store inspection photos as evidence
- Detect overcrowding violations
- Generate reports for tax collection and compliance

**Data Sources:**

- Subdivision & Building Review (approved buildings)
- Housing Beneficiary Registry (allocated units)
- Building Permits from Permit & Licensing

**Inspection Types:**

- Annual inspections
- Periodic inspections (varies by type)
- On-demand inspections (complaints, violations)

---

## ERD Diagram

```mermaid
erDiagram
    USERS ||--o{ BUILDINGS : registers
    USERS ||--o{ OCCUPANCY_RECORDS : records
    USERS ||--o{ INSPECTIONS : conducts
    USERS ||--o{ VIOLATIONS : issues
    USERS ||--o{ COMPLAINTS : handles
    USERS ||--o{ NOTIFICATIONS : receives
    
    BUILDINGS ||--o{ BUILDING_UNITS : contains
    BUILDINGS ||--o{ OCCUPANCY_RECORDS : has
    BUILDINGS ||--o{ INSPECTIONS : undergoes
    BUILDINGS ||--o{ VIOLATIONS : has
    BUILDINGS ||--o{ COMPLAINTS : receives
    
    BUILDING_UNITS ||--o{ OCCUPANCY_RECORDS : tracks
    BUILDING_UNITS ||--o{ INSPECTIONS : has
    BUILDING_UNITS ||--o{ COMPLAINTS : receives
    
    OCCUPANCY_RECORDS ||--o{ OCCUPANTS : lists
    OCCUPANCY_RECORDS ||--o{ OCCUPANCY_HISTORY : tracks

    INSPECTIONS ||--o{ INSPECTION_PHOTOS : has
    INSPECTIONS ||--o| COMPLAINTS : triggered_by
    INSPECTIONS ||--o{ VIOLATIONS : finds

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

    BUILDINGS {
        INT id PK
        VARCHAR building_code UK
        VARCHAR sbr_reference_no
        VARCHAR building_permit_no
        VARCHAR housing_project_code
        VARCHAR building_name
        VARCHAR address
        DECIMAL pin_lat
        DECIMAL pin_lng
        VARCHAR owner_name
        VARCHAR owner_contact
        ENUM building_type
        ENUM structure_source
        INT total_floors
        INT total_units
        DECIMAL total_floor_area_sqm
        ENUM occupancy_status
        DATE certificate_of_occupancy_date
        DATE last_inspection_date
        DATE next_inspection_date
        BOOLEAN is_active
        DATETIME registered_at
        DATETIME updated_at
    }

    BUILDING_UNITS {
        INT id PK
        INT building_id FK
        VARCHAR unit_no UK
        INT floor_number
        ENUM unit_type
        DECIMAL floor_area_sqm
        INT max_occupants
        INT current_occupant_count
        ENUM status
        VARCHAR current_occupant_name
        DATE occupancy_start_date
        DATE last_inspection_date
        DATE next_inspection_date
        DATETIME created_at
        DATETIME updated_at
    }

    OCCUPANCY_RECORDS {
        INT id PK
        INT building_id FK
        INT unit_id FK
        ENUM record_type
        DATE start_date
        DATE end_date
        ENUM occupancy_type
        TEXT purpose_of_use
        ENUM compliance_status
        TEXT remarks
        INT recorded_by FK
        DATETIME created_at
        DATETIME updated_at
    }

    OCCUPANTS {
        INT id PK
        INT occupancy_record_id FK
        VARCHAR full_name
        VARCHAR contact_number
        VARCHAR email
        ENUM relationship_to_owner
        DATE move_in_date
        DATE move_out_date
        BOOLEAN is_primary_occupant
        DATETIME created_at
    }

    OCCUPANCY_HISTORY {
        INT id PK
        INT occupancy_record_id FK
        ENUM status
        TEXT remarks
        INT updated_by FK
        DATETIME updated_at
    }

    INSPECTIONS {
        INT id PK
        INT building_id FK
        INT unit_id FK
        ENUM inspection_type
        INT inspector_id FK
        INT complaint_id FK
        DATE scheduled_date
        DATE inspection_date
        TEXT findings
        TEXT compliance_notes
        ENUM result
        TEXT recommendations
        DATE next_inspection_date
        DATETIME inspected_at
        DATETIME created_at
    }

    INSPECTION_PHOTOS {
        INT id PK
        INT inspection_id FK
        VARCHAR photo_path
        VARCHAR photo_description
        DATETIME taken_at
        INT taken_by FK
        DATETIME created_at
    }

    COMPLAINTS {
        INT id PK
        VARCHAR complaint_no UK
        INT building_id FK
        INT unit_id FK
        VARCHAR complainant_name
        VARCHAR complainant_contact
        ENUM complaint_type
        TEXT description
        ENUM priority
        ENUM status
        INT assigned_to FK
        INT inspection_id FK
        TEXT resolution
        INT resolved_by FK
        DATETIME resolved_at
        DATETIME submitted_at
        DATETIME updated_at
    }

    VIOLATIONS {
        INT id PK
        VARCHAR violation_no UK
        INT building_id FK
        INT unit_id FK
        INT inspection_id FK
        ENUM violation_type
        TEXT description
        ENUM severity
        ENUM status
        DATE violation_date
        DATE compliance_deadline
        DATE resolved_date
        TEXT resolution
        DECIMAL fine_amount
        INT issued_by FK
        INT resolved_by FK
        DATETIME created_at
        DATETIME updated_at
    }

    COMPLIANCE_REPORTS {
        INT id PK
        INT building_id FK
        INT unit_id FK
        INT year
        INT quarter
        ENUM compliance_status
        INT violations_count
        INT inspections_count
        TEXT summary
        DATETIME generated_at
        INT generated_by FK
    }

    NOTIFICATIONS {
        INT id PK
        INT user_id FK
        INT building_id FK
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
    subgraph registration [Phase 1: Building Registration]
        A1[Receive Building Data]
        A1 --> A2{Source?}
        A2 -->|S&B Review| A3[Register from Subdivision Certificate]
        A2 -->|Housing Registry| A4[Register from Allocation]
        A2 -->|Building Permit| A5[Register from P&L]
        A3 --> A6[Create Building Record]
        A4 --> A6
        A5 --> A6
        A6 --> A7[Create Unit Records with Capacity]
    end

    subgraph occupancy [Phase 2: Occupancy Tracking]
        B1[Record Move-In]
        B1 --> B2[Enter Occupant Information]
        B2 --> B3[Update Occupant Count]
        B3 --> B4{Exceeds Capacity?}
        B4 -->|Yes| B5[Flag Overcrowding Violation]
        B4 -->|No| B6[Set Occupancy Status]
        B6 --> B7[Schedule Initial Inspection]
    end

    subgraph complaints [Phase 2b: Complaint Handling]
        C1[Complaint Received]
        C1 --> C2[Assign to Inspector]
        C2 --> C3[Schedule Inspection]
        C3 --> C4[Link to Inspection]
    end

    subgraph inspection [Phase 3: Inspections]
        D1[Conduct Inspection]
        D1 --> D2[Take Photos]
        D2 --> D3[Record Findings]
        D3 --> D4{Compliant?}
        D4 -->|Yes| D5[Record Compliance]
        D4 -->|No| D6[Issue Violation with Photos]
    end

    subgraph compliance [Phase 4: Compliance Management]
        E1[Violation Issued]
        E1 --> E2[Set Compliance Deadline]
        E2 --> E3[Notify Owner/Occupant]
        E3 --> E4{Resolved?}
        E4 -->|Yes| E5[Verify with Follow-Up Inspection]
        E4 -->|No| E6[Escalate/Issue Fine]
        E5 --> E7[Mark Resolved]
    end

    A7 --> B1
    C1 --> C3
    C4 --> D1
    B5 --> D1
    B7 --> D1
    D6 --> E1
    E7 --> F1[Generate Reports]
```

---

## New Tables Explained

### INSPECTION_PHOTOS

Photo evidence for inspections and violations.

| Field | Type | Description |

|-------|------|-------------|

| id | INT | PK |

| inspection_id | INT FK | Which inspection |

| photo_path | VARCHAR(500) | File path to photo |

| photo_description | VARCHAR(255) | What the photo shows |

| taken_at | DATETIME | When photo was taken |

| taken_by | INT FK | Staff who took photo |

**Example:**

```
Inspection: INS-2026-00001
Photo 1: "/photos/2026/01/violation_unauthorized_construction.jpg"
Description: "Unauthorized extension on 2nd floor"
Taken: 2026-01-20 14:30:00
```

**Use Cases:**

- Before/after violation photos
- Evidence for violations
- Documentation of compliance
- Visual inspection records

---

### COMPLAINTS

Complaints that trigger inspections.

| Field | Type | Description |

|-------|------|-------------|

| id | INT | PK |

| complaint_no | VARCHAR(30) | "CMP-2026-00001" |

| building_id | INT FK | Building complained about |

| unit_id | INT FK | Unit (if specific) |

| complainant_name | VARCHAR(150) | Who complained |

| complainant_contact | VARCHAR(50) | Contact info |

| complaint_type | ENUM | Type of complaint |

| description | TEXT | Details |

| priority | ENUM | low, medium, high, urgent |

| status | ENUM | open, assigned, investigated, resolved, closed |

| assigned_to | INT FK | Inspector assigned |

| inspection_id | INT FK | Inspection triggered by complaint |

| resolution | TEXT | How it was resolved |

| resolved_by | INT FK | Staff who resolved |

**Complaint Types:**

```sql
'noise'              -- Excessive noise
'sanitation'         -- Sanitation issues
'unauthorized_use'  -- Using unit for wrong purpose
'overcrowding'       -- Too many people
'fire_hazard'        -- Fire safety concerns
'structural'         -- Structural issues
'parking'            -- Parking violations
'other'
```

**Workflow:**

```
Complaint Received → Assigned to Inspector → Inspection Scheduled → 
Inspection Conducted → Violation Issued (if needed) → Resolved
```

---

## Updated BUILDING_UNITS Table

Added occupancy capacity fields:

| Field | Type | Description |

|-------|------|-------------|

| max_occupants | INT | Maximum allowed occupants |

| current_occupant_count | INT | Current number of occupants |

**Auto-Detection Logic:**

```
When recording move-in:
1. Count total occupants in OCCUPANTS table for unit
2. Update current_occupant_count
3. If current_occupant_count > max_occupants:
   → Flag overcrowding violation
   → Notify inspector
   → Schedule inspection
```

**Example:**

```
Unit: Unit 101
max_occupants: 4
current_occupant_count: 6
→ VIOLATION: Overcrowding detected
```

---

## Tables Explained

### BUILDINGS

Main registry of all structures being monitored.

| Field | Type | Description |

|-------|------|-------------|

| building_code | VARCHAR(30) | "BLD-2026-00001" |

| sbr_reference_no | VARCHAR(30) | From Subdivision & Building Review |

| building_permit_no | VARCHAR(30) | From Permit & Licensing |

| housing_project_code | VARCHAR(30) | From Housing Beneficiary Registry |

| structure_source | ENUM | 'sbr', 'housing', 'building_permit', 'manual' |

| building_type | ENUM | 'residential', 'commercial', 'industrial', 'mixed_use', 'institutional' |

| occupancy_status | ENUM | 'vacant', 'partially_occupied', 'fully_occupied', 'under_construction', 'condemned' |

| last_inspection_date | DATE | Most recent inspection |

| next_inspection_date | DATE | When next inspection is due |

### BUILDING_UNITS

Individual units within buildings.

| Field | Type | Description |

|-------|------|-------------|

| unit_no | VARCHAR(20) | "Unit 101", "Lot 12" |

| unit_type | ENUM | 'residential', 'commercial', 'office', 'warehouse', 'parking' |

| max_occupants | INT | Maximum allowed occupants (NEW) |

| current_occupant_count | INT | Current occupant count (NEW) |

| status | ENUM | 'vacant', 'occupied', 'reserved', 'under_renovation', 'maintenance' |

| current_occupant_name | VARCHAR(150) | Quick reference |

| occupancy_start_date | DATE | When current occupancy started |

| next_inspection_date | DATE | When unit needs inspection |

### OCCUPANCY_RECORDS

Detailed occupancy tracking.

| Field | Type | Description |

|-------|------|-------------|

| record_type | ENUM | 'move_in', 'move_out', 'transfer', 'renewal', 'update' |

| occupancy_type | ENUM | 'owner_occupied', 'rented', 'leased', 'commercial_tenant' |

| purpose_of_use | TEXT | How the unit is being used |

| compliance_status | ENUM | 'compliant', 'non_compliant', 'pending_review', 'conditional' |

### OCCUPANTS

People occupying the units.

| Field | Type | Description |

|-------|------|-------------|

| full_name | VARCHAR(150) | Occupant name |

| relationship_to_owner | ENUM | 'owner', 'tenant', 'family_member', 'authorized_occupant' |

| is_primary_occupant | BOOLEAN | Main occupant for contact |

### INSPECTIONS

All inspection records.

| Field | Type | Description |

|-------|------|-------------|

| inspection_type | ENUM | 'annual', 'periodic', 'pre_occupancy', 'complaint_based', 'follow_up', 'random' |

| complaint_id | INT FK | If triggered by complaint (NEW) |

| findings | TEXT | What was observed |

| compliance_notes | TEXT | Compliance status notes |

| result | ENUM | 'compliant', 'non_compliant', 'conditional', 'pending_correction' |

| next_inspection_date | DATE | When to inspect again |

### VIOLATIONS

Compliance violations found.

| Field | Type | Description |

|-------|------|-------------|

| violation_no | VARCHAR(30) | "VIO-2026-00001" |

| violation_type | ENUM | Type of violation |

| severity | ENUM | 'minor', 'major', 'critical' |

| status | ENUM | 'open', 'under_review', 'resolved', 'appealed', 'closed' |

| compliance_deadline | DATE | When violation must be fixed |

| fine_amount | DECIMAL(10,2) | Fine if applicable |

### COMPLIANCE_REPORTS

Periodic compliance summaries.

| Field | Type | Description |

|-------|------|-------------|

| year | INT | Report year |

| quarter | INT | 1-4 (quarterly reports) |

| compliance_status | ENUM | Overall status |

| violations_count | INT | Number of violations |

| inspections_count | INT | Number of inspections |

---

## Inspection Types

| Type | Frequency | Purpose |

|------|-----------|---------|

| **Annual** | Once per year | Regular compliance check |

| **Periodic** | Varies (6 months, quarterly) | Based on building type/risk |

| **Pre-Occupancy** | Before move-in | Verify unit ready for occupancy |

| **Complaint-Based** | On-demand | When complaint received |

| **Follow-Up** | After violation | Verify violation fixed |

| **Random** | Random selection | Spot checks |

---

## Violation Types

| Type | Description |

|------|-------------|

| `unauthorized_use` | Using unit for purpose not approved |

| `overcrowding` | Exceeding maximum occupancy (auto-detected) |

| `structural_modification` | Unauthorized structural changes |

| `fire_safety` | Fire safety violations |

| `sanitation` | Sanitation/health violations |

| `noise` | Noise violations |

| `parking` | Parking violations |

| `maintenance` | Poor maintenance, safety hazards |

| `documentation` | Missing required documents |

| `other` | Other violations |

---

## Status Flows

### Building Occupancy Status

```
VACANT → PARTIALLY_OCCUPIED → FULLY_OCCUPIED
    ↓              ↓                  ↓
CONDEMNED      UNDER_CONSTRUCTION   MAINTENANCE
```

### Unit Status

```
VACANT → OCCUPIED → UNDER_RENOVATION → MAINTENANCE
    ↓         ↓
RESERVED   VACANT
```

### Complaint Status

```
OPEN → ASSIGNED → INVESTIGATED → RESOLVED → CLOSED
```

### Violation Status

```
OPEN → UNDER_REVIEW → RESOLVED / APPEALED → CLOSED
```

---

## All ENUM Values

```sql
-- role (users)
'staff', 'inspector', 'admin'

-- building_type
'residential', 'commercial', 'industrial', 'mixed_use', 'institutional'

-- structure_source
'sbr', 'housing', 'building_permit', 'manual'

-- occupancy_status (buildings)
'vacant', 'partially_occupied', 'fully_occupied', 'under_construction', 'condemned'

-- unit_type
'residential', 'commercial', 'office', 'warehouse', 'parking', 'storage'

-- unit_status
'vacant', 'occupied', 'reserved', 'under_renovation', 'maintenance'

-- record_type
'move_in', 'move_out', 'transfer', 'renewal', 'update'

-- occupancy_type
'owner_occupied', 'rented', 'leased', 'commercial_tenant'

-- compliance_status
'compliant', 'non_compliant', 'pending_review', 'conditional'

-- relationship_to_owner
'owner', 'tenant', 'family_member', 'authorized_occupant'

-- inspection_type
'annual', 'periodic', 'pre_occupancy', 'complaint_based', 'follow_up', 'random'

-- inspection_result
'compliant', 'non_compliant', 'conditional', 'pending_correction'

-- complaint_type
'noise', 'sanitation', 'unauthorized_use', 'overcrowding', 'fire_hazard', 'structural', 'parking', 'other'

-- complaint_priority
'low', 'medium', 'high', 'urgent'

-- complaint_status
'open', 'assigned', 'investigated', 'resolved', 'closed'

-- violation_type
'unauthorized_use', 'overcrowding', 'structural_modification', 'fire_safety', 'sanitation', 'noise', 'parking', 'maintenance', 'documentation', 'other'

-- violation_severity
'minor', 'major', 'critical'

-- violation_status
'open', 'under_review', 'resolved', 'appealed', 'closed'
```

---

## External Integrations

| System | Direction | Data |

|--------|-----------|------|

| **Subdivision & Building Review** | FETCH | Approved buildings, subdivision certificates |

| **Housing Beneficiary Registry** | FETCH | Allocated housing units |

| **Building Permits (P&L)** | FETCH | Building permit data |

| **Housing Registry** | POST | Vacancy data, compliance status |

| **Building Permits** | POST | Compliance status, violations |

| **Treasury** | POST | Occupancy data for tax collection |

| **Notifications** | POST | Inspection schedules, violations, compliance alerts |

---

## Reports Generated

| Report | Purpose |

|--------|---------|

| **Occupancy Summary** | Overall occupancy rates by building type |

| **Compliance Report** | Compliance status by building/unit |

| **Violation Report** | Open violations, resolved violations |

| **Inspection Schedule** | Upcoming inspections |

| **Complaint Report** | Complaints by type, resolution rate |

| **Overcrowding Report** | Units exceeding capacity |

| **Tax Collection Data** | Occupancy data for property tax |

| **Annual Compliance** | Yearly compliance summary |

---

## Cross-System References

| Field | References | Type | Validation |

|-------|-----------|------|------------|

| `sbr_reference_no` | Subdivision & Building Review (SUBDIVISION_APPLICATIONS) | VARCHAR(30) | API verification on building registration |

| `building_permit_no` | Permit & Licensing (Building Permits) | VARCHAR(30) | API verification on building registration |

| `housing_project_code` | Housing Beneficiary Registry (HOUSING_PROJECTS) | VARCHAR(30) | API verification on building registration |

**Note:** These fields are reference strings (not foreign keys) because they link to different systems. They allow traceability back to the source system where the building/unit was originally approved or allocated.

---

## Data Synchronization

| Event | Trigger | Action |

|-------|---------|--------|

| **S&B Review Approval** | Subdivision Certificate issued | FETCH building data, register in BUILDINGS table |

| **Housing Allocation** | Unit allocated to beneficiary | FETCH allocation data, register unit in BUILDING_UNITS table |

| **Building Permit Issued** | Building permit approved by P&L | FETCH building permit data, register in BUILDINGS table |

| **Occupancy Status Change** | Unit becomes occupied/vacant | POST vacancy data to Housing Registry |

| **Compliance Status Change** | Violation issued/resolved | POST compliance status to Building Permits (P&L) |

| **Tax Collection** | Monthly/quarterly | POST occupancy data to Treasury for property tax calculation |

**Synchronization Type:** Event-driven (real-time on approval/allocation) and scheduled (monthly for tax data)

---

## Recommended Indexes

For optimal query performance, create indexes on:

```sql
-- Building lookups
CREATE INDEX idx_building_code ON BUILDINGS(building_code);
CREATE INDEX idx_sbr_reference ON BUILDINGS(sbr_reference_no);
CREATE INDEX idx_building_permit ON BUILDINGS(building_permit_no);
CREATE INDEX idx_housing_project ON BUILDINGS(housing_project_code);
CREATE INDEX idx_building_status ON BUILDINGS(occupancy_status);
CREATE INDEX idx_next_inspection ON BUILDINGS(next_inspection_date);

-- Unit tracking
CREATE INDEX idx_unit_building ON BUILDING_UNITS(building_id);
CREATE INDEX idx_unit_no ON BUILDING_UNITS(unit_no);
CREATE INDEX idx_unit_status ON BUILDING_UNITS(status);
CREATE INDEX idx_unit_capacity ON BUILDING_UNITS(max_occupants, current_occupant_count);

-- Occupancy tracking
CREATE INDEX idx_occupancy_building ON OCCUPANCY_RECORDS(building_id);
CREATE INDEX idx_occupancy_unit ON OCCUPANCY_RECORDS(unit_id);
CREATE INDEX idx_occupancy_status ON OCCUPANCY_RECORDS(compliance_status);
CREATE INDEX idx_occupancy_dates ON OCCUPANCY_RECORDS(start_date, end_date);

-- Inspection scheduling
CREATE INDEX idx_inspection_building ON INSPECTIONS(building_id);
CREATE INDEX idx_inspection_unit ON INSPECTIONS(unit_id);
CREATE INDEX idx_inspection_date ON INSPECTIONS(scheduled_date);
CREATE INDEX idx_inspection_result ON INSPECTIONS(result);
CREATE INDEX idx_inspection_type ON INSPECTIONS(inspection_type);

-- Violation tracking
CREATE INDEX idx_violation_building ON VIOLATIONS(building_id);
CREATE INDEX idx_violation_unit ON VIOLATIONS(unit_id);
CREATE INDEX idx_violation_status ON VIOLATIONS(status);
CREATE INDEX idx_violation_deadline ON VIOLATIONS(compliance_deadline);

-- Complaint tracking
CREATE INDEX idx_complaint_building ON COMPLAINTS(building_id);
CREATE INDEX idx_complaint_unit ON COMPLAINTS(unit_id);
CREATE INDEX idx_complaint_status ON COMPLAINTS(status);
CREATE INDEX idx_complaint_priority ON COMPLAINTS(priority);
```

---

## 12 Tables Summary

| # | Table | Purpose |

|---|-------|---------|

| 1 | USERS | Staff, inspectors, admin |

| 2 | BUILDINGS | All structures being monitored |

| 3 | BUILDING_UNITS | Individual units (with capacity tracking) |

| 4 | OCCUPANCY_RECORDS | Detailed occupancy tracking |

| 5 | OCCUPANTS | People occupying units |

| 6 | OCCUPANCY_HISTORY | Occupancy change audit trail |

| 7 | INSPECTIONS | All inspection records |

| 8 | **INSPECTION_PHOTOS** | Photo evidence (NEW) |

| 9 | **COMPLAINTS** | Complaint tracking (NEW) |

| 10 | VIOLATIONS | Compliance violations |

| 11 | COMPLIANCE_REPORTS | Periodic compliance summaries |

| 12 | NOTIFICATIONS | User alerts |

---

## Implementation

**File to create:** `schema_occupancy.sql`

- All 12 tables
- Foreign key constraints
- Indexes on frequently queried columns
- ENUM definitions