<?php

namespace App\Services;

use App\DataTransferObjects\DuplicateResult;
use App\Models\Beneficiary;
use Illuminate\Support\Str;

class DuplicateCheckService
{
    /**
     * Check for duplicate beneficiaries.
     */
    public function checkDuplicates(Beneficiary $beneficiary): DuplicateResult
    {
        $potentialDuplicates = [];
        $config = config('housing.duplicate_check', []);

        // Exclude current beneficiary if it exists in database
        $query = Beneficiary::where('id', '!=', $beneficiary->id ?? 0);

        $matches = [];

        // Exact name match
        $nameMatches = $this->findNameMatches($beneficiary, $query);
        $matches = array_merge($matches, $nameMatches);

        // ID number match (if priority_id_no exists)
        if ($beneficiary->priority_id_no) {
            $idMatches = $this->findIdMatches($beneficiary, $query);
            $matches = array_merge($matches, $idMatches);
        }

        // Contact information match
        $contactMatches = $this->findContactMatches($beneficiary, $query);
        $matches = array_merge($matches, $contactMatches);

        // Address match
        $addressMatches = $this->findAddressMatches($beneficiary, $query);
        $matches = array_merge($matches, $addressMatches);

        // Remove duplicates and calculate confidence scores
        $uniqueMatches = $this->consolidateMatches($matches);

        // Sort by confidence score (highest first)
        usort($uniqueMatches, fn ($a, $b) => $b['confidence'] <=> $a['confidence']);

        return new DuplicateResult(
            hasDuplicates: ! empty($uniqueMatches),
            potentialDuplicates: $uniqueMatches,
            totalMatches: count($uniqueMatches)
        );
    }

    /**
     * Find matches by name (exact and fuzzy).
     */
    protected function findNameMatches(Beneficiary $beneficiary, $query): array
    {
        $matches = [];
        $fullName = $this->normalizeName($beneficiary->full_name);

        // Exact match
        $exactMatches = $query->where(function ($q) use ($beneficiary) {
            $q->where('first_name', $beneficiary->first_name)
                ->where('last_name', $beneficiary->last_name);
            if ($beneficiary->middle_name) {
                $q->where('middle_name', $beneficiary->middle_name);
            }
        })->get();

        foreach ($exactMatches as $match) {
            $matches[] = [
                'beneficiary_id' => $match->id,
                'beneficiary_no' => $match->beneficiary_no,
                'name' => $match->full_name,
                'match_type' => 'exact_name',
                'confidence' => 0.95,
                'details' => 'Exact name match',
            ];
        }

        // Fuzzy match if enabled
        if (config('housing.duplicate_check.fuzzy_match_enabled', true)) {
            $threshold = config('housing.duplicate_check.name_similarity_threshold', 0.85);
            $allBeneficiaries = $query->get();

            foreach ($allBeneficiaries as $match) {
                $matchName = $this->normalizeName($match->full_name);
                $similarity = $this->calculateNameSimilarity($fullName, $matchName);

                if ($similarity >= $threshold && $similarity < 1.0) { // Exclude exact matches
                    $matches[] = [
                        'beneficiary_id' => $match->id,
                        'beneficiary_no' => $match->beneficiary_no,
                        'name' => $match->full_name,
                        'match_type' => 'fuzzy_name',
                        'confidence' => $similarity * 0.8, // Lower confidence for fuzzy matches
                        'details' => 'Name similarity: '.round($similarity * 100, 1).'%',
                    ];
                }
            }
        }

        return $matches;
    }

    /**
     * Find matches by ID number.
     */
    protected function findIdMatches(Beneficiary $beneficiary, $query): array
    {
        $matches = [];
        $idMatches = $query->where('priority_id_no', $beneficiary->priority_id_no)->get();

        foreach ($idMatches as $match) {
            $matches[] = [
                'beneficiary_id' => $match->id,
                'beneficiary_no' => $match->beneficiary_no,
                'name' => $match->full_name,
                'match_type' => 'id_number',
                'confidence' => 0.98,
                'details' => "Same ID number: {$beneficiary->priority_id_no}",
            ];
        }

        return $matches;
    }

    /**
     * Find matches by contact information.
     */
    protected function findContactMatches(Beneficiary $beneficiary, $query): array
    {
        $matches = [];

        // Phone number match
        if ($beneficiary->contact_number) {
            $phoneMatches = $query->where('contact_number', $beneficiary->contact_number)->get();
            foreach ($phoneMatches as $match) {
                $matches[] = [
                    'beneficiary_id' => $match->id,
                    'beneficiary_no' => $match->beneficiary_no,
                    'name' => $match->full_name,
                    'match_type' => 'contact_number',
                    'confidence' => 0.90,
                    'details' => "Same contact number: {$beneficiary->contact_number}",
                ];
            }
        }

        // Email match
        if ($beneficiary->email) {
            $emailMatches = $query->where('email', $beneficiary->email)->get();
            foreach ($emailMatches as $match) {
                $matches[] = [
                    'beneficiary_id' => $match->id,
                    'beneficiary_no' => $match->beneficiary_no,
                    'name' => $match->full_name,
                    'match_type' => 'email',
                    'confidence' => 0.92,
                    'details' => "Same email: {$beneficiary->email}",
                ];
            }
        }

        return $matches;
    }

    /**
     * Find matches by address.
     */
    protected function findAddressMatches(Beneficiary $beneficiary, $query): array
    {
        $matches = [];

        if ($beneficiary->barangay) {
            $addressMatches = $query->where('barangay', $beneficiary->barangay)
                ->where('current_address', 'like', '%'.Str::substr($beneficiary->current_address, 0, 20).'%')
                ->get();

            foreach ($addressMatches as $match) {
                $addressSimilarity = $this->calculateStringSimilarity(
                    strtolower($beneficiary->current_address),
                    strtolower($match->current_address)
                );

                if ($addressSimilarity > 0.7) {
                    $matches[] = [
                        'beneficiary_id' => $match->id,
                        'beneficiary_no' => $match->beneficiary_no,
                        'name' => $match->full_name,
                        'match_type' => 'address',
                        'confidence' => $addressSimilarity * 0.75, // Lower confidence for address matches
                        'details' => "Similar address in {$beneficiary->barangay}",
                    ];
                }
            }
        }

        return $matches;
    }

    /**
     * Consolidate matches and calculate final confidence scores.
     */
    protected function consolidateMatches(array $matches): array
    {
        $consolidated = [];

        foreach ($matches as $match) {
            $key = $match['beneficiary_id'];

            if (! isset($consolidated[$key])) {
                $consolidated[$key] = $match;
                $consolidated[$key]['match_types'] = [$match['match_type']];
            } else {
                // Multiple match types increase confidence
                $consolidated[$key]['match_types'][] = $match['match_type'];
                $consolidated[$key]['confidence'] = min(1.0, $consolidated[$key]['confidence'] + 0.1);
                $consolidated[$key]['details'] .= '; '.$match['details'];
            }
        }

        return array_values($consolidated);
    }

    /**
     * Normalize name for comparison.
     */
    protected function normalizeName(string $name): string
    {
        return strtolower(trim(preg_replace('/\s+/', ' ', $name)));
    }

    /**
     * Calculate name similarity using Levenshtein distance.
     */
    protected function calculateNameSimilarity(string $name1, string $name2): float
    {
        $name1 = $this->normalizeName($name1);
        $name2 = $this->normalizeName($name2);

        if ($name1 === $name2) {
            return 1.0;
        }

        $maxLen = max(strlen($name1), strlen($name2));
        if ($maxLen === 0) {
            return 1.0;
        }

        $distance = levenshtein($name1, $name2);
        $similarity = 1 - ($distance / $maxLen);

        return max(0, $similarity);
    }

    /**
     * Calculate string similarity.
     */
    protected function calculateStringSimilarity(string $str1, string $str2): float
    {
        if ($str1 === $str2) {
            return 1.0;
        }

        $maxLen = max(strlen($str1), strlen($str2));
        if ($maxLen === 0) {
            return 1.0;
        }

        $distance = levenshtein($str1, $str2);
        $similarity = 1 - ($distance / $maxLen);

        return max(0, $similarity);
    }
}
