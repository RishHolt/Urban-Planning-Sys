import Input from '../../Input';

interface ApplicantInfoStepProps {
    data: {
        applicant_type: 'owner' | 'authorized_rep' | 'contractor';
        contact_number: string;
        contact_email: string;
    };
    setData: (key: string, value: unknown) => void;
    errors: Record<string, string>;
}

export default function ApplicantInfoStep({
    data,
    setData,
    errors,
}: ApplicantInfoStepProps) {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Phase 1: Applicant Information</strong> - Provide your contact information for this application.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Applicant Type *
                </label>
                <select
                    value={data.applicant_type}
                    onChange={(e) => setData('applicant_type', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                >
                    <option value="owner">Owner</option>
                    <option value="authorized_rep">Authorized Representative</option>
                    <option value="contractor">Contractor</option>
                </select>
                {errors.applicant_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.applicant_type}</p>
                )}
            </div>

            <Input
                label="Contact Number *"
                value={data.contact_number}
                onChange={(e) => setData('contact_number', e.target.value)}
                error={errors.contact_number}
                required
                placeholder="09XXXXXXXXX"
            />

            <Input
                label="Contact Email"
                type="email"
                value={data.contact_email}
                onChange={(e) => setData('contact_email', e.target.value)}
                error={errors.contact_email}
                placeholder="your.email@example.com"
            />
        </div>
    );
}
