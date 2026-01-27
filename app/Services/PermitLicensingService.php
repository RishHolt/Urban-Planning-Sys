<?php

namespace App\Services;

class PermitLicensingService
{
    /**
     * Verify Barangay Permit reference number.
     *
     * @return array{verified: bool, data: array, message: string}
     */
    public function verifyBarangayPermit(string $refNo): array
    {
        // Simulate API Latency
        usleep(800000);

        // In development/testing, accept any non-empty reference number
        // In production, this would call the actual Permit & Licensing API
        if (app()->environment(['local', 'testing'])) {
            if (empty(trim($refNo)) || strtoupper(trim($refNo)) === 'NA') {
                return [
                    'verified' => false,
                    'data' => null,
                    'message' => 'Barangay Permit reference number is required.',
                ];
            }

            return [
                'verified' => true,
                'data' => [
                    'reference_no' => $refNo,
                    'barangay' => 'Sample Barangay',
                    'permit_type' => 'Barangay Clearance',
                    'issued_date' => date('Y-m-d', strtotime('-30 days')),
                    'valid_until' => date('Y-m-d', strtotime('+1 year')),
                ],
                'message' => 'Barangay Permit verified successfully',
            ];
        }

        // Production: Specific test keys for development
        $validKeys = ['BP-2024-056', 'BP-SAMPLE-SUCCESS'];

        if (! in_array(strtoupper($refNo), $validKeys)) {
            return [
                'verified' => false,
                'data' => null,
                'message' => 'Barangay Permit reference number not found or has expired.',
            ];
        }

        return [
            'verified' => true,
            'data' => [
                'reference_no' => $refNo,
                'barangay' => 'Sample Barangay',
                'permit_type' => 'Barangay Clearance',
                'issued_date' => date('Y-m-d', strtotime('-30 days')),
                'valid_until' => date('Y-m-d', strtotime('+1 year')),
            ],
            'message' => 'Barangay Permit verified successfully',
        ];
    }
}
