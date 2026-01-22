# ERD Plans Summary

## Overview

This document summarizes 8 ERD plans for an Enterprise Information System (EIS) that manages urban planning, housing, and infrastructure for a local government unit. The system consists of 6 main modules plus supporting systems for user management and role definitions.

---

## System Modules Overview

### 1. **User Credentials Module** (Base System)
- **Purpose**: Foundation authentication system for all modules
- **Tables**: 1 table (USERS)
- **Key Features**:
  - Standardized user table across all systems
  - Email-based authentication
  - Role-based access control
  - Soft delete support

### 2. **Zoning Clearance System**
- **Purpose**: Manage zoning clearance applications for individual lots and subdivision developments
- **Tables**: 10 tables
- **Key Features**:
  - Two application categories: individual lot and subdivision development
  - GIS integration with pin location (replaces parcel selection)
  - External API integrations (Treasury, Permit & Licensing)
  - Multi-stage workflow: Application → Payment → Review → Inspection → Approval
  - Document management
  - Payment tracking
  - Site inspections
  - Clearance issuance

### 3. **Subdivision & Building Review System**
- **Purpose**: Review and approve subdivision developments and building plans
- **Tables**: 9 tables
- **Key Features**:
  - **Subdivision Review**: 4-stage process (Concept → Preliminary → Improvement → Final Plat)
  - **Building Review**: 3-check system (Safety & Sanitation, Structural, Deed Restrictions)
  - Receives building permits from Permit & Licensing via FETCH
  - Posts approval results back to P&L
  - Issues Subdivision Certificates
  - Stage-based document management

### 4. **Housing Beneficiary Registry**
- **Purpose**: Manage government housing programs for qualified beneficiaries
- **Tables**: 17 tables
- **Key Features**:
  - Beneficiary registration and eligibility verification
  - Site visits for home verification
  - Priority groups: PWD, Senior Citizens, Solo Parents, Disaster Victims, Indigenous People
  - Waitlist management with priority scoring
  - Unit allocation with committee approval
  - Payment tracking (via Treasury)
  - Complaints/issues tracking post-allocation
  - Blacklist management for fraud prevention
  - Multiple housing programs: Socialized Housing, Relocation, Rental Subsidy, Housing Loan

### 5. **Occupancy Monitoring Tool**
- **Purpose**: Monitor occupancy status of all structures for compliance and tax collection
- **Tables**: 12 tables
- **Key Features**:
  - Building and unit registration from multiple sources
  - Occupancy tracking with capacity management
  - Automatic overcrowding detection
  - Regular and on-demand inspections
  - Inspection photo documentation
  - Complaint handling
  - Violation tracking and compliance management
  - Integration with tax collection (Treasury)

### 6. **Infrastructure Project Coordination**
- **Purpose**: Track and coordinate infrastructure projects from planning to completion
- **Tables**: 12 tables
- **Key Features**:
  - Project phase management (Planning → Procurement → Construction → Inspection → Turnover)
  - Milestone tracking
  - Progress photo documentation
  - Contractor and supplier management
  - Budget tracking by category
  - Construction inspections
  - Receives improvement plans from Subdivision & Building Review
  - Notifies Occupancy Monitoring when utilities are ready

### 7. **Unified Role System**
- **Purpose**: Standardized role definitions across all systems
- **Key Features**:
  - Core roles: `citizen`, `staff`, `admin`
  - System-specific roles: `inspector`, `developer`, `committee_member`
  - Consistent role-based access control
  - Role hierarchy definition

### 8. **Stakeholders Summary**
- **Purpose**: Documentation of all stakeholders for each module
- **Key Features**:
  - Primary users by module
  - Beneficiaries
  - External system integrations
  - Stakeholder interaction matrix

---

## Database Structure Summary

### Total Tables Across All Systems

| System | Tables | Key Tables |
|--------|--------|------------|
| User Credentials | 1 | USERS |
| Zoning Clearance | 10 | CLEARANCE_APPLICATIONS, ISSUED_CLEARANCES, INSPECTIONS |
| Subdivision & Building Review | 9 | SUBDIVISION_APPLICATIONS, BUILDING_REVIEWS, ISSUED_CERTIFICATES |
| Housing Beneficiary Registry | 17 | BENEFICIARIES, HOUSING_PROJECTS, ALLOCATIONS, WAITLIST, BLACKLIST |
| Occupancy Monitoring | 12 | BUILDINGS, BUILDING_UNITS, OCCUPANCY_RECORDS, INSPECTIONS, VIOLATIONS |
| Infrastructure Coordination | 12 | INFRASTRUCTURE_PROJECTS, PROJECT_PHASES, CONTRACTORS, BUDGET_TRACKING |
| **TOTAL** | **61** | |

### Common Patterns Across Systems

1. **Standardized Components**:
   - `USERS` table structure (consistent across all)
   - `APPLICATION_HISTORY` pattern (audit trail)
   - `NOTIFICATIONS` table (user alerts)
   - `DOCUMENTS` tables (file management)

2. **Status Management**:
   - ENUM-based status fields
   - Status history tracking
   - Workflow state management

3. **External References**:
   - Cross-system references stored as VARCHAR (not foreign keys)
   - API verification for external system data
   - Reference numbers for traceability

4. **Document Management**:
   - File path storage
   - Document type classification
   - Upload timestamp tracking

5. **Photo Documentation**:
   - Inspection photos (Occupancy Monitoring)
   - Project photos (Infrastructure Coordination)
   - Photo metadata (description, category, taken_at)

---

## System Integration Points

### Data Flow Between Systems

```
Zoning Clearance
    ↓ (clearance_no)
Subdivision & Building Review
    ↓ (subdivision certificate)
Infrastructure Project Coordination
    ↓ (utilities ready)
Occupancy Monitoring

Housing Beneficiary Registry
    ↓ (allocation data)
Occupancy Monitoring
    ↓ (vacancy updates)
Housing Beneficiary Registry
```

### External System Integrations

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| **Treasury** | FETCH/POST | Payment verification, tax collection data |
| **Permit & Licensing** | FETCH/POST | Building permits, barangay permits, review results |
| **Citizen Registry** | FETCH | User authentication, citizen data |
| **AICS** | FETCH | Crisis housing referrals |
| **PWD & Senior Services** | FETCH | Priority status verification |
| **DSWD** | FETCH | Social welfare certifications |

### Integration Patterns

1. **FETCH Pattern**: Systems retrieve data from external sources
   - Zoning Clearance → FETCH Tax Declaration from Treasury
   - Subdivision Review → FETCH Zoning Clearance
   - Building Review → FETCH Building Permits from P&L

2. **POST Pattern**: Systems send data to external systems
   - Building Review → POST approval results to P&L
   - Housing Registry → POST allocation data to Occupancy Monitoring
   - Infrastructure → POST utility readiness to Occupancy Monitoring

3. **Event-Driven**: Real-time synchronization on key events
   - Application submission triggers verification
   - Approval triggers notifications to other systems
   - Status changes trigger updates

---

## Key Workflows

### 1. Zoning Clearance Workflow
```
Prerequisites (Tax Dec + Barangay Permit) 
  → Application Submission 
  → Payment Recording 
  → Staff Review 
  → Inspection 
  → Admin Approval 
  → Clearance Issuance
```

### 2. Subdivision Review Workflow
```
Zoning Clearance Verification 
  → Concept Plan Review 
  → Preliminary Plat Review 
  → Improvement Plan Review 
  → Final Plat Review 
  → Subdivision Certificate Issuance
```

### 3. Housing Allocation Workflow
```
Beneficiary Registration 
  → Eligibility Verification 
  → Site Visit 
  → Waitlist (Priority Scoring) 
  → Committee Review 
  → Unit Allocation 
  → Move-In & Payment Tracking
```

### 4. Occupancy Monitoring Workflow
```
Building Registration 
  → Occupancy Recording 
  → Inspection Scheduling 
  → Inspection Conducted 
  → Violation Management 
  → Compliance Tracking
```

### 5. Infrastructure Project Workflow
```
Project Registration 
  → Planning Phase 
  → Procurement/Bidding 
  → Construction 
  → Inspections 
  → Turnover
```

---

## Special Features

### 1. Priority Groups (Housing)
- PWD (Persons with Disabilities)
- Senior Citizens (60+)
- Solo Parents
- Disaster Victims
- Indigenous People

### 2. Blacklist Management (Housing)
- Fraud prevention
- Auto-rejection of blacklisted applicants
- Track reasons: fraud, abandoned unit, non-payment, subletting, etc.

### 3. Overcrowding Detection (Occupancy)
- Automatic detection when occupant count exceeds capacity
- Violation flagging
- Inspection scheduling

### 4. Photo Documentation
- Inspection photos with metadata
- Project progress photos
- Before/after comparisons
- Deficiency documentation

### 5. Multi-Stage Reviews
- Subdivision: 4 stages with document requirements per stage
- Building: 3 types of checks (safety, structural, deed restrictions)

---

## Data Synchronization Summary

| Event | Trigger | Action |
|-------|---------|--------|
| Zoning Clearance Issued | Clearance approved | Available for FETCH by S&B Review and Housing Registry |
| Subdivision Certificate Issued | Final plat approved | POST improvement plan to Infrastructure Coordination |
| Building Permit Submitted | P&L submits for review | FETCH building permit from P&L |
| Building Review Complete | Review approved/denied | POST result back to P&L |
| Unit Allocated | Housing unit assigned | POST allocation data to Occupancy Monitoring |
| Unit Vacancy | Beneficiary moves out | POST vacancy to Occupancy Monitoring |
| Infrastructure Complete | Utilities ready | POST notification to Occupancy Monitoring |

---

## Implementation Status

All ERD plans are **pending implementation**. Each plan includes:
- Complete table definitions
- ENUM values
- Foreign key relationships
- Recommended indexes
- Cross-system references
- Data synchronization patterns

**Next Steps**:
1. Create schema SQL files for each system
2. Implement migrations
3. Set up API integrations
4. Implement workflows
5. Create frontend interfaces

---

## Key Design Decisions

1. **Pin Location vs Parcel Selection**: Zoning Clearance uses pin location (lat/lng) instead of parcel selection for flexibility
2. **Reference Strings vs Foreign Keys**: Cross-system references use VARCHAR strings for traceability across different databases
3. **Standardized USERS Table**: All systems share the same user table structure
4. **Event-Driven Integration**: Real-time synchronization on key events rather than batch processing
5. **Photo Documentation**: Built-in support for photo evidence in inspections and project tracking
6. **Complaint Management**: Integrated complaint handling in Housing and Occupancy systems
7. **Blacklist System**: Proactive fraud prevention in Housing system
8. **Capacity Tracking**: Automatic overcrowding detection in Occupancy system

---

## Summary Statistics

- **Total Systems**: 6 main modules + 2 supporting documents
- **Total Tables**: 61 tables across all systems
- **User Roles**: 6 roles (3 core + 3 system-specific)
- **External Integrations**: 6 external systems
- **Workflow Stages**: Multiple multi-stage workflows
- **Document Types**: Various document types per system
- **Status Types**: Comprehensive status management per system

This ERD plan set provides a comprehensive foundation for building an integrated urban planning and housing management system.
