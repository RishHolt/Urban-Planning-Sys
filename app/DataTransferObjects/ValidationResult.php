<?php

namespace App\DataTransferObjects;

class ValidationResult
{
    public function __construct(
        public readonly bool $isValid,
        public readonly string $readinessStatus, // 'ready', 'incomplete', 'missing_documents', 'has_duplicates'
        public readonly array $missingFields = [],
        public readonly array $missingDocuments = [],
        public readonly array $duplicateWarnings = [],
        public readonly array $validationErrors = [],
        public readonly ?string $summary = null
    ) {}

    public function toArray(): array
    {
        return [
            'is_valid' => $this->isValid,
            'readiness_status' => $this->readinessStatus,
            'missing_fields' => $this->missingFields,
            'missing_documents' => $this->missingDocuments,
            'duplicate_warnings' => $this->duplicateWarnings,
            'validation_errors' => $this->validationErrors,
            'summary' => $this->summary,
        ];
    }
}
