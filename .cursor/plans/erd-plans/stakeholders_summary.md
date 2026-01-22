# EIS Modules - Stakeholders Summary

## Overview

This document identifies all stakeholders for each module in the Enterprise Information System (EIS).

---

## 1. User Credentials Module

### Primary Users
- **All System Users** - Base authentication for all EIS modules
  - Citizens
  - Government Staff
  - Administrators
  - System-specific roles (inspectors, developers, committee members)

### Stakeholders
- **System Administrators** - Manage user accounts, roles, access control
- **All EIS Module Users** - Everyone who needs to login to any system

---

## 2. Zoning Clearance System

### Primary Users
- **Citizens** (`citizen` role)
  - Property owners
  - Authorized representatives
  - Contractors (on behalf of owners)
  - **Developers** (for subdivision development applications)

- **Government Staff** (`staff` role)
  - Planning office staff
  - Review officers
  - Payment recorders

- **Inspectors** (`inspector` role)
  - Field inspectors
  - Site visit officers

- **Administrators** (`admin` role)
  - System administrators
  - Clearance issuers
  - Zone managers

### Beneficiaries
- **Property Owners** - Get zoning clearance for their projects
- **Developers** - Obtain clearance for subdivision developments
- **General Public** - Ensures proper land use and zoning compliance

### External Stakeholders
- **Treasury System** - Payment verification (Tax Declaration)
- **Permit & Licensing** - Barangay Permit verification
- **Subdivision & Building Review** - Uses clearance as prerequisite
- **Housing Beneficiary Registry** - Uses clearance for housing projects

---

## 3. Subdivision & Building Review System

### Primary Users
- **Developers** (`developer` role)
  - Real estate developers
  - Development companies
  - Authorized representatives

- **Government Staff** (`staff` role)
  - Planning engineers
  - Review officers
  - Stage reviewers

- **Administrators** (`admin` role)
  - System administrators
  - Certificate issuers
  - System managers

### Beneficiaries
- **Developers** - Get subdivision certificates for their projects
- **Building Permit Applicants** (via P&L) - Get building plan approvals
- **Future Homeowners** - Benefit from properly reviewed subdivisions
- **General Public** - Ensures safe and compliant development

### External Stakeholders
- **Zoning Clearance System** - Verifies prerequisite clearance
- **Permit & Licensing** - Receives building permits for review, sends approvals back
- **Infrastructure Project Coordination** - Receives improvement plans from approved subdivisions

---

## 4. Housing Beneficiary Registry

### Primary Users
- **Beneficiaries** (via Citizen Registry)
  - Housing applicants
  - Low-income families
  - Priority groups:
    - PWD (Persons with Disabilities)
    - Senior Citizens
    - Solo Parents
    - Disaster Victims
    - Indigenous People

- **Government Staff** (`staff` role)
  - Housing office staff
  - Eligibility reviewers
  - Site visit officers
  - Allocation processors

- **Committee Members** (`committee_member` role)
  - Housing Committee members
  - Board members
  - Allocation approvers

- **Administrators** (`admin` role)
  - System administrators
  - Project managers
  - System managers

### Beneficiaries
- **Qualified Housing Applicants** - Receive housing units
- **Priority Groups** - Get priority in housing allocation
- **Low-Income Families** - Access to socialized housing
- **Disaster Victims** - Emergency housing assistance

### External Stakeholders
- **Citizen Registry** - User authentication, citizen data
- **Zoning Clearance System** - Verifies zoning clearance for housing projects
- **AICS** (Assistance to Individuals in Crisis Situations) - Crisis housing referrals
- **PWD & Senior Services** - Priority status verification
- **Treasury** - Payment tracking for housing amortization
- **Occupancy Monitoring** - Receives allocation data, sends vacancy updates
- **DSWD** (Department of Social Welfare and Development) - Certification for priority groups

---

## 5. Occupancy Monitoring Tool

### Primary Users
- **Government Staff** (`staff` role)
  - Occupancy monitoring officers
  - Building registrars
  - Unit recorders

- **Inspectors** (`inspector` role)
  - Field inspectors
  - Compliance officers
  - Violation issuers

- **Administrators** (`admin` role)
  - System administrators
  - Compliance managers
  - System managers

### Beneficiaries
- **Property Owners** - Compliance tracking and documentation
- **Occupants** - Proper occupancy records
- **General Public** - Safety and compliance enforcement
- **Local Government** - Tax collection data, compliance monitoring

### External Stakeholders
- **Subdivision & Building Review** - Receives approved building data
- **Housing Beneficiary Registry** - Receives allocated unit data, sends vacancy updates
- **Permit & Licensing** - Receives building permit data, sends compliance status
- **Treasury** - Sends occupancy data for property tax collection
- **Building Owners/Occupants** - Subject to inspections and compliance

---

## 6. Infrastructure Project Coordination

### Primary Users
- **Project Managers** (`project_manager` role)
  - Infrastructure project managers
  - Project coordinators

- **Engineers** (`engineer` role)
  - Civil engineers
  - Design engineers
  - Planning engineers

- **Government Staff** (`staff` role)
  - Project coordinators
  - Budget officers
  - Progress trackers

- **Inspectors** (`inspector` role)
  - Construction inspectors
  - Quality control officers

- **Administrators** (`admin` role)
  - System administrators
  - Project approvers
  - System managers

### Beneficiaries
- **Local Government** - Infrastructure development tracking
- **Residents** - Benefit from completed infrastructure (roads, utilities)
- **Developers** - Infrastructure for their subdivisions
- **General Public** - Improved public infrastructure

### External Stakeholders
- **Subdivision & Building Review** - Receives improvement plans from approved subdivisions
- **Occupancy Monitoring** - Notifies when utilities are ready for occupancy
- **Treasury** - Budget allocation and payment tracking
- **Contractors** - External contractors and suppliers working on projects
- **LGU Officials** - Project approval and oversight

---

## Stakeholder Categories Summary

### By Role Type

| Role | Modules Used In | Description |
|------|----------------|-------------|
| **citizen** | Zoning Clearance | Regular citizens/applicants |
| **staff** | All modules | Government staff/employees |
| **admin** | All modules | System administrators |
| **inspector** | Zoning Clearance, Occupancy Monitoring, Infrastructure | Field inspectors |
| **developer** | Subdivision & Building Review | Real estate developers |
| **committee_member** | Housing Beneficiary Registry | Housing committee members |
| **project_manager** | Infrastructure Project Coordination | Project managers |
| **engineer** | Infrastructure Project Coordination | Engineers |

### By Stakeholder Type

| Stakeholder Type | Examples |
|-----------------|----------|
| **Primary Users** | Citizens, Staff, Developers, Inspectors, Committee Members |
| **Beneficiaries** | Property owners, Housing applicants, Residents, General public |
| **External Systems** | Treasury, Permit & Licensing, AICS, PWD Services, Citizen Registry |
| **External Entities** | Contractors, LGU Officials, DSWD, NHA, SHFC |

---

## Stakeholder Interaction Matrix

| Module | Receives Data From | Sends Data To |
|--------|-------------------|---------------|
| **Zoning Clearance** | Treasury (Tax Dec), P&L (Barangay Permit) | S&B Review, Housing Registry |
| **S&B Review** | Zoning Clearance, P&L (Building Permits) | Infrastructure Coordination, P&L (Approvals) |
| **Housing Registry** | Zoning Clearance, Treasury (Payments), AICS, PWD Services | Occupancy Monitoring |
| **Occupancy Monitoring** | S&B Review, Housing Registry, P&L | Housing Registry, P&L, Treasury |
| **Infrastructure Coordination** | S&B Review (Improvement Plans) | Occupancy Monitoring |

---

## Priority Groups (Housing Registry)

Special stakeholders with priority access:

1. **PWD** (Persons with Disabilities)
2. **Senior Citizens** (60+ years old)
3. **Solo Parents**
4. **Disaster Victims**
5. **Indigenous People**

These groups receive priority scoring in the waitlist system.

---

## External System Stakeholders

| External System | Purpose | Integration Type |
|----------------|---------|------------------|
| **Treasury** | Payment verification, tax collection | FETCH/POST |
| **Permit & Licensing** | Building permits, barangay permits | FETCH/POST |
| **Citizen Registry** | User authentication | FETCH |
| **AICS** | Crisis housing referrals | FETCH |
| **PWD & Senior Services** | Priority status verification | FETCH |
| **DSWD** | Social welfare certifications | FETCH |
| **NHA** (National Housing Authority) | Housing project source | Data source |
| **SHFC** (Social Housing Finance Corporation) | Housing project source | Data source |

---

## Summary

Each module serves different stakeholder groups:

- **Zoning Clearance**: Citizens, developers, inspectors
- **S&B Review**: Developers, planning staff
- **Housing Registry**: Low-income families, priority groups, committee
- **Occupancy Monitoring**: Property owners, occupants, compliance officers
- **Infrastructure Coordination**: Project managers, engineers, contractors

All modules share common stakeholders:
- **Government Staff** - Operational users
- **Administrators** - System managers
- **External Systems** - Integration partners
