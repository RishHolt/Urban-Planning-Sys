import { useState } from 'react';
import Input from '../../Input';
import Button from '../../Button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PrerequisitesStepProps {
    data: {
        tax_dec_ref_no: string;
        barangay_permit_ref_no: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
    prerequisitesVerified: boolean;
    onVerificationChange: (verified: boolean) => void;
}

export default function PrerequisitesStep({
    data,
    setData,
    errors,
    prerequisitesVerified,
    onVerificationChange,
}: PrerequisitesStepProps) {
    const [verifying, setVerifying] = useState(false);
    const [prerequisiteErrors, setPrerequisiteErrors] = useState<{
        tax_dec?: string;
        barangay_permit?: string;
        general?: string;
    }>({});

    const verifyPrerequisites = async () => {
        if (!data.tax_dec_ref_no || !data.barangay_permit_ref_no) {
            setPrerequisiteErrors({
                general: 'Please enter both Tax Declaration and Barangay Permit reference numbers.',
            });
            return;
        }

        setVerifying(true);
        setPrerequisiteErrors({});

        try {
            const response = await fetch('/api/verify-prerequisites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    tax_dec_ref_no: data.tax_dec_ref_no,
                    barangay_permit_ref_no: data.barangay_permit_ref_no,
                }),
            });

            const result = await response.json();

            if (result.verified) {
                onVerificationChange(true);
                setPrerequisiteErrors({});
            } else {
                onVerificationChange(false);
                setPrerequisiteErrors({
                    tax_dec: result.tax_declaration?.verified ? undefined : result.tax_declaration?.message,
                    barangay_permit: result.barangay_permit?.verified ? undefined : result.barangay_permit?.message,
                    general: result.message,
                });
            }
        } catch (error) {
            onVerificationChange(false);
            setPrerequisiteErrors({
                general: 'Failed to verify prerequisites. Please try again.',
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleTaxDecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('tax_dec_ref_no', e.target.value);
        if (prerequisitesVerified) {
            onVerificationChange(false);
        }
        setPrerequisiteErrors({});
    };

    const handleBarangayPermitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('barangay_permit_ref_no', e.target.value);
        if (prerequisitesVerified) {
            onVerificationChange(false);
        }
        setPrerequisiteErrors({});
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 0: Prerequisites</strong> - You must verify both prerequisites before proceeding with your application.
                </p>
            </div>

            <div className="space-y-4">
                <Input
                    label="Tax Declaration Reference Number"
                    value={data.tax_dec_ref_no}
                    onChange={handleTaxDecChange}
                    error={errors.tax_dec_ref_no || prerequisiteErrors.tax_dec}
                    required
                    disabled={prerequisitesVerified}
                    placeholder="Enter Tax Declaration reference number"
                />

                <Input
                    label="Barangay Permit Reference Number"
                    value={data.barangay_permit_ref_no}
                    onChange={handleBarangayPermitChange}
                    error={errors.barangay_permit_ref_no || prerequisiteErrors.barangay_permit}
                    required
                    disabled={prerequisitesVerified}
                    placeholder="Enter Barangay Permit reference number"
                />

                {!prerequisitesVerified && (
                    <div>
                        <Button
                            type="button"
                            onClick={verifyPrerequisites}
                            disabled={verifying || !data.tax_dec_ref_no || !data.barangay_permit_ref_no}
                            className="w-full"
                        >
                            {verifying ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Prerequisites'
                            )}
                        </Button>
                    </div>
                )}

                {prerequisitesVerified && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                            All prerequisites verified! You can proceed to the next step.
                        </span>
                    </div>
                )}

                {prerequisiteErrors.general && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                                {prerequisiteErrors.general}
                            </p>
                            {prerequisiteErrors.tax_dec && (
                                <p className="text-red-700 dark:text-red-300 text-xs mt-1">
                                    Tax Declaration: {prerequisiteErrors.tax_dec}
                                </p>
                            )}
                            {prerequisiteErrors.barangay_permit && (
                                <p className="text-red-700 dark:text-red-300 text-xs mt-1">
                                    Barangay Permit: {prerequisiteErrors.barangay_permit}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
