<?php

namespace App\Services;

class ZoningApplicationLabelService
{
    /**
     * Get application type labels.
     *
     * @return array<string, string>
     */
    public static function getApplicationTypeLabels(): array
    {
        return [
            'new_construction' => 'New Construction',
            'renovation' => 'Renovation',
            'change_of_use' => 'Change of Use',
            'others' => 'Others',
        ];
    }

    /**
     * Get land type labels.
     *
     * @return array<string, string>
     */
    public static function getLandTypeLabels(): array
    {
        return [
            'residential' => 'Residential',
            'commercial' => 'Commercial',
            'industrial' => 'Industrial',
            'agricultural' => 'Agricultural',
            'mixed-use' => 'Mixed-use',
            'institutional' => 'Institutional',
            'open-space' => 'Open Space',
            'special-use' => 'Special Use',
        ];
    }

    /**
     * Get proposed use labels.
     *
     * @return array<string, string>
     */
    public static function getProposedUseLabels(): array
    {
        return [
            'residential' => 'Residential',
            'commercial' => 'Commercial',
            'mixed_use' => 'Mixed-use',
            'institutional' => 'Institutional',
        ];
    }

    /**
     * Get applicant type labels.
     *
     * @return array<string, string>
     */
    public static function getApplicantTypeLabels(): array
    {
        return [
            'individual' => 'Individual',
            'company' => 'Company',
            'developer' => 'Developer',
            'Government' => 'Government',
        ];
    }

    /**
     * Get label for application type.
     */
    public static function getApplicationTypeLabel(?string $type): string
    {
        $labels = self::getApplicationTypeLabels();

        return $labels[$type] ?? $type ?? '';
    }

    /**
     * Get label for land type.
     */
    public static function getLandTypeLabel(?string $type): string
    {
        $labels = self::getLandTypeLabels();

        return $labels[$type] ?? $type ?? '';
    }

    /**
     * Get label for proposed use.
     */
    public static function getProposedUseLabel(?string $type): string
    {
        $labels = self::getProposedUseLabels();

        return $labels[$type] ?? $type ?? '';
    }

    /**
     * Get label for applicant type.
     */
    public static function getApplicantTypeLabel(?string $type): string
    {
        $labels = self::getApplicantTypeLabels();

        return $labels[$type] ?? $type ?? '';
    }
}
