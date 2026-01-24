import Input from '../../Input';
import { User, Building2, Briefcase, Landmark } from 'lucide-react';

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
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ApplicantInformationStep({
    data,
    setData,
    errors,
}: ApplicantInformationStepProps) {
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
                        label="Representative Name"
                        value={data.representative_name}
                        onChange={(e) => setData('representative_name', e.target.value)}
                        error={errors.representative_name}
                        placeholder="Full name of the representative"
                        required
                    />
                    <Input
                        label="Lot Owner / Title Holder"
                        value={data.lot_owner}
                        onChange={(e) => setData('lot_owner', e.target.value)}
                        error={errors.lot_owner}
                        placeholder="Full name of the property owner"
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Lot Owner Contact Number"
                            value={data.lot_owner_contact_number}
                            onChange={(e) => setData('lot_owner_contact_number', e.target.value)}
                            error={errors.lot_owner_contact_number}
                            placeholder="Owner's contact number"
                            required
                        />
                        <Input
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
                    label="Contact Number"
                    value={data.contact_number}
                    onChange={(e) => setData('contact_number', e.target.value)}
                    error={errors.contact_number}
                    required
                />
                <Input
                    label="Contact Email"
                    type="email"
                    value={data.contact_email}
                    onChange={(e) => setData('contact_email', e.target.value)}
                    error={errors.contact_email}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Input
                    label="Tax Declaration Reference No."
                    value={data.tax_dec_ref_no}
                    onChange={(e) => setData('tax_dec_ref_no', e.target.value)}
                    error={errors.tax_dec_ref_no}
                    placeholder="e.g. TD-2024-001"
                />
                <Input
                    label="Barangay Permit Reference No."
                    value={data.barangay_permit_ref_no}
                    onChange={(e) => setData('barangay_permit_ref_no', e.target.value)}
                    error={errors.barangay_permit_ref_no}
                    placeholder="e.g. BP-2024-056"
                />
            </div>
        </div>
    );
}
