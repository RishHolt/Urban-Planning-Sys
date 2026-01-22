# Entity Relationship Diagram (ERD)

## Database Schema Overview

This application uses two separate databases:
- **user_db**: User management and authentication
- **zcs_db**: Zoning Clearance System data

## ERD Diagram

```mermaid
erDiagram
    %% User Database (user_db)
    users ||--o| profiles : "has one"
    users }o--o| departments : "belongs to (via code)"
    users ||--o{ audit_logs : "creates"
    
    users {
        bigint id PK
        string account_no UK
        string username UK
        string email UK
        timestamp email_verified_at
        boolean email_verified
        string password
        enum role
        enum department
        string position
        timestamp created_at
        timestamp updated_at
    }
    
    profiles {
        bigint id PK
        bigint user_id FK
        string email UK
        string first_name
        string last_name
        string middle_name
        string suffix
        date birthday
        string mobile_number
        string address
        string street
        string barangay
        string city
        timestamp created_at
        timestamp updated_at
    }
    
    departments {
        bigint id PK
        string code UK
        string name
        timestamp created_at
        timestamp updated_at
    }
    
    audit_logs {
        bigint id PK
        bigint user_id FK
        string action
        string resource_type
        string resource_id
        json changes
        string ip_address
        text user_agent
        timestamp created_at
        timestamp updated_at
    }
    
    %% ZCS Database (zcs_db)
    zoning_applications ||--o{ zoning_application_documents : "has many"
    zoning_applications ||--o{ zoning_application_status_history : "has many"
    zoning_application_documents ||--o| zoning_application_documents : "parent (self-ref)"
    clup_master ||--o{ zoning_classification : "has many"
    zoning_classification ||--o{ zoning_gis_polygon : "has many"
    
    zoning_applications {
        bigint id PK
        bigint user_id "FK (cross-db, no constraint)"
        string application_number UK
        string service_id
        enum status
        timestamp submitted_at
        enum applicant_type
        string applicant_name
        string applicant_email
        string applicant_contact
        string valid_id_path
        string company_name
        string sec_dti_reg_no
        string authorized_representative
        boolean is_property_owner
        string owner_name
        text owner_address
        string owner_contact
        string province
        string municipality
        string barangay
        string lot_no
        string block_no
        string street_name
        decimal latitude
        decimal longitude
        string land_type
        boolean has_existing_structure
        integer number_of_buildings
        decimal lot_area
        enum application_type
        enum proposed_use
        text project_description
        string previous_use
        text justification
        boolean declaration_truthfulness
        boolean agreement_compliance
        boolean data_privacy_consent
        date application_date
        text notes
        text rejection_reason
        bigint reviewed_by "FK (cross-db, no constraint)"
        timestamp reviewed_at
        bigint approved_by "FK (cross-db, no constraint)"
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
    }
    
    zoning_application_documents {
        bigint id PK
        bigint zoning_application_id FK
        string document_type
        enum type
        string manual_id
        string file_path
        string file_name
        bigint file_size
        string mime_type
        enum status
        bigint reviewed_by
        timestamp reviewed_at
        text notes
        integer version
        bigint parent_document_id FK
        boolean is_current
        bigint replaced_by
        timestamp replaced_at
        timestamp created_at
        timestamp updated_at
    }
    
    zoning_application_status_history {
        bigint id PK
        bigint zoning_application_id FK
        enum status_from
        enum status_to
        bigint changed_by "FK (cross-db, no constraint)"
        text notes
        timestamp created_at
    }
    
    clup_master {
        bigint clup_id PK
        string reference_no UK
        string lgu_name
        integer coverage_start_year
        integer coverage_end_year
        date approval_date
        string approving_body
        string resolution_no
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    zoning_classification {
        bigint zoning_id PK
        bigint clup_id FK
        string zoning_code
        string zone_name
        string land_use_category
        text allowed_uses
        text conditional_uses
        text prohibited_uses
        timestamp created_at
        timestamp updated_at
    }
    
    zoning_gis_polygon {
        bigint polygon_id PK
        bigint zoning_id FK
        string barangay
        decimal area_sqm
        json geometry
        timestamp created_at
        timestamp updated_at
    }
```

## Relationship Details

### User Database Relationships

1. **users → profiles** (1:1)
   - One user has one profile
   - Foreign key: `profiles.user_id` → `users.id`
   - Cascade delete

2. **users → departments** (Many:1)
   - Many users belong to one department
   - Relationship via `users.department` → `departments.code` (no FK constraint)

3. **users → audit_logs** (1:Many)
   - One user can create many audit logs
   - Foreign key: `audit_logs.user_id` → `users.id` (no FK constraint, cross-database)

### ZCS Database Relationships

1. **zoning_applications → zoning_application_documents** (1:Many)
   - One application has many documents
   - Foreign key: `zoning_application_documents.zoning_application_id` → `zoning_applications.id`
   - Cascade delete

2. **zoning_applications → zoning_application_status_history** (1:Many)
   - One application has many status history entries
   - Foreign key: `zoning_application_status_history.zoning_application_id` → `zoning_applications.id`
   - Cascade delete

3. **zoning_application_documents → zoning_application_documents** (Self-referential, 1:Many)
   - Documents can have parent documents (version control)
   - Foreign key: `zoning_application_documents.parent_document_id` → `zoning_application_documents.id`
   - Set null on delete

4. **clup_master → zoning_classification** (1:Many)
   - One CLUP has many zoning classifications
   - Foreign key: `zoning_classification.clup_id` → `clup_master.clup_id`
   - Cascade delete

5. **zoning_classification → zoning_gis_polygon** (1:Many)
   - One zoning classification has many GIS polygons
   - Foreign key: `zoning_gis_polygon.zoning_id` → `zoning_classification.zoning_id`
   - Cascade delete

### Cross-Database Relationships (No FK Constraints)

- **users → zoning_applications**: `zoning_applications.user_id` references `users.id` (cross-database)
- **users → zoning_application_status_history**: `zoning_application_status_history.changed_by` references `users.id` (cross-database)
- **users → zoning_applications**: `zoning_applications.reviewed_by` and `approved_by` reference `users.id` (cross-database)

## Key Constraints

### Unique Constraints
- `users.account_no` (unique)
- `users.username` (unique)
- `users.email` (unique)
- `profiles.email` (unique)
- `departments.code` (unique)
- `zoning_applications.application_number` (unique)
- `clup_master.reference_no` (unique)
- `zoning_classification(clup_id, zoning_code)` (composite unique)

### Indexes
- `zoning_applications`: user_id, status, created_at
- `zoning_application_documents`: zoning_application_id, document_type, status, (zoning_application_id, document_type, is_current), parent_document_id
- `zoning_application_status_history`: zoning_application_id
- `audit_logs`: user_id, resource_type, resource_id, created_at
- `zoning_classification`: clup_id
- `zoning_gis_polygon`: zoning_id

## Enums

### users.role
- `user`
- `staff`
- `admin`
- `superadmin`

### users.department
- `ZCS` - Zoning Clearance System
- `SBR` - Subdivision & Building Review
- `HBR` - Housing Beneficiary Registry
- `OMT` - Occupancy Monitoring Tool
- `IPC` - Infrastructure Project Coordination

### zoning_applications.status
- `pending`
- `in_review`
- `approved`
- `rejected`

### zoning_applications.applicant_type
- `individual`
- `company`
- `developer`
- `Government`

### zoning_applications.application_type
- `new_construction`
- `renovation`
- `change_of_use`
- `others`

### zoning_applications.proposed_use
- `residential`
- `commercial`
- `mixed_use`
- `institutional`

### zoning_application_documents.status
- `pending`
- `approved`
- `rejected`

### zoning_application_documents.type
- `upload`
- `manual`

### clup_master.status
- `Active`
- `Archived`
