import { useState, useEffect, useRef } from 'react';
import Input from '../../Input';
import { User, Building2, Briefcase, Landmark, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ApplicantInformationStepProps {
    data: {
        applicant_type: 'individual' | 'business' | 'developer' | 'institution';
        is_representative: boolean;
        representative_name: string;
        lot_owner: string;
        lot_owner_contact_number: string;
        lot_owner_contact_email: string;
        contact_number: string;
        contact_email: string;
        tax_dec_ref_no: string;
        barangay_permit_ref_no: string;
        is_td_verified: boolean;
        is_bp_verified: boolean;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ApplicantInformationStep({
    data,
    setData,
    errors,
}: ApplicantInformationStepProps) {
    const [verifyingTD, setVerifyingTD] = useState(false);
    const [verifyingBP, setVerifyingBP] = useState(false);
    const [tdError, setTdError] = useState<string | null>(null);
    const [bpError, setBpError] = useState<string | null>(null);

    const tdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const bpTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleVerifyTD = async (value: string) => {
        if (!value || value.length < 5) {
            setData('is_td_verified', false);
            setTdError(null);
            return;
        }

        setVerifyingTD(true);
        setTdError(null);

        try {
            const response = await fetch('/api/verify-prerequisites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    tax_dec_ref_no: value,
                    barangay_permit_ref_no: 'NA'
                }),
            });

            const result = await response.json();

            if (result.tax_declaration?.verified) {
                setData('is_td_verified', true);
            } else {
                setData('is_td_verified', false);
                setTdError(result.tax_declaration?.message || 'Verification failed');
            }
        } catch (error) {
            setData('is_td_verified', false);
            setTdError('An error occurred during verification.');
        } finally {
            setVerifyingTD(false);
        }
    };

    const handleVerifyBP = async (value: string) => {
        if (!value || value.length < 5) {
            setData('is_bp_verified', false);
            setBpError(null);
            return;
        }

        setVerifyingBP(true);
        setBpError(null);

        try {
            const response = await fetch('/api/verify-prerequisites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    tax_dec_ref_no: 'NA',
                    barangay_permit_ref_no: value
                }),
            });

            const result = await response.json();

            if (result.barangay_permit?.verified) {
                setData('is_bp_verified', true);
            } else {
                setData('is_bp_verified', false);
                setBpError(result.barangay_permit?.message || 'Verification failed');
            }
        } catch (error) {
            setData('is_bp_verified', false);
            setBpError('An error occurred during verification.');
        } finally {
            setVerifyingBP(false);
        }
    };

    // Auto-verify TD
    useEffect(() => {
        if (tdTimeoutRef.current) clearTimeout(tdTimeoutRef.current);

        if (data.tax_dec_ref_no && !data.is_td_verified) {
            tdTimeoutRef.current = setTimeout(() => {
                handleVerifyTD(data.tax_dec_ref_no);
            }, 800);
        }

        return () => {
            if (tdTimeoutRef.current) clearTimeout(tdTimeoutRef.current);
        };
    }, [data.tax_dec_ref_no, data.is_td_verified]);

    // Auto-verify BP
    useEffect(() => {
        if (bpTimeoutRef.current) clearTimeout(bpTimeoutRef.current);

        if (data.barangay_permit_ref_no && !data.is_bp_verified) {
            bpTimeoutRef.current = setTimeout(() => {
                handleVerifyBP(data.barangay_permit_ref_no);
            }, 800);
        }

        return () => {
            if (bpTimeoutRef.current) clearTimeout(bpTimeoutRef.current);
        };
    }, [data.barangay_permit_ref_no, data.is_bp_verified]);

    const applicantTypes = [
        {
            value: 'individual',
            label: 'Individual',
            description: 'Owners, representatives, tenants (Residential/Small Biz)',
            icon: User,
        },
        {
            value: 'business',
            label: 'Business/Corporate',
            description: 'Companies, commercial establishments, factories',
            icon: Briefcase,
        },
        {
            value: 'developer',
            label: 'Developer',
            description: 'Subdivision developers, housing projects',
            icon: Building2,
        },
        {
            value: 'institution',
            label: 'Government/Institutional',
            description: 'Public projects, schools, hospitals',
            icon: Landmark,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Applicant Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applicantTypes.map((type) => (
                        <div
                            key={type.value}
                            className={`
                                relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                                ${data.applicant_type === type.value
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                }
                            `}
                            onClick={() => setData('applicant_type', type.value)}
                        >
                            <div className={`
                                p-2 rounded-lg
                                ${data.applicant_type === type.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}
                            `}>
                                <type.icon size={20} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${data.applicant_type === type.value ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {type.label}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {type.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="is_representative"
                    checked={data.is_representative}
                    onChange={(e) => setData('is_representative', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_representative" className="text-sm text-gray-700 dark:text-gray-300">
                    I am applying as a representative
                </label>
            </div>

            {data.is_representative ? (
                <>
                    <Input
                        id="representative_name"
                        name="representative_name"
                        label="Representative Name"
                        value={data.representative_name}
                        onChange={(e) => setData('representative_name', e.target.value)}
                        error={errors.representative_name}
                        placeholder="Full name of the representative"
                        required
                    />
                    <Input
                        id="lot_owner"
                        name="lot_owner"
                        label="Lot Owner / Title Holder"
                        value={data.lot_owner}
                        onChange={(e) => setData('lot_owner', e.target.value)}
                        error={errors.lot_owner}
                        placeholder="Full name of the property owner"
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            id="lot_owner_contact_number"
                            name="lot_owner_contact_number"
                            label="Lot Owner Contact Number"
                            value={data.lot_owner_contact_number}
                            onChange={(e) => setData('lot_owner_contact_number', e.target.value)}
                            error={errors.lot_owner_contact_number}
                            placeholder="Owner's contact number"
                            required
                        />
                        <Input
                            id="lot_owner_contact_email"
                            name="lot_owner_contact_email"
                            label="Lot Owner Contact Email"
                            type="email"
                            value={data.lot_owner_contact_email}
                            onChange={(e) => setData('lot_owner_contact_email', e.target.value)}
                            error={errors.lot_owner_contact_email}
                            placeholder="Owner's email address"
                        />
                    </div>
                </>
            ) : (
                <Input
                    id="lot_owner"
                    name="lot_owner"
                    label="Applicant Name"
                    value={data.lot_owner}
                    onChange={(e) => setData('lot_owner', e.target.value)}
                    error={errors.lot_owner}
                    placeholder="Your full name"
                    required
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    id="contact_number"
                    name="contact_number"
                    label="Contact Number"
                    value={data.contact_number}
                    onChange={(e) => setData('contact_number', e.target.value)}
                    error={errors.contact_number}
                    required
                />
                <Input
                    id="contact_email"
                    name="contact_email"
                    label="Contact Email"
                    type="email"
                    value={data.contact_email}
                    onChange={(e) => setData('contact_email', e.target.value)}
                    error={errors.contact_email}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                    <div className="relative">
                        <Input
                            id="tax_dec_ref_no"
                            name="tax_dec_ref_no"
                            label="Tax Declaration Reference No."
                            value={data.tax_dec_ref_no}
                            onChange={(e) => {
                                setData('tax_dec_ref_no', e.target.value);
                                if (data.is_td_verified) setData('is_td_verified', false);
                            }}
                            error={errors.tax_dec_ref_no}
                            placeholder="e.g. TD-2024-001"
                        />
                        {verifyingTD && (
                            <div className="absolute right-3 top-[34px]">
                                <Loader2 size={16} className="animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    {data.tax_dec_ref_no && data.is_td_verified && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Verified in Treasury records (Juan Dela Cruz)
                        </p>
                    )}
                    {data.tax_dec_ref_no && !data.is_td_verified && tdError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> {tdError}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="relative">
                        <Input
                            id="barangay_permit_ref_no"
                            name="barangay_permit_ref_no"
                            label="Barangay Permit Reference No."
                            value={data.barangay_permit_ref_no}
                            onChange={(e) => {
                                setData('barangay_permit_ref_no', e.target.value);
                                if (data.is_bp_verified) setData('is_bp_verified', false);
                            }}
                            error={errors.barangay_permit_ref_no}
                            placeholder="e.g. BP-2024-056"
                        />
                        {verifyingBP && (
                            <div className="absolute right-3 top-[34px]">
                                <Loader2 size={16} className="animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    {data.barangay_permit_ref_no && data.is_bp_verified && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Verified Barangay Permit (Valid until 2025)
                        </p>
                    )}
                    {data.barangay_permit_ref_no && !data.is_bp_verified && bpError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> {bpError}
                        </p>
                    )}
                </div>
            </div>

            {((data.tax_dec_ref_no && !data.is_td_verified) || (data.barangay_permit_ref_no && !data.is_bp_verified)) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>Test Mode:</strong> Verification is automatic. Use <code>TD-2024-001</code> and <code>BP-2024-056</code> for success.
                    </p>
                </div>
            )}
        </div>
    );
}
