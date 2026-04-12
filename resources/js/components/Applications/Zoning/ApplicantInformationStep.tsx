import Input from '../../Input';
import { User, Users, Building2 } from 'lucide-react';

interface ApplicantInformationStepProps {
    data: {
        applicant_type: 'individual' | 'representative' | 'corporation';
        is_representative: boolean;
        representative_name: string;
        lot_owner: string;
        lot_owner_contact_number: string;
        lot_owner_contact_email: string;
        contact_number: string;
        contact_email: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

const applicantTypes = [
    {
        value: 'individual',
        label: 'Individual',
        description: 'Personal applicant / lot owner',
        icon: User,
    },
    {
        value: 'representative',
        label: 'Representative',
        description: 'Applying on behalf of the lot owner',
        icon: Users,
    },
    {
        value: 'corporation',
        label: 'Corporation / Company',
        description: 'Business entity or organization',
        icon: Building2,
    },
];

export default function ApplicantInformationStep({
    data,
    setData,
    errors,
}: ApplicantInformationStepProps) {
    const isRepresentative = data.applicant_type === 'representative';

    const handleTypeChange = (value: string) => {
        setData('applicant_type', value);
        setData('is_representative', value === 'representative');
    };

    return (
        <div className="space-y-6">
            {/* Applicant Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Applicant Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {applicantTypes.map((type) => {
                        const selected = data.applicant_type === type.value;
                        return (
                            <div
                                key={type.value}
                                onClick={() => handleTypeChange(type.value)}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    selected
                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                }`}
                            >
                                <div className={`p-2 rounded-lg shrink-0 ${
                                    selected
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                    <type.icon size={18} />
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {type.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {type.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Representative fields */}
            {isRepresentative ? (
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
                <>
                    <Input
                        id="lot_owner"
                        name="lot_owner"
                        label={data.applicant_type === 'corporation' ? 'Company / Organization Name' : 'Applicant Name'}
                        value={data.lot_owner}
                        onChange={(e) => setData('lot_owner', e.target.value)}
                        error={errors.lot_owner}
                        placeholder={data.applicant_type === 'corporation' ? 'Registered company name' : 'Your full name'}
                        required
                    />
                    {data.applicant_type === 'corporation' && (
                        <Input
                            id="representative_name"
                            name="representative_name"
                            label="Representative Name"
                            value={data.representative_name}
                            onChange={(e) => setData('representative_name', e.target.value)}
                            error={errors.representative_name}
                            placeholder="Authorized representative of the company"
                            required
                        />
                    )}
                </>
            )}

            {/* Contact Info */}
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
        </div>
    );
}
