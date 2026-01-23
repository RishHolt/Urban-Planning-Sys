<?php

namespace App\Services;

class TreasuryService
{
    /**
     * Verify Tax Declaration reference number.
     *
     * @return array{verified: bool, data: array, message: string}
     */
    public function verifyTaxDeclaration(string $refNo): array
    {
        // Simulate API Latency
        usleep(800000); 

        // Specific test keys for development
        $validKeys = ['TD-2024-001', 'TD-SAMPLE-SUCCESS'];

        if (!in_array(strtoupper($refNo), $validKeys)) {
            return [
                'verified' => false,
                'data' => null,
                'message' => 'Tax Declaration reference number not found in Treasury records.',
            ];
        }

        return [
            'verified' => true,
            'data' => [
                'reference_no' => $refNo,
                'owner_name' => 'Juan Dela Cruz',
                'property_address' => 'Block 1 Lot 2, Sample Street, Sample Barangay',
                'assessed_value' => 1500000.00,
                'tax_year' => date('Y'),
            ],
            'message' => 'Tax Declaration verified successfully',
        ];
    }

    /**
     * Verify payment OR number.
     *
     * @return array{verified: bool, data: array, message: string}
     */
    public function verifyPayment(string $orNumber): array
    {
        // Mock implementation - in production, this would call Treasury API
        return [
            'verified' => true,
            'data' => [
                'or_number' => $orNumber,
                'amount' => 5000.00,
                'payment_date' => date('Y-m-d'),
                'treasury_ref' => 'TREAS-'.date('Y').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            ],
            'message' => 'Payment verified successfully',
        ];
    }
}
