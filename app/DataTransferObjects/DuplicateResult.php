<?php

namespace App\DataTransferObjects;

class DuplicateResult
{
    public function __construct(
        public readonly bool $hasDuplicates,
        public readonly array $potentialDuplicates = [],
        public readonly int $totalMatches = 0
    ) {}

    public function toArray(): array
    {
        return [
            'has_duplicates' => $this->hasDuplicates,
            'potential_duplicates' => $this->potentialDuplicates,
            'total_matches' => $this->totalMatches,
        ];
    }
}
