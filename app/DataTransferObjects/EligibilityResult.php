<?php

namespace App\DataTransferObjects;

class EligibilityResult
{
    public function __construct(
        public readonly bool $isEligible,
        public readonly string $determination, // 'eligible', 'not_eligible', 'conditional'
        public readonly array $reasons = [],
        public readonly array $failedCriteria = [],
        public readonly array $passedCriteria = [],
        public readonly ?string $remarks = null
    ) {}

    public function toArray(): array
    {
        return [
            'is_eligible' => $this->isEligible,
            'determination' => $this->determination,
            'reasons' => $this->reasons,
            'failed_criteria' => $this->failedCriteria,
            'passed_criteria' => $this->passedCriteria,
            'remarks' => $this->remarks,
        ];
    }
}
