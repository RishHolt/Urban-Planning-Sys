import { useState, useEffect } from 'react';
import Input from '../../Input';
import { CheckCircle2, Loader2, AlertCircle, CircleDashed } from 'lucide-react';

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

type FieldStatus = 'idle' | 'loading' | 'success' | 'error';

export default function PrerequisitesStep({
    data,
    setData,
    errors,
    prerequisitesVerified,
    onVerificationChange,
}: PrerequisitesStepProps) {
    const [fieldStatus, setFieldStatus] = useState<{
        tax_dec: FieldStatus;
        barangay_permit: FieldStatus;
    }>({
        tax_dec: 'idle',
        barangay_permit: 'idle',
    });

    const [prerequisiteErrors, setPrerequisiteErrors] = useState<{
        tax_dec?: string;
        barangay_permit?: string;
        general?: string;
    }>({});

    const verifyField = async (field: 'tax_dec_ref_no' | 'barangay_permit_ref_no') => {
        const val = data[field];
        if (!val) {
            setFieldStatus((prev) => ({ ...prev, [field === 'tax_dec_ref_no' ? 'tax_dec' : 'barangay_permit']: 'idle' }));
            return;
        }

        const statusKey = field === 'tax_dec_ref_no' ? 'tax_dec' : 'barangay_permit';
        setFieldStatus((prev) => ({ ...prev, [statusKey]: 'loading' }));

        try {
            const response = await fetch('/api/verify-prerequisites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    tax_dec_ref_no: field === 'tax_dec_ref_no' ? val : (data.tax_dec_ref_no || null),
                    barangay_permit_ref_no: field === 'barangay_permit_ref_no' ? val : (data.barangay_permit_ref_no || null),
                }),
            });

            const result = await response.json();
            const verificationData = field === 'tax_dec_ref_no' ? result.tax_declaration : result.barangay_permit;

            // Update this field's specific status
            if (verificationData.verified) {
                setFieldStatus((prev) => ({ ...prev, [statusKey]: 'success' }));
                setPrerequisiteErrors((prev) => ({ ...prev, [statusKey]: undefined }));
            } else {
                setFieldStatus((prev) => ({ ...prev, [statusKey]: 'error' }));
                setPrerequisiteErrors((prev) => ({ ...prev, [statusKey]: verificationData.message }));
            }

            // Sync global state: BOTH MUST BE VERIFIED and PRESENT
            const isFullVerified = result.verified && !!data.tax_dec_ref_no && !!data.barangay_permit_ref_no;
            onVerificationChange(isFullVerified);

            // General error logic
            if (!result.verified && result.message && result.message.includes('required')) {
                setPrerequisiteErrors((prev) => ({ ...prev, general: undefined }));
            } else if (!result.verified) {
                setPrerequisiteErrors((prev) => ({ ...prev, general: result.message }));
            } else {
                setPrerequisiteErrors((prev) => ({ ...prev, general: undefined }));
            }

        } catch (error) {
            setFieldStatus((prev) => ({ ...prev, [statusKey]: 'error' }));
            setPrerequisiteErrors((prev) => ({
                general: 'Connection error during verification.',
            }));
            onVerificationChange(false);
        }
    };

    // Trigger verification for each field independently with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.tax_dec_ref_no) {
                verifyField('tax_dec_ref_no');
            } else {
                setFieldStatus(prev => ({ ...prev, tax_dec: 'idle' }));
                setPrerequisiteErrors(prev => ({ ...prev, tax_dec: undefined, general: undefined }));
                onVerificationChange(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [data.tax_dec_ref_no]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.barangay_permit_ref_no) {
                verifyField('barangay_permit_ref_no');
            } else {
                setFieldStatus(prev => ({ ...prev, barangay_permit: 'idle' }));
                setPrerequisiteErrors(prev => ({ ...prev, barangay_permit: undefined, general: undefined }));
                onVerificationChange(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [data.barangay_permit_ref_no]);

    const renderStatusIcon = (status: FieldStatus) => {
        switch (status) {
            case 'loading':
                return <Loader2 size={18} className="animate-spin text-primary" />;
            case 'success':
                return <CheckCircle2 size={18} className="text-green-500" />;
            case 'error':
                return <AlertCircle size={18} className="text-red-500" />;
            default:
                return <CircleDashed size={18} className="text-gray-300 dark:text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <AlertCircle size={20} className="text-primary" />
                </div>
                <p className="text-primary-dark dark:text-primary-light text-sm font-medium">
                    Prerequisites are verified in real-time. Please provide valid reference numbers to proceed.
                </p>
            </div>

            <div className="grid gap-6">
                <div className="relative group">
                    <Input
                        label="Tax Declaration Reference Number"
                        value={data.tax_dec_ref_no}
                        onChange={(e) => setData('tax_dec_ref_no', e.target.value)}
                        error={errors.tax_dec_ref_no || prerequisiteErrors.tax_dec}
                        required
                        placeholder="e.g. TD-2024-001"
                        className="pr-12"
                    />
                    <div className="absolute right-4 top-[42px] transition-all duration-300">
                        {renderStatusIcon(fieldStatus.tax_dec)}
                    </div>
                </div>

                <div className="relative group">
                    <Input
                        label="Barangay Permit Reference Number"
                        value={data.barangay_permit_ref_no}
                        onChange={(e) => setData('barangay_permit_ref_no', e.target.value)}
                        error={errors.barangay_permit_ref_no || prerequisiteErrors.barangay_permit}
                        required
                        placeholder="e.g. BP-2024-056"
                        className="pr-12"
                    />
                    <div className="absolute right-4 top-[42px] transition-all duration-300">
                        {renderStatusIcon(fieldStatus.barangay_permit)}
                    </div>
                </div>
            </div>

            {prerequisitesVerified && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                        <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-green-900 dark:text-green-300 text-sm font-bold">
                            Credentials Verified
                        </p>
                        <p className="text-green-800 dark:text-green-400 text-xs">
                            You may now proceed to the next phase of your application.
                        </p>
                    </div>
                </div>
            )}

            {prerequisiteErrors.general && !prerequisitesVerified && (
                <div className="p-3 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={14} />
                    {prerequisiteErrors.general}
                </div>
            )}
        </div>
    );
}
