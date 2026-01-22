# Unified Role System - EIS

## Overview

This document defines the standardized role system used across all Enterprise Information System (EIS) modules. All systems share the same USERS table structure with role-based access control.

---

## USERS Table Structure (Standardized)

All systems use this consistent structure:

| Field | Type | Constraints | Description |

|-------|------|-------------|-------------|

| id | INT | PK, AUTO_INCREMENT | Unique identifier |

| email | VARCHAR(100) | UNIQUE, NOT NULL | Login email |

| password | VARCHAR(255) | NOT NULL | Hashed password |

| first_name | VARCHAR(50) | NOT NULL | First name |

| middle_name | VARCHAR(50) | NULL | Middle name |

| last_name | VARCHAR(50) | NOT NULL | Last name |

| role | ENUM | NOT NULL | User role (see below) |

| is_active | BOOLEAN | DEFAULT TRUE | Soft delete flag |

| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Registration date |

| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

---

## Unified Role Definitions

### Core Roles (Used Across All Systems)

| Role | Description | Used In |

|------|-------------|---------|

| `citizen` | Regular citizens/applicants | Zoning Clearance, User Credentials |

| `staff` | Government staff/employees | All systems |

| `admin` | System administrators | All systems |

### System-Specific Roles

| Role | Description | Used In |

|------|-------------|---------|

| `inspector` | Field inspectors | Zoning Clearance |

| `developer` | Real estate developers | Subdivision & Building Review |

| `committee_member` | Housing committee members | Housing Beneficiary Registry |

---

## Role Permissions by System

### Zoning Clearance System

| Role | Permissions |

|------|-------------|

| `citizen` | Submit applications, upload documents, track status, view map |

| `staff` | Review applications, record payments, update status, add remarks |

| `inspector` | View assigned inspections, record findings, pass/fail inspections |

| `admin` | All above + issue clearances, manage zones, manage users |

### Subdivision & Building Review System

| Role | Permissions |

|------|-------------|

| `developer` | Submit subdivision applications, upload plans, track status |

| `staff` | Review plans, update status, issue stage clearances |

| `admin` | All above + issue certificates, POST to P&L, manage system |

### Housing Beneficiary Registry

| Role | Permissions |

|------|-------------|

| `staff` | Process applications, conduct site visits, propose allocations |

| `committee_member` | Review and approve/reject allocations |

| `admin` | All above + manage projects, manage users, system configuration |

---

## Role Hierarchy

```
admin (highest)
  ├── committee_member (Housing only)
  ├── inspector (Zoning only)
  ├── developer (S&B Review only)
  ├── staff (all systems)
  └── citizen (lowest - applicants only)
```

---

## Implementation Notes

### Role Assignment

- Users can have **one role** per system
- If a user needs multiple roles, they need separate accounts OR use role groups (future enhancement)
- `admin` role has full access to all systems

### Role Validation

- System validates role on login
- Each API endpoint checks role permissions
- Frontend shows/hides features based on role

### Role Migration

If migrating existing users:

1. Map old roles to new unified roles
2. `citizen` → `citizen`
3. `staff` → `staff`
4. `admin` → `admin`
5. System-specific roles remain as-is

---

## ENUM Definition

```sql
-- Unified role ENUM (used across all systems)
ENUM(
  'citizen',           -- Core role
  'staff',             -- Core role
  'admin',             -- Core role
  'inspector',         -- Zoning Clearance only
  'developer',         -- S&B Review only
  'committee_member'   -- Housing Registry only
)
```

---

## Cross-System Role Mapping

| User Type | Zoning Clearance | S&B Review | Housing Registry |

|-----------|------------------|------------|------------------|

| Regular Citizen | `citizen` | N/A | N/A |

| Developer | `citizen` | `developer` | N/A |

| Government Staff | `staff` | `staff` | `staff` |

| Inspector | `inspector` | N/A | N/A |

| Committee Member | N/A | N/A | `committee_member` |

| System Admin | `admin` | `admin` | `admin` |

---

## Future Enhancements

1. **Role Groups**: Allow users to have multiple roles
2. **Permission Matrix**: Fine-grained permissions per action
3. **Role Inheritance**: Sub-roles inherit from parent roles
4. **Temporary Roles**: Time-limited role assignments

---

## Security Considerations

- Roles are stored in database (not in JWT tokens for security)
- Role changes require admin approval
- Audit log tracks all role changes
- Deactivated users (`is_active = FALSE`) cannot login regardless of role