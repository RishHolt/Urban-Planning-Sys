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
        // Mock implementation - in production, this would call Treasury API
        // For now, return mock data structure
        return [
            'verified' => true,
            'data' => [
                'reference_no' => $refNo,
                'owner_name' => 'Mock Owner Name',
                'property_address' => 'Mock Property Address',
                'assessed_value' => 1000000.00,
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
