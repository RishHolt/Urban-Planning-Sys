<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Housing Program Eligibility Criteria
    |--------------------------------------------------------------------------
    |
    | This configuration defines the eligibility criteria for each housing
    | program. These thresholds are used by the EligibilityService to
    | determine if an applicant meets the requirements for a specific program.
    |
    */

    'eligibility_criteria' => [
        'socialized_housing' => [
            'max_income' => 30000, // Maximum monthly income in PHP
            'min_residency_years' => 5, // Minimum years of residency in the area
            'min_family_size' => 1, // Minimum family size
            'max_family_size' => null, // Maximum family size (null = no limit)
            'requires_existing_property' => false, // Must not have existing property
            'priority_status_multiplier' => [
                'pwd' => 1.5,
                'senior_citizen' => 1.3,
                'solo_parent' => 1.2,
                'disaster_victim' => 1.4,
                'indigenous' => 1.1,
            ],
        ],

        'relocation' => [
            'max_income' => 25000,
            'min_residency_years' => 3,
            'min_family_size' => 1,
            'max_family_size' => null,
            'requires_existing_property' => false,
            'priority_status_multiplier' => [
                'pwd' => 1.5,
                'senior_citizen' => 1.3,
                'solo_parent' => 1.2,
                'disaster_victim' => 1.6, // Higher priority for disaster victims in relocation
                'indigenous' => 1.1,
            ],
        ],

        'rental_subsidy' => [
            'max_income' => 20000,
            'min_residency_years' => 2,
            'min_family_size' => 1,
            'max_family_size' => null,
            'requires_existing_property' => false,
            'priority_status_multiplier' => [
                'pwd' => 1.5,
                'senior_citizen' => 1.4,
                'solo_parent' => 1.3,
                'disaster_victim' => 1.5,
                'indigenous' => 1.1,
            ],
        ],

        'housing_loan' => [
            'max_income' => 50000,
            'min_residency_years' => 3,
            'min_family_size' => 1,
            'max_family_size' => null,
            'requires_existing_property' => false,
            'priority_status_multiplier' => [
                'pwd' => 1.3,
                'senior_citizen' => 1.2,
                'solo_parent' => 1.2,
                'disaster_victim' => 1.3,
                'indigenous' => 1.1,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Required Documents by Program
    |--------------------------------------------------------------------------
    |
    | Define which documents are required for each housing program.
    |
    */

    'required_documents' => [
        'socialized_housing' => [
            'valid_id',
            'birth_certificate',
            'income_proof',
            'barangay_certificate',
            'tax_declaration',
        ],
        'relocation' => [
            'valid_id',
            'birth_certificate',
            'income_proof',
            'barangay_certificate',
            'dswd_certification',
        ],
        'rental_subsidy' => [
            'valid_id',
            'income_proof',
            'barangay_certificate',
        ],
        'housing_loan' => [
            'valid_id',
            'birth_certificate',
            'income_proof',
            'barangay_certificate',
            'tax_declaration',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Duplicate Check Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for duplicate checking algorithm.
    |
    */

    'duplicate_check' => [
        'name_similarity_threshold' => 0.85, // Levenshtein similarity threshold (0-1)
        'fuzzy_match_enabled' => true,
        'check_fields' => [
            'name',
            'id_number',
            'contact_number',
            'email',
            'address',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Application Validation Rules
    |--------------------------------------------------------------------------
    |
    | Rules for application validation.
    |
    */

    'validation' => [
        'mandatory_fields' => [
            'first_name',
            'last_name',
            'birth_date',
            'gender',
            'civil_status',
            'email',
            'contact_number',
            'current_address',
            'barangay',
            'years_of_residency',
            'employment_status',
            'monthly_income',
            'priority_status',
        ],
        'document_max_size_mb' => 10,
        'allowed_document_types' => ['jpeg', 'jpg', 'png', 'pdf'],
    ],

];
